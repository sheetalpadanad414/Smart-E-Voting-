# Smart E-Voting System - Complete Setup Guide

## 📋 Project Overview

A comprehensive, secure, and transparent digital voting platform built with:
- **Frontend**: React 18 + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MySQL
- **Authentication**: JWT + Bcrypt + OTP
- **Architecture**: MVC Pattern with Role-Based Access Control

## 🎯 Core Features

### ✅ Role-Based System
- **Admin**: Full system control, user management, election management
- **Election Officer**: Monitor elections in real-time, generate reports
- **Voter**: Cast votes, view results, OTP verification required
- **Observer**: View public elections and results (read-only)

### ✅ Security Features
- JWT token-based authentication
- Bcrypt password hashing (10 rounds)
- OTP email verification (6-digit, 5-minute expiry)
- Account lockout after 5 failed login attempts (15 minutes)
- Role-Based Access Control (RBAC)
- One vote per election enforcement (unique constraint)
- IP tracking and device fingerprinting
- Rate limiting on sensitive endpoints
- CORS security headers

### ✅ Functional Features
- User registration with email OTP verification
- Secure login with session management
- Complete CRUD operations for users, elections, and candidates
- Real-time election results with visualization
- PDF export of election results
- Voting history tracking
- Comprehensive audit logging
- Auto election start/completion based on scheduled dates
- Voter turnout statistics
- Fraud detection and monitoring

---

## 🚀 Installation & Setup

### Prerequisites

1. **MySQL Server** (v5.7+)
   - Download from: https://dev.mysql.com/downloads/mysql/
   - Or use XAMPP: https://www.apachefriends.org/

2. **Node.js** (v16+)
   - Download from: https://nodejs.org/

3. **npm** (comes with Node.js)

4. **Git** (optional but recommended)

### Step 1: Clone/Setup Project

```bash
# Use existing project directory
cd d:\Smart-E-Voting-
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

**Key Dependencies Installed:**
- express (Web framework)
- mysql2 (Database driver)
- jsonwebtoken (JWT authentication)
- bcryptjs (Password hashing)
- nodemailer (Email service)
- pdfkit (PDF generation)
- node-schedule (Job scheduling)
- express-validator (Input validation)
- helmet (Security headers)
- cors (Cross-origin support)
- express-rate-limit (Rate limiting)

### Step 3: Configure Backend Environment

Edit `backend/.env` with your values:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=smart_voting_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Security
BCRYPT_ROUNDS=10

# OTP Configuration (in minutes)
OTP_EXPIRE=5

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM="Smart E-Voting System" <noreply@votingsystem.com>

# API Configuration
FRONTEND_URL=http://localhost:3000
```

**Gmail Setup for Email Service:**
1. Enable 2-Factor Authentication in Gmail
2. Generate App Password: https://myaccount.google.com/apppasswords
3. Use the 16-character password in EMAIL_PASSWORD

### Step 4: Initialize Database

```bash
# From backend directory
node config/initDatabase.js
```

This will:
- Create database: `smart_voting_db`
- Create all required tables (users, elections, candidates, votes, otps, audit_logs, etc.)
- Set up foreign keys and indexes

### Step 5: Start Backend Server

```bash
# From backend directory
npm run dev
```

Expected Output:
```
==================================================
Smart E-Voting System Backend
Server running on port 5000
Environment: development
Frontend URL: http://localhost:3000
==================================================
✓ Database Connected Successfully
✓ Election scheduler started
```

### Step 6: Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Key Frontend Dependencies:**
- react-router-dom (Navigation)
- axios (HTTP client)
- zustand (State management)
- tailwindcss (Styling)
- react-hot-toast (Notifications)
- chart.js & recharts (Data visualization)
- react-icons (Icon library)

### Step 7: Configure Frontend Environment

Create/Edit `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Smart E-Voting System
```

### Step 8: Start Frontend Server

```bash
# From frontend directory
npm start
```

Frontend will open at: **http://localhost:3000**

---

## 📖 User Guide

### Creating Test User Accounts

#### 1. **Admin Account** (Manual Database Insertion - Recommended)

```sql
-- Run this in MySQL
use smart_voting_db;

INSERT INTO users (
  id, name, email, password, phone, role, 
  is_verified, verified_at, created_at
) VALUES (
  UUID(),
  'System Admin',
  'admin@votingsystem.com',
  '$2a$10$...',  -- See bcrypt hash below
  '9999999999',
  'admin',
  1,
  NOW(),
  NOW()
);
```

**Generate Bcrypt Hash for password**: `Password@123`
- Use online tool: https://bcrypt-generator.com/
- Or use Node.js: `require('bcryptjs').hashSync('Password@123', 10)`

#### 2. **Voter Account** (Via Registration Form)

1. Navigate to **http://localhost:3000/register**
2. Select "Voter" role
3. Fill in details:
   - Name: John Doe
   - Email: voter@example.com
   - Password: SecurePass@123 (min 8 chars, uppercase, lowercase, number, special char)
   - Phone: +91 9876543210
