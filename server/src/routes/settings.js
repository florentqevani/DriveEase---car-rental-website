const express = require('express');
const { getEmailSettings, updateEmailSettings, testEmailSettings } = require('../controllers/settingsController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/email', authenticate, requireAdmin, getEmailSettings);
router.put('/email', authenticate, requireAdmin, updateEmailSettings);
router.post('/email/test', authenticate, requireAdmin, testEmailSettings);

module.exports = router;
