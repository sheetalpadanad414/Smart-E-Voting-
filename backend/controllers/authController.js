const User = require('../models/User');
const OTP = require('../models/OTP');
const { generateToken, generateOTP, hashPassword, comparePassword } = require('../utils/auth');
const { sendOTPEmail } = require('../utils/email');
const AdminService = require('../services/adminService');
require('dotenv').config();

class AuthController {
  // User Registration
  static async register(req, res, next) {
    try {
      const { name, email, password, phone, role = 'voter', department, designation, assignment_area } = req.body;

      // Input validation
      if (!name || !email || !password || !phone) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (password.length < 8) {
        return res.status(400).json({ error: 'Password must be at least 8 characters' });
      }

      // Validate role
      const validRoles = ['admin', 'voter', 'election_officer', 'observer'];
      if (!validRoles.includes(role)) {
        return res.status(400).json({ error: 'Invalid role selected' });
      }

      // Validate role-specific fields
      if ((role === 'election_officer' || role === 'observer') && (!department || !designation)) {
        return res.status(400).json({ error: 'Department and designation are required for this role' });
      }

      // Check if user exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE || 5) * 60 * 1000);

      // Create user (not verified yet)
      const user = await User.create({ name, email, password, phone, role, department, designation, assignment_area });

      // Save OTP
      await OTP.create(email, otp, 'registration', expiresAt);

      // Send OTP email (skip in development)
      const isDevelopment = process.env.NODE_ENV !== 'production';
      let emailSent = true;
      
      if (!isDevelopment) {
        emailSent = await sendOTPEmail(email, otp, 'registration');
        if (!emailSent) {
          return res.status(500).json({ error: 'Failed to send OTP email' });
        }
      }

      const response = {
        message: isDevelopment ? 
          'Registration successful. OTP generated for development.' : 
          'Registration successful. Please verify your email with OTP.',
        userId: user.id,
        email: user.email,
        role: user.role
      };

      // Include OTP in development mode
      if (isDevelopment) {
        response.developmentOTP = otp;
        console.log(`🔐 Development OTP for ${email}: ${otp}`);
      }

      res.status(201).json(response);

      // Log action (safely)
      try {
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        await AdminService.logAction(user.id, 'REGISTER', 'user', user.id, {}, ipAddress);
      } catch (logError) {
        console.error('Failed to log action:', logError.message);
      }
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP
  static async verifyOTP(req, res, next) {
    try {
      const { email, otp } = req.body;

      // Verify OTP
      const isValid = await OTP.verify(email, otp);
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid or expired OTP' });
      }

      // Update user as verified
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      await User.updateVerification(user.id);

      // Generate token
      const token = generateToken(user.id, user.role);

      res.json({
        message: 'Email verified successfully',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

      // Log action
      AdminService.logAction(user.id, 'VERIFY_EMAIL', 'user', user.id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Login
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check account lock
      const isLocked = await User.isAccountLocked(email);
      if (isLocked) {
        return res.status(429).json({ error: 'Account is temporarily locked due to too many failed login attempts' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        await User.recordFailedLogin(email);
        const failedAttempts = user.failed_login_attempts + 1;

        if (failedAttempts >= 5) {
          await User.lockAccount(email);
          return res.status(429).json({ error: 'Account locked due to multiple failed attempts' });
        }

        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if email verified
      if (!user.is_verified) {
        return res.status(403).json({ error: 'Please verify your email first' });
      }

      // Generate OTP for login
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE || 5) * 60 * 1000);

      // Save OTP
      await OTP.create(email, otp, 'login', expiresAt);

      // Send OTP email (skip in development)
      const isDevelopment = process.env.NODE_ENV !== 'production';
      let emailSent = true;
      
      if (!isDevelopment) {
        emailSent = await sendOTPEmail(email, otp, 'login');
        if (!emailSent) {
          return res.status(500).json({ error: 'Failed to send OTP email' });
        }
      }

      const response = {
        message: isDevelopment ? 
          'OTP generated for development. Please verify to complete login.' : 
          'OTP sent to your email. Please verify to complete login.',
        email: email,
        requiresOTP: true
      };

      // Include OTP in development mode
      if (isDevelopment) {
        response.developmentOTP = otp;
        console.log(`🔐 Development Login OTP for ${email}: ${otp}`);
      }

      res.json(response);

      // Reset failed attempts
      await User.resetFailedAttempts(email);

      // Log action
      AdminService.logAction(user.id, 'LOGIN_REQUEST', 'user', user.id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Resend OTP
  static async resendOTP(req, res, next) {
    try {
      const { email } = req.body;

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

      // Save OTP to otps table
      await OTP.create(email, otp, 'registration', expiresAt);

      // Send OTP email (skip in development)
      const isDevelopment = process.env.NODE_ENV !== 'production';
      let emailSent = true;
      
      if (!isDevelopment) {
        emailSent = await sendOTPEmail(email, otp, 'registration');
        if (!emailSent) {
          return res.status(500).json({ error: 'Failed to send OTP email' });
        }
      }

      const response = {
        message: isDevelopment ? 
          'New OTP generated for development.' : 
          'OTP sent to your email'
      };

      // Include OTP in development mode
      if (isDevelopment) {
        response.developmentOTP = otp;
        console.log(`🔐 Development Resend OTP for ${email}: ${otp}`);
      }

      res.json(response);

      // Log action
      AdminService.logAction(user.id, 'RESEND_OTP', 'user', user.id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Get current user profile
  static async getProfile(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        user
      });
    } catch (error) {
      next(error);
    }
  }

  // Admin Login (no OTP required)
  static async adminLogin(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check account lock
      const isLocked = await User.isAccountLocked(email);
      if (isLocked) {
        return res.status(429).json({ error: 'Account is temporarily locked due to too many failed login attempts' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Check if user is admin
      if (user.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      }

      // Check password
      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        await User.recordFailedLogin(email);
        const failedAttempts = user.failed_login_attempts + 1;

        if (failedAttempts >= 5) {
          await User.lockAccount(email);
          return res.status(429).json({ error: 'Account locked due to multiple failed attempts' });
        }

        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Reset failed attempts
      await User.resetFailedAttempts(email);

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate token
      const token = generateToken(user.id, user.role);

      res.json({
        message: 'Admin login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });

      // Log action
      AdminService.logAction(user.id, 'ADMIN_LOGIN', 'user', user.id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
