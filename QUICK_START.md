# Quick Start Guide - Smart E-Voting System

## ✅ System is Ready!

Your Smart E-Voting system is now fully configured with:
- ✅ Database created and initialized
- ✅ Admin user created
- ✅ Test election with 4 candidates
- ✅ OTP verification system
- ✅ Voting system with duplicate prevention

## 🚀 Start the Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```
Backend runs on: **http://localhost:5000**

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```
Frontend runs on: **http://localhost:3000**

## 👤 Login Credentials

### Admin Login
- URL: http://localhost:3000/login
- Email: `admin@evoting.com`
- Password: `admin123`

## 📝 Test the Voting Flow

### Step 1: Register as Voter
1. Go to: http://localhost:3000/register
2. Fill the form:
   - Name: Your Name
   - Email: your@email.com
   - Phone: 1234567890
   - Password: password123
   - Confirm Password: password123
3. Click "Create Account"

### Step 2: Verify OTP
1. You'll be redirected to OTP verification page
2. **OTP will be shown in a toast notification** (top-right corner)
3. Enter the 6-digit OTP
4. Click "Verify OTP"

### Step 3: Cast Vote
1. You'll be redirected to voting page
2. See the election: "Student Council Election 2024"
3. Choose from 4 candidates:
   - John Smith (Progressive Party) 🌟
   - Sarah Johnson (Unity Alliance) 🎯
   - Michael Brown (Independent) 🏆
   - Emily Davis (Student First) ⭐
4. Click on a candidate to select
5. Click "Cast Vote"

### Step 4: Success!
- You'll see a success message
- Vote is recorded in database
- You cannot vote again

## 🔧 Useful Commands

### Create New Admin
```bash
cd backend
node createAdmin.js
```

### Setup New Test Election
```bash
cd backend
node setupTestElection.js
```

### Test Complete Flow (Automated)
```bash
cd backend
node testVotingFlow.js
```

### Check Database
```bash
# View users
SELECT email, otp, is_verified, has_voted FROM users;

# View votes
SELECT * FROM votes;

# View election results
SELECT c.name, c.party_name, c.vote_count 
FROM candidates c 
ORDER BY c.vote_count DESC;
```

## 📊 Current Election

**Student Council Election 2024**
- Status: Active
- Candidates: 4
- Duration: 7 days

## 🎯 Key Features

### OTP System
- ✅ OTP stored in MySQL (no email service needed)
- ✅ OTP displayed in toast for testing
- ✅ 5-minute expiration
- ✅ Resend OTP functionality

### Voting System
- ✅ Only verified users can vote
- ✅ One vote per user per election
- ✅ Real-time candidate selection
- ✅ Vote count tracking
- ✅ Duplicate vote prevention

### Security
- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ Account lockout after failed attempts
- ✅ OTP expiration
- ✅ Database constraints

## 📱 Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | / | Landing page |
| Login | /login | User/Admin login |
| Register | /register | New user registration |
| Verify OTP | /verify-otp | OTP verification |
| Cast Vote | /cast-vote | Voting page |
| Vote Success | /vote-success | Confirmation page |
| Admin Dashboard | /admin/dashboard | Admin panel |

## 🐛 Troubleshooting

### OTP not showing?
- Check browser console (F12)
- Look for toast notification in top-right
- Or check database: `SELECT otp FROM users WHERE email = 'your@email.com'`

### Cannot vote?
- Make sure you verified OTP
- Check if election is active
- Verify you haven't voted already

### Backend not starting?
- Check if MySQL is running
- Verify .env file exists
- Run: `node create-database.js`

## 📚 Documentation

For detailed documentation, see:
- `VOTING_SETUP_GUIDE.md` - Complete setup guide
- `API_DOCUMENTATION.md` - API endpoints
- `README.md` - Project overview

## 🎓 For Your BCA Project

This system includes:
- ✅ Complete voter registration
- ✅ OTP-based verification
- ✅ Secure voting mechanism
- ✅ Admin panel for management
- ✅ Real-time vote counting
- ✅ Clean, documented code
- ✅ MySQL database integration
- ✅ React frontend with modern UI
- ✅ RESTful API backend

**Perfect for BCA Final Year Project!** 🎉

## 📞 Need Help?

Check the console logs:
- Backend: Terminal running `npm run dev`
- Frontend: Browser console (F12)
- Database: MySQL Workbench or command line

---

**Happy Voting! 🗳️**
