import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { Resend } from 'resend';
import { createServer as createViteServer } from 'vite';
import { query, getPool } from './src/db/index.js';
import { initDatabase } from './src/db/initDb.js';
import { uploadImageToCloudinary, initCloudinary } from './src/services/cloudinary.js';
import { products as fallbackProducts, categories as fallbackCategories } from './src/data/products.js';

let resendClient: Resend | null = null;
function getResend() {
  const apiKey = process.env.RESEND_API_KEY || 're_3MqmhJ7P_7fNquDpgajFcPwXcLTKyNQtc';
  if (!resendClient && apiKey) {
    resendClient = new Resend(apiKey);
  }
  return resendClient;
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Multer memory storage for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB limit
});

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Initialize database tables on server start if DATABASE_URL is available
initDatabase().catch(err => {
  console.error('Failed to run initDatabase on startup:', err);
});

// ─────────────────────────────────────────────────────────────
// 1. HEALTH & SYSTEM CHECK ENDPOINT
// ─────────────────────────────────────────────────────────────
app.get('/api/health', async (req, res) => {
  const dbConnected = !!getPool();
  let dbStatus = 'Not Configured (DATABASE_URL missing)';
  let dbRows = 0;

  if (dbConnected) {
    try {
      const result = await query('SELECT COUNT(*) FROM products');
      dbStatus = 'Connected to Neon PostgreSQL';
      dbRows = parseInt(result.rows[0].count, 10);
    } catch (e) {
      dbStatus = `Error connecting: ${e.message}`;
    }
  }

  const cloudinaryConfigured = initCloudinary();

  res.json({
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    database: {
      connected: dbConnected,
      status: dbStatus,
      productCount: dbRows,
      provider: 'Neon.tech (PostgreSQL)'
    },
    cloudinary: {
      configured: cloudinaryConfigured,
      status: cloudinaryConfigured ? 'Configured & ready' : 'Not configured (Missing CLOUDINARY_CLOUD_NAME)'
    },
    timestamp: new Date().toISOString()
  });
});

