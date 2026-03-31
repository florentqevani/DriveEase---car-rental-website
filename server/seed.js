const { readFileSync, existsSync } = require('node:fs');
const { join } = require('node:path');
const { Pool } = require('pg');

async function seed() {
  if (!process.env.DATABASE_URL) {
    console.warn('[seed] DATABASE_URL not set — skipping');
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    connectionTimeoutMillis: 10000,
  });

  // Try local path first (rootDir: server on Render), then monorepo path
  let sqlPath = join(__dirname, 'db', 'init.sql');
  if (!existsSync(sqlPath)) {
    sqlPath = join(__dirname, '..', 'db', 'init.sql');
  }
  if (!existsSync(sqlPath)) {
    console.warn('[seed] init.sql not found — skipping');
    await pool.end();
    return;
  }

  const sql = readFileSync(sqlPath, 'utf8');

  try {
    await pool.query(sql);
    console.log('[seed] Database initialized successfully');
  } catch (err) {
    console.error('[seed] Error initializing database:', err.message);
  } finally {
    await pool.end();
  }
}

// If run directly, execute and exit
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
