const express = require('express');
const { getAllUsers, deleteUser } = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, requireAdmin, getAllUsers);
router.delete('/:id', authenticate, requireAdmin, deleteUser);

module.exports = router;
