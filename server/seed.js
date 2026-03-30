const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  const sql = readFileSync(join(__dirname, '..', 'db', 'init.sql'), 'utf8');

  try {
    await pool.query(sql);
    console.log('[seed] Database initialized successfully');
  } catch (err) {
    console.error('[seed] Error initializing database:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
