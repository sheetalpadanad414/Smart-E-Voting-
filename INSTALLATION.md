# Smart E-Voting System - Installation & Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm or yarn
- MySQL Server (v5.7 or higher)
- Git (optional)

## Project Structure

```
Smart-E-Voting-/
├── backend/                 # Node.js/Express backend
│   ├── config/             # Database & configuration
│   ├── controllers/        # Request handlers (MVC)
│   ├── models/             # Data models
│   ├── routes/             # API routes
│   ├── middleware/         # Middleware functions
│   ├── services/           # Business logic
│   ├── utils/              # Utility functions
│   ├── package.json        # Dependencies
│   ├── server.js           # Entry point
│   └── .env.example        # Environment template
│
├── frontend/                # React frontend
│   ├── public/             # Static files
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── contexts/       # State management
│   │   ├── styles/         # CSS files
│   │   ├── App.jsx         # Main app
│   │   └── index.jsx       # Entry point
│   ├── package.json        # Dependencies
│   └── tailwind.config.js  # Tailwind CSS config
│
└── README.md              # Main documentation
```

## Backend Setup (Windows/Mac/Linux)

### Step 1: Navigate to Backend Directory
```bash
cd Smart-E-Voting-/backend
```

### Step 2: Create & Configure Environment File
```bash
# Copy example environment file
copy .env.example .env
# Or on Mac/Linux:
cp .env.example .env
```

### Step 3: Edit Environment Variables
Open `.env` file and configure:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost          # MySQL host
DB_USER=root              # MySQL username
DB_PASSWORD=your_password # MySQL password (change this!)
DB_NAME=smart_voting_db   # Database name
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRE=7d

# OTP Configuration
OTP_EXPIRE=5              # OTP expiry in minutes

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password  # Use Gmail app password
EMAIL_FROM=Smart E-Voting System <noreply@votingsystem.com>

# API Configuration
API_BASE_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Security
BCRYPT_ROUNDS=10
```

**Important Notes:**
- For Gmail: Generate an [App Password](https://myaccount.google.com/apppasswords)
- Change `JWT_SECRET` to a strong random string
- Change `DB_PASSWORD` to your actual MySQL password

### Step 4: Install Dependencies
```bash
npm install
```

This will install all required packages:
- express
- mysql2
- jsonwebtoken
- bcryptjs
- nodemailer
- pdfkit
- node-schedule
- helmet
- cors
- express-validator
- And more...

### Step 5: Initialize Database

#### Create MySQL Database:
```bash
# Using MySQL CLI
mysql -u root -p
CREATE DATABASE smart_voting_db;
exit;

# Or use MySQL Workbench
```

#### Run Database Initialization Script:
```bash
# Make sure you're in the backend directory
cd Smart-E-Voting-/backend

# Then run the initialization script
node config/initDatabase.js
```

This will create all necessary tables:
- users
- elections
- candidates
- votes
- otps
- audit_logs
- election_results_cache

### Step 6: Start Backend Server

**Development Mode (with auto-reload):**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

You should see:
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

### Backend API Endpoints
- Base URL: `http://localhost:5000/api`
- Health Check: `http://localhost:5000/health`

## Frontend Setup (Windows/Mac/Linux)

### Step 1: Navigate to Frontend Directory
```bash
cd Smart-E-Voting-/frontend
```

### Step 2: Create Environment File (Optional)
```bash
# Create .env.local file
echo REACT_APP_API_URL=http://localhost:5000/api > .env.local
```

### Step 3: Install Dependencies
```bash
npm install
```

This will install:
- react
- react-router-dom
- axios
- chart.js
- tailwindcss
- zustand
- react-icons
- react-hot-toast
- And more...

### Step 4: Start Frontend Development Server
```bash
npm start
```

The application will automatically open in your browser at:
```
http://localhost:3000
```

## Complete Startup Sequence

### Opening 2 Terminal/Command Prompt Windows:

