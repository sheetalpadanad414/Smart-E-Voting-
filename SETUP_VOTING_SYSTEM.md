# Smart E-Voting System - Complete Setup Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Start MySQL
```bash
# Windows - Run as Administrator
net start MYSQL80

# Or use Services Manager (services.msc)
```

### Step 2: Setup Database
```bash
cd backend
node create-database.js
node config/initDatabase.js
```

### Step 3: Create Test Data
```bash
# Create admin user
node createAdmin.js

# Create test voter
node createTestVoter.js

# Create test election with candidates
node createTestElection.js
```

### Step 4: Start Backend
```bash
# In backend folder
npm run dev
```

### Step 5: Start Frontend
```bash
# In frontend folder (new terminal)
npm start
```

## 📋 Test Credentials

### Admin Login
- Email: `admin@evoting.com`
- Password: `admin123`
- URL: http://localhost:3000/login

### Voter Login
- Email: `voter@test.com`
- Password: `voter123`
- URL: http://localhost:3000/login

## 🗳️ Testing the Voting System

### 1. Login as Voter
```
http://localhost:3000/login
Email: voter@test.com
Password: voter123
```

### 2. Browse Elections
```
http://localhost:3000/elections
```

### 3. Cast Vote
- Click "Vote Now" on active election
- Select a candidate
- Click "Submit Vote"
- View success message
- Redirected to voting history

### 4. View Voting History
```
http://localhost:3000/voter/history
```

## 🔧 API Endpoints

### Public Endpoints (No Auth Required)
- `GET /api/voter/elections` - List all elections
- `GET /api/voter/elections/:id` - Get election details
- `GET /api/voter/elections/:id/results` - Get results

### Protected Endpoints (Auth Required)
- `POST /api/voter/vote` - Cast vote
- `GET /api/voter/voting-history` - Get voting history

## 🐛 Troubleshooting

### "Failed to load election details"
**Cause**: Backend not running or database not connected

**Fix**:
1. Check MySQL is running: `Get-Service MYSQL80`
2. Check backend is running on port 5000
3. Check browser console for errors
4. Verify election exists in database

### "Connection Refused"
**Cause**: Backend server not started

**Fix**:
```bash
cd backend
npm run dev
```

### "Election not found"
**Cause**: No test election created

**Fix**:
```bash
cd backend
node createTestElection.js
```

### "Please login to vote"
**Cause**: Not authenticated

**Fix**:
1. Login at http://localhost:3000/login
2. Use voter@test.com / voter123

### CORS Errors
**Cause**: Frontend and backend on different ports

**Fix**: Already configured in backend/server.js
```javascript
cors({
  origin: 'http://localhost:3000',
  credentials: true
})
```

## 📊 Database Schema

### Elections Table
- id (UUID)
- title
- description
- start_date
- end_date
- status (draft/active/completed)
- is_public
- created_by

### Candidates Table
- id (UUID)
- election_id
- name
- description
- position
- party_name
- symbol
- vote_count

### Votes Table
- id (UUID)
- election_id
- voter_id
- candidate_id
- voted_at
- ip_address
- device_info
- UNIQUE(election_id, voter_id) - Prevents duplicate voting

## 🎯 Features Implemented

✅ Dynamic election loading
✅ Candidate cards with details
✅ Radio button selection
✅ Duplicate vote prevention
✅ Active election validation
✅ Authentication required for voting
✅ Success message and redirect
✅ Voting history page
✅ Responsive blue UI
✅ Error handling
✅ Loading states
✅ CORS enabled
✅ API logging

## 🔐 Security Features

- JWT authentication
- Password hashing (bcrypt)
- Duplicate vote prevention (DB constraint)
- Election status validation
- IP address logging
- Device info tracking
- Audit logging
- Rate limiting

## 📱 Routes

### Frontend Routes
- `/` - Home
- `/login` - Login page
- `/register` - Registration
- `/elections` - Browse elections
- `/elections/:id/vote` - Cast vote
- `/voter/history` - Voting history
- `/admin/dashboard` - Admin dashboard

### Backend Routes
- `/api/auth/*` - Authentication
- `/api/voter/*` - Voter operations
- `/api/admin/*` - Admin operations

## 🎨 UI Components

- Election cards
- Candidate cards with photos
- Radio button selection
- Loading spinners
- Success/Error toasts
- Responsive grid layout
- Blue theme consistent with dashboard

## 📝 Development Mode Features

- Auto-populated OTP (no email required)
- Console logging for debugging
- Development OTP shown in toast
- Detailed error messages

## 🚀 Production Checklist

Before deploying to production:

1. ✅ Set `NODE_ENV=production` in .env
2. ✅ Configure real email service
3. ✅ Use strong JWT secret
4. ✅ Enable HTTPS
5. ✅ Configure proper CORS origins
6. ✅ Set up database backups
7. ✅ Enable rate limiting
8. ✅ Review security settings
9. ✅ Test all features
10. ✅ Monitor logs

## 📞 Support

If you encounter issues:
1. Check this guide
2. Review console logs (browser & backend)
3. Verify database connection
4. Check all services are running
5. Review error messages

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Backend shows "Server running on port 5000"
- ✅ Frontend loads at http://localhost:3000
- ✅ You can login as voter
- ✅ Elections list loads
- ✅ You can view election details
- ✅ You can select and submit vote
- ✅ Success message appears
- ✅ Redirected to voting history
- ✅ Vote appears in history