4. Click Register → OTP will be sent to email
5. Check console/email service logs for OTP
6. Enter OTP to verify email

#### 3. **Election Officer / Observer Account**

Similar to voter, but:
- Select "Election Officer" or "Observer" role
- Provide Department and Designation (required)
- Optionally set Assignment Area

### Using the Application

#### **Admin Dashboard**
- URL: `http://localhost:3000/admin/dashboard`
- Credentials: Use admin email created above
- Can:
  - View system statistics (users, elections)
  - Create/edit/delete elections
  - Add candidates to elections
  - Manage users (create, edit, delete)
  - View audit logs

#### **Voter Interface**
- URL: `http://localhost:3000/voter/elections`
- Can:
  - View available elections
  - Cast vote (with OTP verification)
  - View voting history
  - Check election results

#### **Election Officer Dashboard**
- URL: `http://localhost:3000/election-officer/dashboard`
- Can:
  - Monitor assigned elections in real-time
  - Track voter turnout
  - Generate live reports
  - Export election data

#### **Observer Interface**
- URL: `http://localhost:3000/observer/elections`
- Can:
  - View public elections
  - See election results
  - Analyze voting trends
  - Generate public reports

---

## 🗳️ Voting Flow

### Step-by-Step Voting Process

1. **Login as Voter**
   ```
   Email: voter@example.com
   Password: SecurePass@123
   ```

2. **View Elections**
   - Navigate to "Available Elections"
   - See all active and upcoming elections

3. **Select Election**
   - Click on election to view candidates
   - Check election status and timing

4. **Request OTP**
   - Click "Request OTP"
   - OTP sent to registered email (expires in 5 minutes)

5. **Verify OTP**
   - Enter 6-digit OTP
   - System confirms verification

6. **Cast Vote**
   - Select candidate of choice
   - Confirm selection
   - Vote recorded as "VOTED" in database

7. **View Results**
   - See live election results
   - Download PDF report

**Security Guarantees:**
- ✓ One vote per election (database UNIQUE constraint)
- ✓ Vote is immutable (cannot change after casting)
- ✓ All votes encrypted with candidate_id, voter_id, election_id
- ✓ Voter identity kept confidential in results

---

## 🔐 Database Schema

### Key Tables

**users**
- id (UUID Primary Key)
- name, email, phone
- password (bcrypted)
- role (admin/voter/election_officer/observer)
- is_verified (Boolean)
- failed_login_attempts, locked_until
- last_login

**elections**
- id (UUID Primary Key)
- title, description
- start_date, end_date
- status (draft/active/completed)
- is_public (Boolean)
- created_by (FK to users)

**candidates**
- id (UUID Primary Key)
- election_id (FK)
- name, symbol, image_url
- party_name, position
- vote_count (denormalized for performance)

**votes**
- id (UUID Primary Key)
- election_id, voter_id, candidate_id (FK)
- voted_at (timestamp)
- ip_address, device_info
- UNIQUE(election_id, voter_id) - prevents duplicate votes

**otps**
- id (UUID Primary Key)
- email, otp (6-digit)
- purpose (registration/vote/password_reset)
- is_verified, expires_at

**audit_logs**
- id (UUID Primary Key)
- user_id, action, entity_type, entity_id
- changes (JSON)
- ip_address, created_at
- Tracks all user actions for compliance

---

## 🛠️ API Documentation

### Authentication Endpoints

**Register User**
```
POST /api/auth/register
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass@123",
  "phone": "9876543210",
  "role": "voter",
  "department": "CSE" (optional for voters),
  "designation": "Student" (optional for voters)
}
```

