const express = require('express');
const { register, verifyRegistration, resendVerification, loginUser, googleLogin, loginAdmin, refresh, logout, getMe, updateMe, deleteMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyRegistration);
router.post('/resend-verification', resendVerification);
router.post('/login', loginUser);
router.post('/google', googleLogin);
router.post('/admin/login', loginAdmin);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateMe);
router.delete('/me', authenticate, deleteMe);

module.exports = router;
