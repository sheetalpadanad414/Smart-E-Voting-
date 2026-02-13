const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin, validateOTPVerification } = require('../middleware/validators');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.post('/register', authLimiter, validateRegister, AuthController.register);
router.post('/login', authLimiter, validateLogin, AuthController.login);
router.post('/verify-otp', validateOTPVerification, AuthController.verifyOTP);
router.post('/resend-otp', authLimiter, AuthController.resendOTP);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);

module.exports = router;
