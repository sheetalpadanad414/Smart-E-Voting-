const User = require('../models/User');
const { generateOTP } = require('../utils/auth');

class OTPController {
  // Verify OTP from database
  static async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if already verified
      if (user.is_verified) {
        return res.status(400).json({ error: 'User is already verified' });
      }

      // Verify OTP
      const isValid = await User.verifyOTP(email, otp);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Update user as verified
      await User.updateVerification(user.id);

      res.json({
        success: true,
        message: 'OTP verified successfully',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get OTP by email (for testing/debugging only)
  static async getOTP(req, res, next) {
    try {
      const { email } = req.params;

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if OTP is still valid
      const now = new Date();
      const expiresAt = new Date(user.otp_expires_at);

      if (!user.otp || expiresAt < now) {
        return res.status(400).json({ error: 'No valid OTP found' });
      }

      res.json({
        email: user.email,
        otp: user.otp,
        expires_at: user.otp_expires_at
      });
    } catch (error) {
      next(error);
    }
  }

  // Resend OTP
  static async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.is_verified) {
        return res.status(400).json({ error: 'User is already verified' });
      }

      // Generate new OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE || 5) * 60 * 1000);

      // Update OTP in database
      await User.updateOTP(email, otp, expiresAt);

      res.json({
        success: true,
        message: 'New OTP generated successfully',
        otp: otp, // In production, don't send OTP in response
        expires_at: expiresAt
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OTPController;