**Terminal 1 - Backend:**
```bash
cd Smart-E-Voting-/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd Smart-E-Voting-/frontend
npm start
```

Wait for both servers to start, then navigate to `http://localhost:3000`

## First Time Setup Walkthrough

### 1. Register as a Voter
- Go to http://localhost:3000/register
- Fill in registration form
- Verify email with OTP (check email)
- You'll be logged in as a voter

### 2. Create Admin Account
From Backend (Terminal):
```bash
# Use curl or Postman to create admin
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "Admin@123456",
    "phone": "9876543210"
  }'
```

Or use the voter registration form, then manually change role in database:
```bash
mysql -u root -p smart_voting_db
UPDATE users SET role = 'admin', is_verified = 1 WHERE email = 'admin@example.com';
EXIT;
```

### 3. Login with Different Roles
- **As Voter**: Use voter credentials
- **As Admin**: Use admin credentials

## Troubleshooting

### Backend Won't Start

**Error: "Database connection failed"**
- Check MySQL is running
- Verify DB credentials in .env
- Ensure database exists: `CREATE DATABASE smart_voting_db;`

**Error: "module not found"**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

**Error: "Port 5000 already in use"**
```bash
# Change port in .env
# Or kill process using port 5000
# Windows: netstat -ano | findstr :5000
# Mac/Linux: lsof -i :5000
```

### Frontend Won't Start

**Error: "Cannot find module"**
```bash
cd frontend
npm install
```

**Error: "CORS issues"**
- Verify backend is running
- Check FRONTEND_URL in backend .env
- Clear browser cache

**Error: "Cannot connect to backend"**
- Ensure backend is running on port 5000
- Check .env.local API URL
- Check browser console for errors

### OTP Email Not Sending

**Error: "Failed to send OTP email"**

1. **For Gmail:**
   - Go to [Google Account](https://myaccount.google.com)
   - Enable 2-Step Verification
   - Generate [App Password](https://myaccount.google.com/apppasswords)
   - Use that password in .env (not your regular password)

2. **For Other Email Providers:**
   - Check SMTP settings in .env
   - Ensure "Less secure apps" is enabled (if applicable)
   - Verify credentials

### Database Issues

**Error: "Can't connect to MySQL server"**
```bash
# Start MySQL
# Windows: services.msc → MySQL → Start
# Mac: brew services start mysql
# Linux: sudo service mysql start
```

**Error: "ER_BAD_DB_ERROR"**
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE smart_voting_db;"
```

## Database Backup & Restore

### Backup Database:
```bash
# Windows
mysqldump -u root -p smart_voting_db > backup.sql

# Mac/Linux
mysqldump -u root -p smart_voting_db > backup.sql
```

### Restore Database:
```bash
mysql -u root -p smart_voting_db < backup.sql
```

## Testing the API

### Using Postman or curl:

1. **Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password@123",
    "phone": "9876543210"
  }'
```

2. **Verify OTP:**
```bash
curl -X POST http://localhost:5000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "otp": "123456"
  }'
```

3. **Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password@123"
  }'
```

## Production Deployment

### Backend (Heroku/DigitalOcean):
1. Set environment variables
2. Run: `npm install`
3. Run: `node config/initDatabase.js`
4. Start: `npm start`

### Frontend (Vercel/Netlify):
1. Build: `npm run build`
2. Deploy build folder
3. Configure API URL in env variables

## Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MySQL Documentation](https://dev.mysql.com/doc)
- [JWT.io](https://jwt.io)
- [Tailwind CSS](https://tailwindcss.com)

## Support & Issues

For issues:
1. Check [Troubleshooting](#troubleshooting) section
2. Review error logs in console
3. Check database connection
4. Verify .env configuration
5. Clear browser cache & restart servers

## Next Steps

After successful installation:
1. ✅ Create elections as admin
2. ✅ Add candidates to elections
3. ✅ Test voting as voter
4. ✅ View results dashboard
5. ✅ Export results as PDF

---

**Need help?** Check logs, error messages, and .env configuration first!
