const { hash: _hash, compare } = require('bcrypt');
const { OAuth2Client } = require('google-auth-library');
const { query } = require('../config/db');
const { signAccessToken, generateRefreshToken, saveRefreshToken, revokeRefreshToken, findRefreshToken } = require('../middleware/auth');

const SALT_ROUNDS = 10;
const googleClient = new OAuth2Client();

async function issueTokens(payload, { userId, adminId, role }) {
  const accessToken = signAccessToken(payload);
  const refreshToken = generateRefreshToken();
  await saveRefreshToken(refreshToken, { userId, adminId, role });
  return { accessToken, refreshToken };
}

async function register(req, res) {
  const { full_name, email, password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hash = await _hash(password, SALT_ROUNDS);
    const result = await query(
      'INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3) RETURNING id, full_name, email',
      [full_name, email, hash]
    );

    const user = result.rows[0];
    const tokens = await issueTokens(
      { id: user.id, email: user.email, role: 'user' },
      { userId: user.id, role: 'user' }
    );

    res.status(201).json({ user: { ...user, role: 'user' }, ...tokens });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
}

async function loginUser(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    // Check users table first
    const userResult = await query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];

    if (user) {
      if (!user.password || !(await compare(password, user.password))) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const tokens = await issueTokens(
        { id: user.id, email: user.email, role: 'user' },
        { userId: user.id, role: 'user' }
      );
      return res.json({
        user: { id: user.id, full_name: user.full_name, email: user.email, role: 'user' },
        ...tokens,
      });
    }

    // Check admins table
    const adminResult = await query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = adminResult.rows[0];

    if (!admin || !(await compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = await issueTokens(
      { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
      { adminId: admin.id, role: 'admin' }
    );
    res.json({
      user: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
      ...tokens,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function googleLogin(req, res) {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Google credential required' });
  }

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ error: 'Google login not configured' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const { sub: googleId, email, name } = ticket.getPayload();

    // Find existing user by google_id or email
    let result = await query('SELECT * FROM users WHERE google_id = $1', [googleId]);
    let user = result.rows[0];

    if (!user) {
      // Check if email already exists (registered with password)
      result = await query('SELECT * FROM users WHERE email = $1', [email]);
      user = result.rows[0];

      if (user) {
        // Link Google to existing account
        await query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
      } else {
        // Create new user
        result = await query(
          'INSERT INTO users (full_name, email, google_id) VALUES ($1, $2, $3) RETURNING id, full_name, email',
          [name, email, googleId]
        );
        user = result.rows[0];
      }
    }

    const tokens = await issueTokens(
      { id: user.id, email: user.email, role: 'user' },
      { userId: user.id, role: 'user' }
    );

    res.json({
      user: { id: user.id, full_name: user.full_name, email: user.email, role: 'user' },
      ...tokens,
    });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
}

async function loginAdmin(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await query('SELECT * FROM admins WHERE email = $1', [email]);
    const admin = result.rows[0];

    if (!admin || !(await compare(password, admin.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = await issueTokens(
      { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
      { adminId: admin.id, role: 'admin' }
    );

    res.json({
      user: { id: admin.id, username: admin.username, email: admin.email, role: 'admin' },
      ...tokens,
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
}

async function refresh(req, res) {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token required' });
  }

  try {
    const stored = await findRefreshToken(refreshToken);
    if (!stored) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Revoke old token (rotation)
    await revokeRefreshToken(refreshToken);

    let payload;
    if (stored.role === 'admin') {
      const result = await query('SELECT id, username, email FROM admins WHERE id = $1', [stored.admin_id]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
      const admin = result.rows[0];
      payload = { id: admin.id, username: admin.username, email: admin.email, role: 'admin' };
    } else {
      const result = await query('SELECT id, full_name, email FROM users WHERE id = $1', [stored.user_id]);
      if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
      const user = result.rows[0];
      payload = { id: user.id, email: user.email, role: 'user' };
    }

    const newAccessToken = signAccessToken(payload);
    const newRefreshToken = generateRefreshToken();
    await saveRefreshToken(newRefreshToken, {
      userId: stored.user_id,
      adminId: stored.admin_id,
      role: stored.role,
    });

    res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    console.error('Refresh error:', err);
    res.status(500).json({ error: 'Token refresh failed' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (refreshToken) {
    await revokeRefreshToken(refreshToken).catch(() => {});
  }
  res.json({ message: 'Logged out' });
}

async function getMe(req, res) {
  try {
    if (req.user.role === 'admin') {
      const result = await query('SELECT id, username, email FROM admins WHERE id = $1', [req.user.id]);
      return res.json({ ...result.rows[0], role: 'admin' });
    }
    const result = await query('SELECT id, full_name, email, password FROM users WHERE id = $1', [req.user.id]);
    res.json({ ...result.rows[0], password: undefined, has_password: !!result.rows[0].password, role: 'user' });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Failed to get user' });
  }
}

async function updateMe(req, res) {
  const { full_name, email, password, current_password } = req.body;

  if (req.user.role === 'admin') {
    return res.status(400).json({ error: 'Admin profile updates not supported here' });
  }

  try {
    const updates = [];
    const values = [];
    let idx = 1;

    if (full_name) { updates.push(`full_name = $${idx++}`); values.push(full_name); }
    if (email) {
      const dup = await query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, req.user.id]);
      if (dup.rows.length > 0) return res.status(409).json({ error: 'Email already in use' });
      updates.push(`email = $${idx++}`); values.push(email);
    }
    if (password) {
      const existing = await query('SELECT password FROM users WHERE id = $1', [req.user.id]);
      const hasPassword = !!existing.rows[0].password;
      if (hasPassword) {
        if (!current_password) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }
        const valid = await compare(current_password, existing.rows[0].password);
        if (!valid) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }
      }
      const hash = await _hash(password, SALT_ROUNDS);
      updates.push(`password = $${idx++}`); values.push(hash);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(req.user.id);
    const result = await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email`,
      values
    );

    res.json({ ...result.rows[0], role: 'user' });
  } catch (err) {
    console.error('UpdateMe error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
}

async function deleteMe(req, res) {
  if (req.user.role === 'admin') {
    return res.status(400).json({ error: 'Admin accounts cannot be deleted here' });
  }

  try {
    await query('DELETE FROM reservations WHERE user_id = $1', [req.user.id]);
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.user.id]);
    const result = await query('DELETE FROM users WHERE id = $1 RETURNING id', [req.user.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'Account deleted' });
  } catch (err) {
    console.error('DeleteMe error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
}

module.exports = { register, loginUser, googleLogin, loginAdmin, refresh, logout, getMe, updateMe, deleteMe };
