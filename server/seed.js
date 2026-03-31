const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { Pool } = require('pg');

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  });

  // Try local path first (rootDir: server on Render), then monorepo path
  let sqlPath = join(__dirname, 'db', 'init.sql');
  const { existsSync } = require('node:fs');
  if (!existsSync(sqlPath)) {
    sqlPath = join(__dirname, '..', 'db', 'init.sql');
  }

  const sql = readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('[seed] Database initialized successfully');
  } catch (err) {
    console.error('[seed] Error initializing database:', err.message);
    // Don't exit — let the server start anyway
  } finally {
    await pool.end();
  }
}

seed();
