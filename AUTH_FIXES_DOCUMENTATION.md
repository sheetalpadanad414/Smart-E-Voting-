# Authentication Flow Fixes - Documentation

## Overview
Fixed critical issues in the register and login functionality of the Smart E-Voting system with OTP-based verification.

## Issues Fixed

### 1. **Register.jsx - Empty Roles Array** ✓
**Problem**: The `roles` array was empty, preventing users from selecting a role during registration.

**Solution**: Populated the roles array with four role definitions:
- **Voter**: Cast votes in elections
- **Election Officer**: Conduct and manage elections
- **Observer**: Monitor elections and verify results
- **Admin**: Administrative system management

**Changes**:
- Added role definitions with icons and descriptions
- Added conditional rendering for role-specific fields (department, designation, assignment_area)
- Election Officer and Observer roles now require department and designation fields
- Election Officer role also requires assignment_area field

**Files Modified**: `frontend/src/pages/Register.jsx`

---

### 2. **Login Flow - Missing OTP Implementation** ✓
**Problem**: The login endpoint wasn't sending OTP. It was directly returning a token, but the frontend expected OTP verification.

**Solution**: Updated the login flow to match registration:
1. User submits email and password
2. Backend verifies credentials
3. Backend generates and sends OTP via email
4. Frontend shows OTP verification screen
5. User verifies OTP to complete login

**Changes in authController.js**:
- Modified `login()` method to generate OTP using OTP model instead of returning token directly
- Added email verification before OTP generation
- OTP is sent via email with 5-minute expiration
- Response now indicates OTP verification is required

**Files Modified**: `backend/controllers/authController.js`

---

### 3. **ResendOTP - Using Wrong Table** ✓
**Problem**: The `resendOTP()` method was updating the `users` table directly instead of using the `OTP` model.

**Solution**: Updated resendOTP to use the OTP model:
- Uses `OTP.create()` instead of `User.updateOTP()`
- Creates new OTP records in the dedicated `otps` table
- Proper OTP lifecycle management with purpose tracking ('registration', 'login', etc.)

**Changes in authController.js**:
- Fixed resendOTP to use OTP model
- Added proper error handling for OTP creation
- Added audit logging

**Files Modified**: `backend/controllers/authController.js`

---

### 4. **User Model - Removed Unused OTP Methods** ✓
**Problem**: User.js contained `updateOTP()` and `verifyOTP()` methods that duplicated OTP model functionality.

**Solution**: Removed deprecated methods:
- Removed `User.updateOTP()` - OTPs are now managed via OTP model
- Removed `User.verifyOTP()` - Use `OTP.verify()` instead
- Kept only `updateVerification()` to mark users as verified after OTP verification

**Files Modified**: `backend/models/User.js`

---

### 5. **VerifyOTP - Enhanced for Login and Registration** ✓
**Problem**: The verifyOTP method didn't properly mark users as verified for registration flow.

**Solution**: Updated verifyOTP to handle both scenarios:
- Marks user as verified if not already verified (registration flow)
- Updates last login timestamp (login flow)
- Returns user profile with token
- Added proper error handling and logging

**Changes in authController.js**:
- User marked as verified only if `is_verified` is false
- Last login timestamp updated for all verification
- Proper logging of verification actions

**Files Modified**: `backend/controllers/authController.js`

---

## Database Schema

### OTP Table (Already Exists)
```sql
CREATE TABLE otps (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(100) NOT NULL,
  otp VARCHAR(6) NOT NULL,
  purpose ENUM('registration', 'login', 'password_reset', 'vote') DEFAULT 'registration',
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  INDEX idx_email (email),
  INDEX idx_otp (otp)
)
```

### Users Table - Updated Fields
- `is_verified`: Boolean flag for email verification status
- `verified_at`: Timestamp of verification
- `failed_login_attempts`: Counter for failed login attempts (auto-reset on successful login)
- `locked_until`: Timestamp until account is locked (15 minutes after 5 failed attempts)

---

## Authentication Flow Diagrams

### Registration Flow
```
User Registration Request
    ↓
Validate Input & Check Duplicate Email
    ↓
Hash Password & Create User
    ↓
Generate OTP & Save to OTP Table
    ↓
Send OTP Email
    ↓
Return User ID & Email
    ↓
User Receives Email with OTP
    ↓
User Submits OTP
    ↓
Verify OTP from OTP Table
    ↓
Mark User as is_verified = true
    ↓
Generate JWT Token
    ↓
Return Token & User Profile
```

### Login Flow
```
User Login Request (Email & Password)
    ↓
Check Account Lock Status
    ↓
Find User by Email
    ↓
Verify Password
    ↓
Check if User is_verified
    ↓
Generate OTP & Save to OTP Table
    ↓
Send OTP Email
    ↓
Return Message: "OTP sent"
    ↓
User Receives Email with OTP
    ↓
User Submits OTP
    ↓
Verify OTP from OTP Table
    ↓
Update Last Login
    ↓
Generate JWT Token
    ↓
Return Token & User Profile
```

---

## Environment Configuration

Ensure `.env` file has these settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=smart_voting_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# OTP Configuration
OTP_EXPIRE=5  # minutes

