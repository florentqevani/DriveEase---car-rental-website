const { readFileSync, existsSync, writeFileSync, mkdirSync } = require('node:fs');
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
  }

  // Restore uploaded images from DB to filesystem
  try {
    const uploadsDir = join(__dirname, 'uploads');
    mkdirSync(uploadsDir, { recursive: true });

    const result = await pool.query(
      'SELECT image, image_data, image_type FROM cars WHERE image IS NOT NULL AND image_data IS NOT NULL'
    );

    let restored = 0;
    for (const row of result.rows) {
      const filePath = join(uploadsDir, row.image);
      if (!existsSync(filePath)) {
        writeFileSync(filePath, row.image_data);
        restored++;
      }
    }
    if (restored > 0) {
      console.log(`[seed] Restored ${restored} upload(s) from database`);
    }
  } catch (err) {
    console.error('[seed] Error restoring uploads:', err.message);
  }

  await pool.end();
}

// If run directly, execute and exit
if (require.main === module) {
  seed().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = seed;
