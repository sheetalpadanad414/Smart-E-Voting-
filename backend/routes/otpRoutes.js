const express = require('express');
const router = express.Router();
const OTPController = require('../controllers/otpController');

// Verify OTP
router.post('/verify', OTPController.verifyOTP);

// Get OTP by email (for testing)
router.get('/:email', OTPController.getOTP);

// Resend OTP
router.post('/resend', OTPController.resendOTP);

module.exports = router;
