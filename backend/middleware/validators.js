const { body, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array().map(err => ({
        field: err.param,
        message: err.msg
      }))
    });
  }
  next();
};

// Registration validation
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters').matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*?])[A-Za-z\d!@#$%^&*?]{8,}$/).withMessage('Password must contain uppercase, lowercase, number, and special character'),
  body('phone').optional().isLength({ min: 10, max: 15 }).withMessage('Invalid phone number format'),
  validateResults
];

// Login validation
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  validateResults
];

// OTP verification validation
const validateOTPVerification = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('otp').matches(/^\d{6}$/).withMessage('OTP must be 6 digits'),
  validateResults
];

// Election creation validation
const validateElectionCreate = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').optional().trim(),
  body('start_date').isISO8601().withMessage('Invalid start date format'),
  body('end_date').isISO8601().withMessage('Invalid end date format').custom((value, { req }) => {
    if (new Date(value) <= new Date(req.body.start_date)) {
      throw new Error('End date must be after start date');
    }
    return true;
  }),
  body('is_public').optional().isBoolean().withMessage('is_public must be boolean'),
  validateResults
];

// Candidate creation validation
const validateCandidateCreate = [
  body('election_id').notEmpty().withMessage('Election ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('description').optional().trim(),
  body('symbol').optional().trim(),
  body('position').optional().trim(),
  body('party_name').optional().trim(),
  validateResults
];

// Vote validation
const validateVote = [
  body('election_id').notEmpty().withMessage('Election ID is required'),
  body('candidate_id').notEmpty().withMessage('Candidate ID is required'),
  validateResults
];

module.exports = {
  validateRegister,
  validateLogin,
  validateOTPVerification,
  validateElectionCreate,
  validateCandidateCreate,
  validateVote,
  validateResults
};
