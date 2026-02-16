const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/databaseSimple');
const { sendOTPEmail } = require('../utils/email');
const { v4: uuidv4 } = require('uuid');

// In-memory OTP storage (temporary)
// Format: { email: { otp: '123456', expiresAt: timestamp } }
const otpStorage = {};

// ============================================
// USER REGISTRATION
// ============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if user already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const [existingUser] = await db.query(checkQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Hash password using bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate UUID for user ID
    const userId = uuidv4();

    // Insert user into database with role = 'voter'
    const insertQuery = `
      INSERT INTO users (id, name, email, password, role, has_voted)
      VALUES (?, ?, ?, ?, 'voter', 0)
    `;

    const [result] = await db.query(insertQuery, [userId, name, email, hashedPassword]);

    // Generate OTP (6-digit random number)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Send OTP via email
    await sendOTPEmail(email, otp, 'registration');

    // Return success response
    return res.status(201).json({
      success: true,
      message: 'User registered successfully! Check your email for OTP.',
      data: {
        userId: userId,
        name: name,
        email: email,
        role: 'voter'
      }
    });

  } catch (error) {
    console.error('Registration Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

// ============================================
// USER LOGIN (with OTP)
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    const [users] = await db.query(query, [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory with 5-minute expiration
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStorage[email] = {
      otp: otp,
      expiresAt: expiresAt,
      userId: user.id,
      userRole: user.role
    };

    // Send OTP via email
    await sendOTPEmail(email, otp, 'login');

    // Return success response (without JWT token yet)
    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully. Check your email for OTP.',
      data: {
        email: email,
        message: 'Please verify OTP to complete login'
      }
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// ============================================
// VERIFY OTP
// ============================================
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate input
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Check if OTP exists for this email
    const storedOTP = otpStorage[email];

    if (!storedOTP) {
      return res.status(400).json({
        success: false,
        message: 'No OTP found. Please login again.'
      });
    }

    // Check if OTP has expired
    if (Date.now() > storedOTP.expiresAt) {
      delete otpStorage[email];
      return res.status(400).json({
        success: false,
        message: 'OTP has expired. Please login again.'
      });
    }

    // Verify OTP
    if (storedOTP.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP. Please try again.'
      });
    }

    // OTP is correct - Get user details
    const query = 'SELECT * FROM users WHERE id = ?';
    const [users] = await db.query(query, [storedOTP.userId]);

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = users[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    // Delete OTP from storage after successful verification
    delete otpStorage[email];

    console.log('\n' + '='.repeat(50));
    console.log('OTP VERIFIED SUCCESSFULLY');
    console.log('='.repeat(50));
    console.log(`Email: ${email}`);
    console.log(`User: ${user.name}`);
    console.log(`Role: ${user.role}`);
    console.log('='.repeat(50) + '\n');

    // Return success response with JWT token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          has_voted: user.has_voted
        }
      }
    });

  } catch (error) {
    console.error('OTP Verification Error:', error);
    return res.status(500).json({
      success: false,
      message: 'OTP verification failed',
      error: error.message
    });
  }
};

// ============================================
// ADMIN LOGIN
// ============================================
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const query = 'SELECT * FROM users WHERE email = ?';
    const [users] = await db.query(query, [email]);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = users[0];

    // Check if user role is 'admin'
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    // Verify password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '7d' }
    );

    // Return success response
    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Admin Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Admin login failed',
      error: error.message
    });
  }
};
