import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { query, getPool } from './src/db/index.js';
import { initDatabase } from './src/db/initDb.js';
import { uploadImageToCloudinary, initCloudinary } from './src/services/cloudinary.js';
import { products as fallbackProducts, categories as fallbackCategories } from './src/data/products.js';

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
      const result = await query(
        `INSERT INTO products (name, category_id, price, old_price, rating, reviews, img, badge, collections, store_id, store_name, description, stock)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [
          name,
          category || 'all',
          price,
          oldPrice || null,
          5.0,
          0,
          img, // Store Cloudinary URL in Neon DB
          badge || 'Yeni',
          collections || ['flash'],
          storeId || 'vogue_art',
          storeName || 'Vogue Art',
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
      const result = await query(
        `INSERT INTO orders (id, user_email, store_id, items, total_amount, shipping_address, payment_method)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [orderId, userEmail, storeId || 'vogue_art', JSON.stringify(items), totalAmount, shippingAddress, paymentMethod || 'Nağd']
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
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [AtlasMall Server] running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
