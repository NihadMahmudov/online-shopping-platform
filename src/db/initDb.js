import { query, getPool } from './index.js';
import { products as initialProducts, categories as initialCategories } from '../data/products.js';

const boutiqueStores = [
  { id: 'vogue_art', name: 'Vogue Art', description: 'Artistic gift & lifestyle store' },
  { id: 'modernist', name: 'Modernist', description: 'Modern decor & home accessories' },
  { id: 'zarif_atelye', name: 'Zərif Atelye', description: 'Handcrafted jewelry & fine gifts' },
  { id: 'style_lab', name: 'Style Lab', description: 'Fashionable accessories & boutique items' },
  { id: 'baku_closet', name: 'Baku Closet', description: 'Luxury gifts and fashion' },
  { id: 'silk_way', name: 'Silk Way', description: 'Traditional & modern gift sets' }
];

export async function initDatabase() {
  const pool = getPool();
  if (!pool) {
    console.log('ℹ️ [Neon DB] DATABASE_URL not set. Running in local memory / fallback mode.');
    return false;
  }

  try {
    console.log('🔄 [Neon DB] Initializing Neon PostgreSQL tables...');

    // 1. Create STORES table
    await query(`
      CREATE TABLE IF NOT EXISTS stores (
        id VARCHAR(100) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_email VARCHAR(255),
        logo TEXT,
        banner TEXT,
        description TEXT,
        phone VARCHAR(50),
        rating NUMERIC(3,2) DEFAULT 5.0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 2. Create CATEGORIES table
    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(100) PRIMARY KEY,
        label VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        img TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create PRODUCTS table
    await query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id VARCHAR(100) REFERENCES categories(id) ON DELETE SET NULL,
        price NUMERIC(10,2) NOT NULL,
        old_price NUMERIC(10,2),
        rating NUMERIC(3,2) DEFAULT 5.0,
        reviews INT DEFAULT 0,
        img TEXT NOT NULL,
        badge VARCHAR(50),
        collections TEXT[],
        store_id VARCHAR(100) REFERENCES stores(id) ON DELETE SET NULL,
        store_name VARCHAR(255),
        description TEXT,
        stock INT DEFAULT 10,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create ORDERS table
    await query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(100) PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        store_id VARCHAR(100) REFERENCES stores(id) ON DELETE CASCADE,
        items JSONB NOT NULL,
        total_amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'Gözləmədə',
        shipping_address TEXT,
        payment_method VARCHAR(50) DEFAULT 'Nağd',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create NOTIFICATIONS table
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        recipient_email VARCHAR(255),
        store_id VARCHAR(100),
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT FALSE,
        is_global BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Check if initial categories exist
    const catRes = await query('SELECT COUNT(*) FROM categories');
    if (parseInt(catRes.rows[0].count) === 0) {
      console.log('🌱 [Neon DB] Seeding initial categories...');
      for (const cat of initialCategories) {
        await query(
          `INSERT INTO categories (id, label, name, img) VALUES ($1, $2, $3, $4) ON CONFLICT (id) DO NOTHING`,
          [cat.id, cat.label, cat.label, cat.img || '']
        );
      }
    }

    // Check if initial stores exist
    const storeRes = await query('SELECT COUNT(*) FROM stores');
    if (parseInt(storeRes.rows[0].count) === 0) {
      console.log('🌱 [Neon DB] Seeding initial stores...');
      for (const store of boutiqueStores) {
        await query(
          `INSERT INTO stores (id, name, description) VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING`,
          [store.id, store.name, store.description]
        );
      }
    }

    // Check if initial products exist
    const prodRes = await query('SELECT COUNT(*) FROM products');
    if (parseInt(prodRes.rows[0].count) === 0) {
      console.log('🌱 [Neon DB] Seeding initial products...');
      for (let i = 0; i < initialProducts.length; i++) {
        const p = initialProducts[i];
        const store = boutiqueStores[i % boutiqueStores.length];
        await query(
          `INSERT INTO products (name, category_id, price, old_price, rating, reviews, img, badge, collections, store_id, store_name, description, stock)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
          [
            p.name,
            p.category || 'all',
            p.price,
            p.oldPrice || null,
            p.rating || 5.0,
            p.reviews || 0,
            p.img,
            p.badge || null,
            p.collections || ['flash'],
            store.id,
            store.name,
            'Premium keyfiyyətli hədiyyəlik məhsul.',
            15
          ]
        );
      }
    }

    console.log('✅ [Neon DB] Neon PostgreSQL initialization complete.');
    return true;
  } catch (error) {
    console.error('❌ [Neon DB] Error initializing Neon PostgreSQL:', error.message);
    return false;
  }
}
