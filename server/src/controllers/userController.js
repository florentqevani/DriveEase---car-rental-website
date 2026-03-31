const bcrypt = require('bcryptjs');
const db = require('../config/db');

const SALT_ROUNDS = 10;

async function getAllUsers(_req, res) {
  try {
    const result = await db.query(
      'SELECT id, full_name, email, created_at FROM users ORDER BY id'
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function deleteUser(req, res) {
  try {
    const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    await db.query('DELETE FROM reservations WHERE user_id = $1', [req.params.id]);
    await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
}

module.exports = { getAllUsers, deleteUser };
