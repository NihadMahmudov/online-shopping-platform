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
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

      // Fetch comments for all products
      let commentsByProduct: Record<string, any[]> = {};
      try {
        const commentsRes = await query('SELECT * FROM product_comments ORDER BY created_at DESC');
        commentsRes.rows.forEach(c => {
          const pid = String(c.product_id);
          if (!commentsByProduct[pid]) commentsByProduct[pid] = [];
          commentsByProduct[pid].push({
            id: c.id,
            productId: c.product_id,
            userEmail: c.user_email,
            name: c.name,
            rating: Number(c.rating || 5),
            text: c.text,
            date: c.date
          });
        });
      } catch (cErr) {
        console.warn('Could not fetch product comments:', cErr);
      }

      const mapped = result.rows.map(r => {
        const pid = String(r.id);
        const pComments = commentsByProduct[pid] || [];
        const reviewsCount = pComments.length > 0 ? pComments.length : (r.reviews || 0);
        let effectiveRating = Number(r.rating || 5.0);
        if (pComments.length > 0) {
          const sum = pComments.reduce((acc, c) => acc + c.rating, 0);
          effectiveRating = Number((sum / pComments.length).toFixed(1));
        }

        let parsedImages: string[] = [];
        if (r.images) {
          if (Array.isArray(r.images)) {
            parsedImages = r.images;
          } else if (typeof r.images === 'string') {
            try {
              parsedImages = JSON.parse(r.images);
            } catch (e) {
              parsedImages = [r.images];
            }
          }
        }
        if (!Array.isArray(parsedImages) || parsedImages.length === 0) {
          if (r.img) parsedImages = [r.img];
        }

        return {
          id: r.id,
          name: r.name,
          category: r.category_id,
          price: Number(r.price),
          oldPrice: r.old_price ? Number(r.old_price) : null,
          rating: effectiveRating,
          reviews: reviewsCount,
          comments: pComments,
          img: parsedImages[0] || r.img, // Cloudinary URL
          images: parsedImages,
          badge: r.badge,
          collections: r.collections || [],
          storeId: r.store_id,
          storeName: r.store_name,
          description: r.description,
          stock: r.stock
        };
      });

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
    const { name, category, price, oldPrice, img, images, badge, collections, storeId, storeName, description, stock } = req.body;

    const rawImagesList = Array.isArray(images) && images.length > 0 ? images : (img ? [img] : []);
    const imagesList = rawImagesList.slice(0, 5);
    const mainImg = imagesList[0] || img || '';

    if (!name || !price || !mainImg) {
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
        `INSERT INTO products (name, category_id, price, old_price, rating, reviews, img, images, badge, collections, store_id, store_name, description, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14)
         RETURNING *`,
        [
          name,
          targetCategory,
          price,
          oldPrice || null,
          5.0,
          0,
          mainImg,
          JSON.stringify(imagesList),
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
        images: imagesList,
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
      img: mainImg,
      images: imagesList,
      badge: badge || 'Yeni',
      collections: collections || ['flash'],
      storeId: storeId || 'vogue_art',
      storeName: storeName || 'Vogue Art',
      description,
      stock: stock || 10
    };

    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error('POST /api/products error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, price, oldPrice, img, images, badge, collections, description, stock, storeId, storeName } = req.body;

    const rawImagesList = Array.isArray(images) && images.length > 0 ? images : (img ? [img] : []);
    const imagesList = rawImagesList.slice(0, 5);
    const mainImg = imagesList[0] || img || '';

    if (getPool()) {
      const isNumeric = !isNaN(Number(id));
      const targetId = isNumeric ? Number(id) : null;

      let updateResult = { rowCount: 0 };
      if (targetId !== null) {
        updateResult = await query(
          `UPDATE products SET
            name = COALESCE($1, name),
            category_id = COALESCE($2, category_id),
            price = COALESCE($3, price),
            old_price = $4,
            img = CASE WHEN $5 != '' THEN $5 ELSE img END,
            images = $6::jsonb,
            badge = $7,
            collections = COALESCE($8, collections),
            description = COALESCE($9, description),
            stock = COALESCE($10, stock)
           WHERE id = $11`,
          [
            name || null,
            category || null,
            price ? Number(price) : null,
            oldPrice ? Number(oldPrice) : null,
            mainImg,
            JSON.stringify(imagesList),
            badge || '',
            collections || null,
            description || null,
            stock ? Number(stock) : null,
            targetId
          ]
        );
      }

      // If no existing row was updated in Neon DB, insert as new product
      if (updateResult.rowCount === 0) {
        const targetStoreId = storeId || 'vogue_art';
        const targetStoreName = storeName || 'Vogue Art';
        const targetCategory = category || 'decor';

        await query(
          `INSERT INTO stores (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [targetStoreId, targetStoreName, 'Boutique Store']
        );
        await query(
          `INSERT INTO categories (id, label, name) VALUES ($1, $2, $2) ON CONFLICT (id) DO NOTHING`,
          [targetCategory, targetCategory]
        );

        const insertRes = await query(
          `INSERT INTO products (name, category_id, price, old_price, rating, reviews, img, images, badge, collections, store_id, store_name, description, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14)
           RETURNING *`,
          [
            name || 'Məhsul',
            targetCategory,
            price ? Number(price) : 0,
            oldPrice ? Number(oldPrice) : null,
            5.0,
            0,
            mainImg,
            JSON.stringify(imagesList),
            badge || 'Yeni',
            collections || ['flash'],
            targetStoreId,
            targetStoreName,
            description || '',
            stock ? Number(stock) : 10
          ]
        );
        const newRow = insertRes.rows[0];
        return res.json({ success: true, id: newRow.id, images: imagesList, img: mainImg });
      }

      return res.json({ success: true, id, images: imagesList, img: mainImg });
    }

    res.json({ success: true, id });
  } catch (error: any) {
    console.error('PUT /api/products/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (getPool()) {
      if (!isNaN(Number(id))) {
        await query('DELETE FROM products WHERE id = $1', [Number(id)]);
      } else {
        await query('DELETE FROM products WHERE name = $1', [id]);
      }
      return res.json({ success: true, message: 'Product deleted from Neon database' });
    }
    res.json({ success: true, message: 'Deleted locally' });
  } catch (error: any) {
    console.error('DELETE /api/products/:id error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add comment to product
app.post('/api/products/:id/comments', async (req, res) => {
  try {
    const productId = req.params.id;
    const { id, userEmail, name, rating, text, date } = req.body;
    const commentId = String(id || Date.now());
    const commentDate = date || new Date().toLocaleDateString('az-AZ');

    if (getPool()) {
      await query(
        `INSERT INTO product_comments (id, product_id, user_email, name, rating, text, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id) DO UPDATE SET
           rating = EXCLUDED.rating,
           text = EXCLUDED.text
         RETURNING *`,
        [commentId, productId, userEmail || '', name || 'Müştəri', rating || 5.0, text, commentDate]
      );

      // Recalculate rating & reviews count
      const countRes = await query(
        `SELECT COUNT(*), AVG(rating) FROM product_comments WHERE product_id = $1`,
        [productId]
      );
      const newReviewsCount = parseInt(countRes.rows[0].count, 10);
      const newRating = Number(parseFloat(countRes.rows[0].avg || 5.0).toFixed(1));

      await query(
        `UPDATE products SET rating = $1, reviews = $2 WHERE id = $3`,
        [newRating, newReviewsCount, productId]
      );

      return res.status(201).json({
        id: commentId,
        productId: Number(productId),
        userEmail,
        name,
        rating: Number(rating || 5),
        text,
        date: commentDate
      });
    }

    res.status(201).json({ id: commentId, productId, userEmail, name, rating, text, date: commentDate });
  } catch (error: any) {
    console.error('POST /api/products/:id/comments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete comment from product
app.delete('/api/products/:id/comments/:commentId', async (req, res) => {
  try {
    const { id: productId, commentId } = req.params;

    if (getPool()) {
      await query(`DELETE FROM product_comments WHERE id = $1`, [commentId]);

      // Recalculate rating & reviews count
      const countRes = await query(
        `SELECT COUNT(*), AVG(rating) FROM product_comments WHERE product_id = $1`,
        [productId]
      );
      const newReviewsCount = parseInt(countRes.rows[0].count, 10);
      const newRating = countRes.rows[0].avg ? Number(parseFloat(countRes.rows[0].avg).toFixed(1)) : 5.0;

      await query(
        `UPDATE products SET rating = $1, reviews = $2 WHERE id = $3`,
        [newRating, newReviewsCount, productId]
      );

      return res.json({ success: true, message: 'Comment deleted' });
    }

    res.json({ success: true });
  } catch (error: any) {
    console.error('DELETE comment error:', error);
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
// 6. ORDERS ENDPOINTS (Neon PostgreSQL)
// ─────────────────────────────────────────────────────────────
app.get('/api/orders', async (req, res) => {
  try {
    if (getPool()) {
      const { userEmail, storeId, isSuperAdmin } = req.query;
      let sql = 'SELECT * FROM orders';
      const params: any[] = [];
      const conditions: string[] = [];

      if (userEmail && isSuperAdmin !== 'true') {
        params.push(userEmail);
        conditions.push(`LOWER(user_email) = LOWER($${params.length})`);
      }

      if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
      }

      sql += ' ORDER BY created_at DESC';
      const result = await query(sql, params);

      const mapped = result.rows.map(r => {
        let parsedItems = [];
        try {
          parsedItems = typeof r.items === 'string' ? JSON.parse(r.items) : (r.items || []);
        } catch (e) {
          parsedItems = r.items || [];
        }

        return {
          id: r.id,
          userEmail: r.user_email,
          customerName: r.customer_name || r.user_email?.split('@')[0] || 'Müştəri',
          storeId: r.store_id,
          items: parsedItems,
          total: Number(r.total_amount),
          totalAmount: Number(r.total_amount),
          status: r.status || 'pending',
          address: r.shipping_address || '',
          shippingAddress: r.shipping_address || '',
          phone: r.phone || '',
          paymentMethod: r.payment_method || 'Nağd',
          createdAt: r.created_at
        };
      });

      if (storeId && isSuperAdmin !== 'true') {
        const storeFiltered = mapped.filter(o =>
          o.storeId === storeId ||
          (Array.isArray(o.items) && o.items.some((item: any) => item.storeId === storeId))
        );
        return res.json(storeFiltered);
      }

      return res.json(mapped);
    }
    res.json([]);
  } catch (error: any) {
    console.error('GET /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { id, userEmail, customerName, storeId, items, total, totalAmount, shippingAddress, address, phone, paymentMethod } = req.body;
    const orderId = id || ('ORD-' + Math.floor(100000 + Math.random() * 900000));
    const finalTotal = total || totalAmount || 0;
    const finalAddress = address || shippingAddress || '';

    if (getPool()) {
      const targetStoreId = storeId || (items && items[0]?.storeId) || 'vogue_art';
      if (targetStoreId) {
        await query(
          `INSERT INTO stores (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [targetStoreId, targetStoreId, 'Boutique Store']
        );
      }

      const result = await query(
        `INSERT INTO orders (id, user_email, customer_name, store_id, items, total_amount, shipping_address, phone, payment_method, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         ON CONFLICT (id) DO UPDATE SET
           status = EXCLUDED.status,
           total_amount = EXCLUDED.total_amount,
           items = EXCLUDED.items,
           customer_name = EXCLUDED.customer_name,
           phone = EXCLUDED.phone
         RETURNING *`,
        [
          orderId,
          userEmail || '',
          customerName || userEmail || 'Müştəri',
          targetStoreId,
          JSON.stringify(items || []),
          finalTotal,
          finalAddress,
          phone || '',
          paymentMethod || 'Nağd',
          'pending'
        ]
      );

      const r = result.rows[0];
      return res.status(201).json({
        id: r.id,
        userEmail: r.user_email,
        customerName: r.customer_name,
        storeId: r.store_id,
        items: typeof r.items === 'string' ? JSON.parse(r.items) : r.items,
        total: Number(r.total_amount),
        status: r.status,
        address: r.shipping_address,
        phone: r.phone,
        createdAt: r.created_at
      });
    }

    res.status(201).json({
      id: orderId,
      userEmail,
      customerName,
      storeId,
      items,
      total: finalTotal,
      status: 'pending',
      address: finalAddress,
      phone,
      createdAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('POST /api/orders error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    if (getPool()) {
      const result = await query(
        `UPDATE orders SET status = $1 WHERE id = $2 RETURNING *`,
        [status, id]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Sifariş tapılmadı.' });
      }
      const r = result.rows[0];
      let parsedItems = [];
      try {
        parsedItems = typeof r.items === 'string' ? JSON.parse(r.items) : r.items;
      } catch (e) {
        parsedItems = r.items || [];
      }
      return res.json({
        id: r.id,
        userEmail: r.user_email,
        customerName: r.customer_name,
        storeId: r.store_id,
        items: parsedItems,
        total: Number(r.total_amount),
        status: r.status,
        address: r.shipping_address,
        phone: r.phone,
        createdAt: r.created_at
      });
    }

    res.json({ id, status });
  } catch (error: any) {
    console.error('PUT /api/orders/:id/status error:', error);
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
// 9. NOTIFICATIONS ENDPOINTS (Neon PostgreSQL)
// ─────────────────────────────────────────────────────────────
app.get('/api/notifications', async (req, res) => {
  try {
    const { userEmail, storeId, isSuperAdmin, role } = req.query;

    if (getPool()) {
      if (isSuperAdmin === 'true') {
        const result = await query(`
          SELECT id, recipient_email as "userEmail", store_id as "storeId", sender, title, message, is_read as "read", is_global as "isGlobal", target_group as "targetGroup", created_at as "createdAt"
          FROM notifications
          ORDER BY created_at DESC
        `);
        return res.json(result.rows);
      } else {
        const cleanEmail = (userEmail || '').toString().toLowerCase().trim();
        const cleanStoreId = storeId ? storeId.toString() : null;
        const userRole = (role || 'user').toString();

        const result = await query(
          `SELECT id, recipient_email as "userEmail", store_id as "storeId", sender, title, message, is_read as "read", is_global as "isGlobal", target_group as "targetGroup", created_at as "createdAt"
           FROM notifications
           WHERE (LOWER(recipient_email) = LOWER($1) AND $1 != '')
              OR ($2::text IS NOT NULL AND store_id = $2)
              OR (is_global = TRUE AND (
                    target_group = 'all' OR target_group IS NULL
                    OR ($3::text = 'user' AND target_group = 'customers')
                    OR ($3::text = 'vendor' AND target_group = 'vendors')
                 ))
           ORDER BY created_at DESC`,
          [cleanEmail, cleanStoreId, userRole]
        );
        return res.json(result.rows);
      }
    }

    res.json([]);
  } catch (error) {
    console.error('GET /api/notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications/broadcast', async (req, res) => {
  try {
    const { targetGroup, title, message, sender } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Başlıq və mətn tələb olunur.' });
    }

    const group = targetGroup || 'all';
    const senderName = sender || '👑 AtlasMall SuperAdmin';

    if (getPool()) {
      // 1. Fetch matching users from Neon DB
      let userQuery = 'SELECT email, store_id, role FROM users';
      const queryParams = [];
      if (group === 'customers') {
        userQuery += " WHERE role = 'user'";
      } else if (group === 'vendors') {
        userQuery += " WHERE role = 'vendor'";
      }

      const usersRes = await query(userQuery, queryParams);
      const matchedUsers = usersRes.rows;

      // 2. Insert notifications for each existing user
      let insertedCount = 0;
      for (const u of matchedUsers) {
        await query(
          `INSERT INTO notifications (recipient_email, store_id, sender, title, message, is_read, is_global, target_group)
           VALUES ($1, $2, $3, $4, $5, FALSE, FALSE, $6)`,
          [u.email, u.store_id || null, senderName, title, message, group]
        );
        insertedCount++;
      }

      // 3. Also insert 1 global entry so future/offline users match
      await query(
        `INSERT INTO notifications (recipient_email, store_id, sender, title, message, is_read, is_global, target_group)
         VALUES (NULL, NULL, $1, $2, $3, FALSE, TRUE, $4)`,
        [senderName, title, message, group]
      );

      return res.status(201).json({
        success: true,
        count: insertedCount,
        message: 'Kütləvi bildiriş Neon PostgreSQL bazasına uğurla yazıldı.'
      });
    }

    res.status(201).json({ success: true, count: 0, message: 'Local fallback mode' });
  } catch (error) {
    console.error('POST /api/notifications/broadcast error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', async (req, res) => {
  try {
    const { userEmail, storeId, title, message, sender } = req.body;
    if (!title || !message) {
      return res.status(400).json({ error: 'Başlıq və mətn tələb olunur.' });
    }

    const senderName = sender || '🔔 AtlasMall Sistem';

    if (getPool()) {
      const result = await query(
        `INSERT INTO notifications (recipient_email, store_id, sender, title, message, is_read, is_global)
         VALUES ($1, $2, $3, $4, $5, FALSE, FALSE)
         RETURNING id, recipient_email as "userEmail", store_id as "storeId", sender, title, message, is_read as "read", is_global as "isGlobal", created_at as "createdAt"`,
        [userEmail || null, storeId || null, senderName, title, message]
      );
      return res.status(201).json(result.rows[0]);
    }

    res.status(201).json({
      id: Date.now(),
      userEmail,
      storeId,
      sender: senderName,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('POST /api/notifications error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    const { id } = req.params;
    if (getPool()) {
      await query('UPDATE notifications SET is_read = TRUE WHERE id = $1', [id]);
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    const { userEmail, storeId, isSuperAdmin } = req.body;
    if (getPool()) {
      if (isSuperAdmin) {
        await query('UPDATE notifications SET is_read = TRUE');
      } else {
        await query(
          `UPDATE notifications SET is_read = TRUE
           WHERE LOWER(recipient_email) = LOWER($1) OR ($2::text IS NOT NULL AND store_id = $2) OR is_global = TRUE`,
          [userEmail || '', storeId || null]
        );
      }
      return res.json({ success: true });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications', async (req, res) => {
  try {
    const { userEmail, storeId, isSuperAdmin, id } = req.query;
    if (getPool()) {
      if (id) {
        await query('DELETE FROM notifications WHERE id = $1', [id]);
      } else if (isSuperAdmin === 'true') {
        await query('DELETE FROM notifications');
      } else {
        await query(
          `DELETE FROM notifications WHERE LOWER(recipient_email) = LOWER($1) OR ($2::text IS NOT NULL AND store_id = $2)`,
          [userEmail || '', storeId || null]
        );
      }
      return res.json({ success: true });
    }
    res.json({ success: true });
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

    // Self-ping Keep-Alive function to prevent Render.com 15-minute free tier spin-down
    const KEEP_ALIVE_INTERVAL = 10 * 60 * 1000; // 10 minutes (600,000 ms)
    setInterval(async () => {
      try {
        const externalUrl = process.env.RENDER_EXTERNAL_URL || process.env.SERVER_URL || `http://localhost:${PORT}`;
        const pingUrl = `${externalUrl.replace(/\/$/, '')}/api/health`;
        const response = await fetch(pingUrl);
        console.log(`[Keep-Alive Ping] ${new Date().toISOString()} - Status: ${response.status}`);
      } catch (err) {
        console.error('[Keep-Alive Ping Error]:', err?.message || err);
      }
    }, KEEP_ALIVE_INTERVAL);
  });
}

startServer();
