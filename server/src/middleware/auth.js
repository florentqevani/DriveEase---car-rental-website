const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../config/db');

if (!process.env.JWT_SECRET) {
  console.error('[auth] FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}
const JWT_SECRET = process.env.JWT_SECRET;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

function signAccessToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

async function saveRefreshToken(token, { userId, adminId, role }) {
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000);
  await db.query(
    'INSERT INTO refresh_tokens (token, user_id, admin_id, role, expires_at) VALUES ($1, $2, $3, $4, $5)',
    [token, userId || null, adminId || null, role, expiresAt]
  );
}

async function revokeRefreshToken(token) {
  await db.query('DELETE FROM refresh_tokens WHERE token = $1', [token]);
}

async function revokeAllUserTokens(userId, role) {
  if (role === 'admin') {
    await db.query('DELETE FROM refresh_tokens WHERE admin_id = $1 AND role = $2', [userId, role]);
  } else {
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1 AND role = $2', [userId, role]);
  }
}

async function findRefreshToken(token) {
  const result = await db.query(
    'SELECT * FROM refresh_tokens WHERE token = $1 AND expires_at > NOW()',
    [token]
  );
  return result.rows[0] || null;
}

function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = {
  signAccessToken,
  generateRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  findRefreshToken,
  authenticate,
  requireAdmin,
};
