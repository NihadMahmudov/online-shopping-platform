import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    try {
      const isNeon = process.env.DATABASE_URL.includes('neon.tech');
      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: isNeon || process.env.NODE_ENV === 'production' 
          ? { rejectUnauthorized: false } 
          : false,
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      pool.on('error', (err) => {
        console.error('Unexpected error on idle Neon PostgreSQL client:', err.message);
      });
    } catch (error) {
      console.error('Failed to initialize PostgreSQL pool:', error.message);
      pool = null;
    }
  }

  return pool;
}

export async function query(text, params) {
  const activePool = getPool();
  if (!activePool) {
    throw new Error('DATABASE_URL is not configured in environment variables');
  }
  const start = Date.now();
  const res = await activePool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Neon DB Query] executed in ${duration}ms, rows: ${res.rowCount}`);
  }
  return res;
}