# Email Configuration (for OTP sending)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=Smart E-Voting System <noreply@votingsystem.com>
```

---

## Testing Instructions

### Prerequisites
1. MySQL server running on localhost:3306
2. Node.js environment configured
3. Backend server running on port 5000
4. Installed dependencies: `npm install`

### Initialize Database
```bash
cd backend
node config/initDatabase.js
```

This will create all tables including the `otps` table.

### Start Backend Server
```bash
cd backend
npm start
```

The server should start on http://localhost:5000

### Run Integration Tests

#### Automated Test (without user input)
```bash
cd backend
node testAuthIntegration.js
```

This test will:
- Check server connectivity
- Test voter registration
- Test election officer registration (with required fields)
- Test invalid registration scenarios
- Test login OTP flow
- Test invalid login scenarios
- Test OTP validation

**Output**: Shows passed/failed tests with detailed error messages.

#### Interactive Test (with OTP input)
```bash
cd backend
node testAuthFlow.js
```

This test requires manual OTP input from backend console output:
- Step 1: Register voter
- Step 2: Enter OTP from backend console
- Step 3: Verify registration
- Step 4: Register election officer
- Step 5: Login with credentials
- Step 6: Enter OTP from backend console
- Step 7: Complete login

### Manual Testing via Postman/curl

#### 1. Register Voter
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Voter",
    "email": "john@example.com",
    "password": "ValidPassword123!@#",
    "phone": "9876543210",
    "role": "voter"
  }'
```

Response:
```json
{
  "message": "Registration successful. Please verify your email with OTP.",
  "userId": "uuid",
  "email": "john@example.com",
  "role": "voter"
}
```

#### 2. Register Election Officer
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Officer",
    "email": "jane@example.com",
    "password": "ValidPassword123!@#",
    "phone": "9876543211",
    "role": "election_officer",
    "department": "Elections Department",
    "designation": "Senior Officer",
    "assignment_area": "District A"
  }'
```

#### 3. Login (sends OTP)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "ValidPassword123!@#"
  }'
```

Response:
```json
{
  "message": "OTP sent to your email. Please verify to complete login.",
  "email": "john@example.com"
}
```

Note: Check backend console for actual OTP (in development mode)

#### 4. Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

Response on success:
```json
{
  "message": "Verification successful",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Voter",
    "role": "voter"
  }
}
```

#### 5. Get User Profile (with token)
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIs..."
```

---

## Key Implementation Details

### Password Validation
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number
- Must contain special character (@$!%*?&)

### OTP Management
- 6-digit numeric code
- 5-minute expiration (configurable via OTP_EXPIRE env)
- Marked as verified after successful use
- Purpose tracking: registration, login, password_reset, vote

### Security Features
- Failed login attempt tracking (max 5)
- Account locking for 15 minutes after 5 failed attempts
- Password hashing with bcrypt (10 rounds)
- JWT token expiration (7 days)
- Rate limiting on auth endpoints
- CORS protection
- Helmet security headers

### Error Handling
- Proper HTTP status codes (400, 401, 403, 404, 409, 429, 500)
- Descriptive error messages
- Validation error details
- Account lock detection
- OTP expiration handling

---

## Migration Notes

If upgrading from old system:

1. Existing users without `is_verified` flag will need manual verification
2. OTP table must be created (done by initDatabase.js)
3. OTP records in users table can be migrated or cleared
4. Update frontend to handle OTP verification after login

---

## Troubleshooting

### "Cannot connect to server"
- Ensure backend is running: `npm start` in backend directory
- Check if port 5000 is available
- Verify no firewall blocking connections

### "Email not verified" error on login
- User needs to verify registration OTP first
- Use POST /auth/resend-otp if OTP is lost
- Check backend logs for email sending issues

### "Invalid OTP" error
- OTP must be exactly 6 digits
- OTP expires after 5 minutes
- Check backend console for actual OTP
- Use resend-otp endpoint to get new OTP

### Email not sending
- Check EMAIL_* environment variables
- Gmail requires app passwords (not regular password)
- Check gmail account security settings
- Verify SMTP credentials in .env

### Test failures
- Ensure database is initialized: `node config/initDatabase.js`
- Check database connectivity
- Verify all environment variables are set
- Check backend console for detailed errors

---

## Summary of Changes

| File | Changes | Status |
|------|---------|--------|
| `frontend/src/pages/Register.jsx` | Added roles array with 4 role types, role-specific field rendering | ✓ Fixed |
| `backend/controllers/authController.js` | Fixed login to send OTP, updated resendOTP to use OTP model, enhanced verifyOTP | ✓ Fixed |
| `backend/models/User.js` | Removed updateOTP and verifyOTP methods | ✓ Fixed |
| `backend/models/OTP.js` | No changes needed (already correct) | ✓ OK |
| `backend/config/initDatabase.js` | No changes needed (OTP table exists) | ✓ OK |
| `backend/testAuthIntegration.js` | Created new integration test | ✓ Created |
| `backend/testAuthFlow.js` | Created new interactive test | ✓ Created |

---

## Verification Checklist

- [ ] Database initialized with all tables
- [ ] Backend server running on port 5000
- [ ] Email configuration working (optional for basic testing)
- [ ] Test suite runs successfully
- [ ] Manual registration works
- [ ] OTP verification works
- [ ] Login with OTP works
- [ ] Profile endpoint returns user data with token
- [ ] Invalid inputs properly rejected
- [ ] Role-specific fields required for officers
