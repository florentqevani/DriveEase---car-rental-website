import { Pool } from 'pg';

const isProduction = process.env.NODE_ENV === 'production';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
  max: 5,                   // Render free tier has limited connections
  idleTimeoutMillis: 30000, // Close idle clients after 30s
  connectionTimeoutMillis: 10000, // Fail fast if DB is unreachable
});

pool.on('error', (err) => {
  console.error('[db] Unexpected pool error:', err.message);
});

export default {
  query: (text, params) => pool.query(text, params),
  pool,
};
