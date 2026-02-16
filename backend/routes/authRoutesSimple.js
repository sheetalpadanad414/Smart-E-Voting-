const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllerSimple');

// User Registration Route
router.post('/register', authController.register);

// User Login Route (Voter) - Sends OTP
router.post('/login', authController.login);

// Verify OTP Route - Returns JWT Token
router.post('/verify-otp', authController.verifyOTP);

// Admin Login Route
router.post('/admin/login', authController.adminLogin);

module.exports = router;