**Login**
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "SecurePass@123"
}
Response: { token, user }
```

**Verify OTP**
```
POST /api/auth/verify-otp
Body: {
  "email": "john@example.com",
  "otp": "123456"
}
```

### Admin Endpoints

**Get Dashboard Stats**
```
GET /api/admin/dashboard
Headers: Authorization: Bearer {token}
Response: { users, elections, recent_activities }
```

**Create Election**
```
POST /api/admin/elections
Body: {
  "title": "General Elections 2024",
  "description": "National general elections",
  "start_date": "2024-02-15T09:00:00",
  "end_date": "2024-02-15T18:00:00",
  "is_public": true
}
```

**Add Candidate**
```
POST /api/admin/candidates
Body: {
  "election_id": "uuid",
  "name": "John Smith",
  "party_name": "Party A",
  "symbol": "🌾",
  "image_url": "https://...",
  "position": "President"
}
```

### Voter Endpoints

**Request Vote OTP**
```
POST /api/voter/vote/request-otp
Headers: Authorization: Bearer {token}
Response: { message: "OTP sent" }
```

**Cast Vote**
```
POST /api/voter/vote
Headers: Authorization: Bearer {token}
Body: {
  "election_id": "uuid",
  "candidate_id": "uuid"
}
Response: { message: "Vote cast successfully" }
```

**Get Election Results**
```
GET /api/voter/elections/{electionId}/results
Response: {
  "election": {...},
  "results": {
    "candidates": [{name, vote_count, percentage}, ...],
    "total_votes": 150,
    "turnout": "75.5%"
  }
}
```

---

## 🧪 Testing Checklist

### Manual Testing

- [ ] User Registration & OTP Verification
- [ ] Login/Logout functionality
- [ ] Role-based dashboard access
- [ ] Create election (Admin)
- [ ] Add candidates (Admin)
- [ ] Cast vote with OTP (Voter)
- [ ] Duplicate voting prevention
- [ ] View live results
- [ ] Export results as PDF
- [ ] Audit log tracking

### Automated Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

---

## 📊 Performance Optimization

### Database Indexes
- Email lookup: `idx_email`
- Role filtering: `idx_role`
- Election status: `idx_status`
- Vote lookup: `idx_election_id`, `idx_voter_id`

### Caching Strategy
- Election results cache in `election_results_cache` table
- Updated on election completion

### Rate Limiting
- 100 requests per 15 minutes per IP
- Stricter limits on auth endpoints

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check MySQL is running
mysql -u root -p

# If error, restart MySQL service
# Windows: Services > MySQL * > Start
# macOS/Linux: brew services restart mysql
```

### OTP Not Sending

1. Verify Gmail settings in `.env`
2. Check "Less secure apps" setting (if not using App Password)
3. Check server logs for mail errors
4. Use dummy OTP: check backend console during development

### Port Already in Use

```bash
# Backend (Windows)
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Frontend (Windows)
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### CORS Errors in Frontend

- Ensure `FRONTEND_URL` is correct in backend `.env`
- Verify API URL in frontend `.env`
- Check browser console for exact error

---

## 📁 Project Structure

```
Smart-E-Voting/
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL connection pool
│   │   ├── initDatabase.js      # Schema creation
│   │   └── paths.js             # File paths
│   ├── controllers/             # Business logic
│   ├── models/                  # Database models
│   ├── routes/                  # API endpoints
│   ├── middleware/              # Auth, validation, error handling
│   ├── services/                # Business services
│   ├── utils/                   # Helpers (auth, email, PDF)
│   ├── reports/                 # Generated PDFs
│   ├── server.js                # Entry point
│   ├── package.json
│   └── .env                     # Environment config
│
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Page components
│   │   ├── services/            # API services
│   │   ├── contexts/            # State management (Zustand)
│   │   ├── styles/              # CSS/Tailwind
│   │   ├── App.jsx              # Main component
│   │   └── index.jsx            # Entry point
│   ├── public/
│   ├── package.json
│   ├── .env                     # Environment config
│   └── tailwind.config.js       # Tailwind configuration
│
├── README.md                    # Project readme
├── Installation.md              # Setup guide
└── API_DOCUMENTATION.md         # API reference
```

---

## 📝 Default Passwords & Credentials

For testing purposes only:

```
Admin:
  Email: admin@votingsystem.com
  Password: Password@123

Test Voter:
  Email: voter@example.com
  Password: SecurePass@123
```

**⚠️ IMPORTANT:** Change all default credentials before production deployment!

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **JWT Secret**: Use strong, random string (min 32 characters)
3. **Bcrypt Rounds**: Keep at 10 for balance between security and performance
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Enabled on all sensitive endpoints
6. **Input Validation**: All inputs validated on backend
7. **SQL Injection**: Protected via parameterized queries
8. **XSS Protection**: Helmet headers enabled

---

## 🚀 Deployment

### Build Frontend for Production

```bash
cd frontend
npm run build
```

This creates optimized build in `frontend/build/`

### Environment Configuration for Production

Update `.env` files with production values:
- Change `NODE_ENV` to `production`
- Use production database URL
- Update `FRONTEND_URL` to actual domain
- Use strong JWT_SECRET
- Configure email service with production account

### Deploy Backend

Options:
- Heroku
- Railway
- Render
- DigitalOcean
- AWS EC2

### Deploy Frontend

Options:
- Vercel (Recommended for React)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

---

## 📞 Support & Contact

For issues, improvements, or questions:
- Check existing documentation
- Review API documentation
- Check audit logs for errors
- Enable verbose logging: `NODE_ENV=debug`

---

## 📜 License

This project is licensed under the MIT License.

---

## 👥 Authors

- Sheetal Padanad
- Sammed Chougale

**BCA Final Year Project**
**Institution**: [Your Institution Name]
**Academic Year**: 2024-2025

---

## 🎉 Congratulations!

Your Smart E-Voting System is now ready!

### Quick Start Summary
```bash
# Terminal 1: Start Backend
cd backend
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm start

# Open Browser
http://localhost:3000
```

Happy voting! 🗳️
