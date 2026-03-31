const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('node:path');

const authRoutes = require('./routes/auth');
const carRoutes = require('./routes/cars');
const reservationRoutes = require('./routes/reservations');
const userRoutes = require('./routes/users');
const db = require('./config/db').default;

const app = express();
const PORT = process.env.PORT || 4000;

// ─── Security ────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// ─── Rate limiting ───────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

app.use('/api/auth/login', authLimiter);
app.use('/api/auth/admin/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// ─── Logging ─────────────────────────────────────────────
const logFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(logFormat));

// ─── Body parsing & static ───────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// ─── Routes ──────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// DB test endpoint
app.get('/api/test-db', async (_req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS time, current_database() AS database, current_user AS user');
    res.json({ 
      success: true, 
      connection: result.rows[0],
      pool: {
        total: db.pool.totalCount,
        idle: db.pool.idleCount,
        waiting: db.pool.waitingCount,
      },
      message: 'Database connected!'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      hint: !process.env.DATABASE_URL ? 'DATABASE_URL env var is not set' : 'Check DATABASE_URL and DB availability'
    });
  }
});

// ─── Global error handler ────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err.stack || err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Internal server error'
      : err.message,
  });
});

// ─── Start ───────────────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`[server] Running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[server] SIGTERM received, shutting down gracefully...');
  server.close(() => process.exit(0));
});