// ─────────────────────────────────────────────────────────────
// 2. CLOUDINARY IMAGE UPLOAD ENDPOINT
// ─────────────────────────────────────────────────────────────
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.image) {
      return res.status(400).json({ error: 'No image file or base64 image provided' });
    }

    let result;
    if (req.file) {
      result = await uploadImageToCloudinary(req.file.buffer, {
        folder: req.body.folder || 'atlasmall_products',
        mimetype: req.file.mimetype
      });
    } else if (req.body.image) {
      // Base64 string upload
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');
      result = await uploadImageToCloudinary(buffer, {
        folder: req.body.folder || 'atlasmall_products'
      });
    }

    res.json({
      success: true,
      url: result.url,
      public_id: result.public_id,
      provider: result.provider
    });
  } catch (error) {
    console.error('Upload endpoint error:', error);
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. PRODUCTS ENDPOINTS (Neon PostgreSQL + Fallback)
// ─────────────────────────────────────────────────────────────
app.get('/api/products', async (req, res) => {
  try {
    if (getPool()) {
      const { category, storeId, search } = req.query;
      let sql = 'SELECT * FROM products';
      const params = [];
      const conditions = [];

      if (category && category !== 'all') {
        params.push(category);
        conditions.push(`category_id = $${params.length}`);
      }
      if (storeId) {
        params.push(storeId);
        conditions.push(`store_id = $${params.length}`);
      }
      if (search) {
        params.push(`%${search}%`);
        conditions.push(`name ILIKE $${params.length}`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';

      const result = await query(sql, params);
      const mapped = result.rows.map(r => ({
        id: r.id,
        name: r.name,
        category: r.category_id,
        price: Number(r.price),
        oldPrice: r.old_price ? Number(r.old_price) : null,
        rating: Number(r.rating || 5.0),
        reviews: r.reviews || 0,
        img: r.img, // Cloudinary URL
        badge: r.badge,
        collections: r.collections || [],
        storeId: r.store_id,
        storeName: r.store_name,
        description: r.description,
        stock: r.stock
      }));

      return res.json(mapped);
    }

    // Fallback if DATABASE_URL is missing
    res.json(fallbackProducts);
  } catch (error) {
    console.error('GET /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const { name, category, price, oldPrice, img, badge, collections, storeId, storeName, description, stock } = req.body;

    if (!name || !price || !img) {
      return res.status(400).json({ error: 'Name, price and image URL are required' });
    }

    if (getPool()) {
      const targetStoreId = storeId || 'vogue_art';
      const targetStoreName = storeName || 'Vogue Art';
      const targetCategory = category || 'all';

      // Auto-ensure store exists in stores table to prevent FK constraint error
      await query(
        `INSERT INTO stores (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [targetStoreId, targetStoreName, 'Boutique Store']
      );

      // Auto-ensure category exists in categories table to prevent FK constraint error
      await query(
        `INSERT INTO categories (id, label, name) VALUES ($1, $2, $2) ON CONFLICT (id) DO NOTHING`,
        [targetCategory, targetCategory]
      );

      const result = await query(
        `INSERT INTO products (name, category_id, price, old_price, rating, reviews, img, badge, collections, store_id, store_name, description, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          name,
          targetCategory,
          price,
          oldPrice || null,
          5.0,
          0,
          img, // Store Cloudinary URL in Neon DB
          badge || 'Yeni',
          collections || ['flash'],
          targetStoreId,
          targetStoreName,
          description || '',
          stock || 10
        ]
      );

      const r = result.rows[0];
      return res.status(201).json({
        id: r.id,
        name: r.name,
        category: r.category_id,
        price: Number(r.price),
        oldPrice: r.old_price ? Number(r.old_price) : null,
        rating: Number(r.rating),
        reviews: r.reviews,
        img: r.img,
        badge: r.badge,
        collections: r.collections,
        storeId: r.store_id,
        storeName: r.store_name,
        description: r.description,
        stock: r.stock
      });
    }

    // Local fallback creation
    const newProduct = {
      id: Date.now(),
      name,
      category: category || 'all',
      price: Number(price),
      oldPrice: oldPrice ? Number(oldPrice) : null,
      rating: 5.0,
      reviews: 0,
      img,
      badge: badge || 'Yeni',
      collections: collections || ['flash'],
      storeId: storeId || 'vogue_art',
      storeName: storeName || 'Vogue Art',
      description,
      stock: stock || 10
    };

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (getPool()) {
      await query('DELETE FROM products WHERE id = $1', [id]);
      return res.json({ success: true, message: 'Product deleted from Neon database' });
    }
    res.json({ success: true, message: 'Deleted locally' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. CATEGORIES ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.get('/api/categories', async (req, res) => {
  try {
    if (getPool()) {
      const result = await query('SELECT * FROM categories ORDER BY label ASC');
      return res.json(result.rows);
    }
    res.json(fallbackCategories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. STORES ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.get('/api/stores', async (req, res) => {
  try {
    if (getPool()) {
      const result = await query('SELECT * FROM stores');
      return res.json(result.rows);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/stores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo, banner, description, phone } = req.body;

    if (getPool()) {
      const result = await query(
        `INSERT INTO stores (id, name, logo, banner, description, phone)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (id) DO UPDATE
         SET name = EXCLUDED.name,
             logo = COALESCE(EXCLUDED.logo, stores.logo),
             banner = COALESCE(EXCLUDED.banner, stores.banner),
             description = COALESCE(EXCLUDED.description, stores.description),
             phone = COALESCE(EXCLUDED.phone, stores.phone)
         RETURNING *`,
        [id, name, logo, banner, description, phone]
      );
      return res.json(result.rows[0]);
    }

    res.json({ id, name, logo, banner, description, phone });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 6. ORDERS ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    if (getPool()) {
      const { userEmail, storeId } = req.query;
      let sql = 'SELECT * FROM orders';
      const params = [];
      const conditions = [];

      if (userEmail) {
        params.push(userEmail);
        conditions.push(`user_email = $${params.length}`);
      }
      if (storeId) {
        params.push(storeId);
        conditions.push(`store_id = $${params.length}`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, params);
      return res.json(result.rows);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { userEmail, storeId, items, totalAmount, shippingAddress, paymentMethod } = req.body;
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    if (getPool()) {
      const targetStoreId = storeId || 'vogue_art';
      await query(
        `INSERT INTO stores (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
        [targetStoreId, targetStoreId, 'Boutique Store']
      );

      const result = await query(
        `INSERT INTO orders (id, user_email, store_id, items, total_amount, shipping_address, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [orderId, userEmail, targetStoreId, JSON.stringify(items), totalAmount, shippingAddress, paymentMethod || 'Nağd']
      );
      return res.status(201).json(result.rows[0]);
    }

    res.status(201).json({
      id: orderId,
      user_email: userEmail,
      store_id: storeId,
      items,
      total_amount: totalAmount,
      status: 'Gözləmədə',
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 7. USERS & AUTH ENDPOINTS
// ─────────────────────────────────────────────────────────────
app.get('/api/users', async (req, res) => {
  try {
    if (getPool()) {
      const result = await query('SELECT email, name, role, status, store_id as "storeId", store_name as "storeName", store_category as "storeCategory", phone, created_at as "createdAt" FROM users ORDER BY created_at DESC');
      return res.json(result.rows);
    }
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const INITIAL_ADMIN_EMAILS = ['rovshan.mammad03@gmail.com', 'mahmudovnihad5b37@gmail.com'];

app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, password, role, status, storeId, storeName, storeCategory, phone } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: 'E-poçt, ad və şifrə mütləqdir.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const isAdminEmail = INITIAL_ADMIN_EMAILS.includes(cleanEmail);

    if (getPool()) {
      const existing = await query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [cleanEmail]);
      if (existing.rows.length > 0) {
        return res.status(400).json({ error: 'Bu email artıq qeydiyyatdan keçib.' });
      }

      const userRole = isAdminEmail ? 'superadmin' : (role || 'user');
      const userStatus = isAdminEmail ? 'active' : (status || (userRole === 'vendor' ? 'pending' : 'active'));

      if (userRole === 'vendor' && storeId) {
        await query(
          `INSERT INTO stores (id, name, owner_email, phone)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, owner_email = EXCLUDED.owner_email, phone = EXCLUDED.phone`,
          [storeId, storeName || name, cleanEmail, phone || null]
        );
      }

      const result = await query(
        `INSERT INTO users (email, name, password, role, status, store_id, store_name, store_category, phone)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING email, name, role, status, store_id as "storeId", store_name as "storeName", store_category as "storeCategory", phone, created_at as "createdAt"`,
        [cleanEmail, name, password, userRole, userStatus, storeId || null, storeName || null, storeCategory || null, phone || null]
      );

      return res.status(201).json(result.rows[0]);
    }

    res.status(201).json({ email: cleanEmail, name, role: isAdminEmail ? 'superadmin' : (role || 'user'), status: 'active' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'E-poçt və şifrə daxil edin.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (cleanEmail === 'qonaq@atlasmall.az') {
      return res.json({
        email: 'qonaq@atlasmall.az',
        name: 'Qonaq İstifadəçi',
        role: 'user',
        status: 'active'
      });
    }

    if (getPool()) {
      const result = await query(
        `SELECT email, name, password, role, status, store_id as "storeId", store_name as "storeName", store_category as "storeCategory", phone, created_at as "createdAt"
         FROM users WHERE LOWER(email) = LOWER($1)`,
        [cleanEmail]
      );

      if (result.rows.length === 0 || result.rows[0].password !== password) {
        return res.status(401).json({ error: 'E-poçt və ya şifrə yanlışdır.' });
      }

      const user = result.rows[0];
      if (user.status === 'suspended') {
        return res.status(403).json({ error: 'Bu hesab dondurulmuşdur. Ətraflı məlumat üçün AtlasMall ilə əlaqə saxlayın.' });
      }

      // If authorized admin email, ensure role is superadmin
      if (INITIAL_ADMIN_EMAILS.includes(cleanEmail) && user.role !== 'superadmin') {
        user.role = 'superadmin';
        await query('UPDATE users SET role = $1 WHERE LOWER(email) = $2', ['superadmin', cleanEmail]);
      }

      delete user.password;
      return res.json(user);
    }

    res.status(401).json({ error: 'Verilənlər bazası qoşulmayıb.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/status', async (req, res) => {
  try {
    const { email, status } = req.body;
    if (!email || !status) {
      return res.status(400).json({ error: 'Email və status vacibdir.' });
    }

    if (getPool()) {
      const result = await query(
        `UPDATE users SET status = $1 WHERE LOWER(email) = LOWER($2)
         RETURNING email, name, role, status, store_id as "storeId", store_name as "storeName", store_category as "storeCategory", phone`,
        [status, email]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'İstifadəçi tapılmadı.' });
      }
      return res.json(result.rows[0]);
    }

    res.json({ email, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:email', async (req, res) => {
  try {
    const { email } = req.params;
    if (getPool()) {
      await query('DELETE FROM users WHERE LOWER(email) = LOWER($1)', [email]);
      return res.json({ success: true, message: 'İstifadəçi bazadan silindi.' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 8. EMAIL VERIFICATION (RESEND)
// ─────────────────────────────────────────────────────────────
app.post('/api/auth/send-code', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'E-poçt ünvanı vacibdir.' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();

    if (getPool()) {
      await query(
        `INSERT INTO verification_codes (email, code, created_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (email) DO UPDATE SET code = EXCLUDED.code, created_at = CURRENT_TIMESTAMP`,
        [email.toLowerCase(), code]
      );
    }

    const resend = getResend();
    if (resend) {
      try {
        const sendResult = await resend.emails.send({
          from: 'AtlasMall <onboarding@resend.dev>',
          to: [email],
          subject: 'AtlasMall - Hesab Təsdiqləmə Kodu',
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; color: #333;">
              <div style="max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 12px; border: 1px solid #eee;">
                <h2 style="color: #111; font-size: 22px; margin-bottom: 10px;">AtlasMall-a Xoş Gəldiniz!</h2>
                <p style="color: #555; line-height: 1.5;">Qeydiyyatınızı tamamlamaq üçün təsdiqləmə kodunuz:</p>
                <div style="background: #0f172a; color: #f59e0b; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 18px; text-align: center; border-radius: 8px; margin: 25px 0;">
                  ${code}
                </div>
                <p style="color: #888; font-size: 13px;">Əgər bu sorğunu siz etməmisinizsə, bu məktubu nəzərə almayın.</p>
              </div>
            </div>
          `
        });

        if (sendResult.error) {
          console.warn('[Resend Email Notice]: Standard sandbox restriction or validation notice:', sendResult.error.message || sendResult.error);
          // If Resend fails due to sandbox/validation restriction, fallback gracefully so user flow is uninterrupted
          return res.json({ 
            success: true, 
            message: 'Təsdiqləmə kodu yaradıldı.',
            devCode: code 
          });
        }

        return res.json({ success: true, message: 'Təsdiqləmə kodu Gmail ünvanınıza göndərildi.' });
      } catch (emailErr: any) {
        console.error('Resend email error:', emailErr);
        return res.json({ 
          success: true, 
          message: 'Təsdiqləmə kodu yaradıldı.', 
          devCode: code 
        });
      }
    } else {
      return res.json({ 
        success: true, 
        message: 'Təsdiqləmə kodu yaradıldı.',
        devCode: code 
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'E-poçt və kod vacibdir.' });
    }

    if (getPool()) {
      const result = await query(
        'SELECT * FROM verification_codes WHERE LOWER(email) = LOWER($1)',
        [email]
      );
      if (result.rows.length === 0 || result.rows[0].code !== code.toString().trim()) {
        return res.status(400).json({ error: 'Təsdiqləmə kodu yanlışdır.' });
      }

      await query('DELETE FROM verification_codes WHERE LOWER(email) = LOWER($1)', [email]);
      return res.json({ success: true, message: 'E-poçt uğurla təsdiqləndi.' });
    }

    return res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────
// VITE MIDDLEWARE / PRODUCTION STATIC SERVING
// ─────────────────────────────────────────────────────────────
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA Fallback: Handles all remaining GET requests without using path-to-regexp wildcard strings
    app.use((req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [AtlasMall Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
