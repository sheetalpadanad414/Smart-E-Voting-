# Quick Reference: Authentication Fixes

## What Was Broken

1. **Registration roles not showing** - Users couldn't select a role
2. **Login didn't send OTP** - Frontend and backend OTP flows were mismatched
3. **OTP management was wrong** - Using users table instead of OTP table
4. **Missing role-specific fields** - No department/designation fields for officers

## What's Fixed

### ✓ Register.jsx
```jsx
// Before: Empty array
const roles = [];

// After: Populated with role definitions
const roles = [
  { id: 'voter', name: 'Voter', icon: '🗳️', ... },
  { id: 'election_officer', name: 'Election Officer', icon: '👔', ... },
  { id: 'observer', name: 'Observer', icon: '👁️', ... },
  { id: 'admin', name: 'Admin', icon: '⚙️', ... }
];

// Added conditional fields for election_officer and observer roles
{(formData.role === 'election_officer' || formData.role === 'observer') && (
  <>
    <input name="department" ... />
    <input name="designation" ... />
    {formData.role === 'election_officer' && (
      <input name="assignment_area" ... />
    )}
  </>
)}
```

### ✓ authController.js - Login Method
```javascript
// Before: Returned token directly
res.json({ message: 'Login successful', token, user: {...} });

// After: Sends OTP and requires verification
const otp = generateOTP();
await OTP.create(email, otp, 'login', expiresAt);
await sendOTPEmail(email, otp, 'login');
res.json({ 
  message: 'OTP sent to your email. Please verify to complete login.',
  email: email 
});
```

### ✓ authController.js - ResendOTP Method
```javascript
// Before: Using User.updateOTP (wrong table)
await User.updateOTP(email, otp, expiresAt);

// After: Using OTP model (correct table)
await OTP.create(email, otp, 'registration', expiresAt);
```

### ✓ authController.js - VerifyOTP Method
```javascript
// Before: Only for registration verification
// After: Handles both registration and login
if (!user.is_verified) {
  await User.updateVerification(user.id);  // Mark as verified for registration
}
await User.updateLastLogin(user.id);        // Always update last login
```

### ✓ User.js Model
```javascript
// Removed these deprecated methods:
// - User.updateOTP()      [Now use OTP.create()]
// - User.verifyOTP()      [Now use OTP.verify()]

// Kept these essential methods:
// - User.updateVerification()  [Mark user as verified]
// - User.updateLastLogin()     [Update login timestamp]
```

## Testing

### Quick Test Without Database
```bash
cd backend
npm start
# In another terminal:
node testAuthIntegration.js
```

### With Database (after MySQL setup)
```bash
cd backend
node config/initDatabase.js
npm start
# In another terminal:
node testAuthIntegration.js
```

## New Authentication Flow

### Registration
```
1. User selects role
2. User fills registration form
3. System creates user & sends OTP
4. User verifies OTP
5. User marked as is_verified = true
6. User logged in with token
```

### Login
```
1. User enters email & password
2. System verifies credentials
3. System sends OTP
4. User verifies OTP
5. User logged in with token
```

## Important Notes

- **Passwords**: Must be 8+ chars with uppercase, lowercase, number, and special char
- **OTP**: 6-digit code, expires in 5 minutes (configurable)
- **Email Required**: For registration, users must verify email with OTP
- **Role-Based Fields**: Election officers and observers must provide department and designation
- **Account Locking**: 15-minute lock after 5 failed login attempts
- **Database**: Must run `initDatabase.js` to create required tables

## API Endpoints

### POST /api/auth/register
```json
Request:
{
  "name": "John Voter",
  "email": "john@example.com",
  "password": "ValidPassword123!@#",
  "phone": "9876543210",
  "role": "voter"
}

Response:
{
  "message": "Registration successful. Please verify your email with OTP.",
  "userId": "...",
  "email": "john@example.com",
  "role": "voter"
}
```

### POST /api/auth/login
```json
Request:
{
  "email": "john@example.com",
  "password": "ValidPassword123!@#"
}

Response:
{
  "message": "OTP sent to your email. Please verify to complete login.",
  "email": "john@example.com"
}
```

### POST /api/auth/verify-otp
```json
Request:
{
  "email": "john@example.com",
  "otp": "123456"
}

Response:
{
  "message": "Verification successful",
  "token": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "john@example.com",
    "name": "John Voter",
    "role": "voter"
  }
}
```

### POST /api/auth/resend-otp
```json
Request:
{
  "email": "john@example.com"
}

Response:
{
  "message": "OTP sent to your email"
}
```

### GET /api/auth/profile
```
Headers:
Authorization: Bearer {token}

Response:
{
  "user": {
    "id": "...",
    "name": "John Voter",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "voter",
    "is_verified": true,
    "last_login": "2024-02-14T10:30:00Z"
  }
}
```

## Frontend Components Updated

- **Register.jsx**: Now shows role selection with all 4 roles
- **Login.jsx**: Already had OTP flow (no changes needed)
- **API Service**: No changes needed (endpoints format is compatible)

## Status: ✓ Ready for Testing

All fixes implemented and tested at code level. Ready for integration testing with running database.
