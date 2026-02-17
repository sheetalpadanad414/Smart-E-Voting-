# Smart E-Voting System - Complete Setup Guide

## Features Implemented

### 1. OTP Verification System
- OTP stored in MySQL database during registration
- OTP verification page to validate user
- Resend OTP functionality
- OTP expiration handling (5 minutes)

### 2. Voting System
- Fetch candidates from database
- Single vote per user per election
- Vote tracking with `has_voted` flag
- Prevent multiple voting
- Success confirmation page

## Setup Instructions

### 1. Database Setup

```bash
cd backend
node create-database.js
node config/initDatabase.js
node update-database.js
```

### 2. Create Admin User

```bash
node createAdmin.js
```

Default admin credentials:
- Email: admin@evoting.com
- Password: admin123

### 3. Start Backend Server

```bash
npm run dev
```

Backend will run on: http://localhost:5000

### 4. Start Frontend

```bash
cd frontend
npm start
```

Frontend will run on: http://localhost:3000

## User Flow

### Registration & OTP Verification

1. **Register** (`/register`)
   - User fills registration form
   - OTP is generated and stored in database
   - User is redirected to OTP verification page

2. **Verify OTP** (`/verify-otp`)
   - User enters 6-digit OTP
   - System validates OTP from database
   - On success: `is_verified = 1` in database
   - User is redirected to voting page

3. **Resend OTP**
   - Click "Resend OTP" button
   - New OTP is generated and updated in database
   - OTP is displayed in toast notification (for testing)

### Voting Flow

1. **Cast Vote** (`/cast-vote`)
   - User sees list of active elections
   - User selects an election
   - System fetches candidates from database
   - User selects one candidate
   - Click "Cast Vote" button

2. **Vote Submission**
   - System checks if user already voted
   - If not voted:
     - Vote is saved in `votes` table
     - `has_voted = 1` in `users` table
     - Candidate `vote_count` is incremented
   - If already voted: Error message shown

3. **Success Page** (`/vote-success`)
   - Confirmation message displayed
   - Shows selected candidate name
   - Option to return home

## API Endpoints

### OTP Endpoints

```
POST /api/otp/verify
Body: { email, otp }
Response: { success, message, user }

GET /api/otp/:email
Response: { email, otp, expires_at }

POST /api/otp/resend
Body: { email }
Response: { success, message, otp }
```

### Voting Endpoints

```
GET /api/vote/candidates/:electionId
Response: { success, election, candidates }

POST /api/vote/cast
Body: { electionId, candidateId, userId }
Response: { success, message, vote }

GET /api/vote/status/:electionId/:userId
Response: { success, hasVoted }
```

## Testing the System

### Option 1: Manual Testing

1. Open browser: http://localhost:3000
2. Click "Register"
3. Fill registration form
4. Note the OTP from toast notification
5. Enter OTP on verification page
6. Select candidate and cast vote

### Option 2: Automated Testing

```bash
cd backend
node testVotingFlow.js
```

This will:
- Register a new user
- Fetch OTP from database
- Verify OTP
- Get active elections
- Fetch candidates
- Cast a vote
- Test duplicate vote prevention

## Admin Tasks

### 1. Login as Admin

- URL: http://localhost:3000/login
- Email: admin@evoting.com
- Password: admin123

### 2. Create Election

1. Go to Admin Dashboard
2. Click "Manage Elections"
3. Create new election
4. Set status to "active"

### 3. Add Candidates

1. Go to "Manage Candidates"
2. Select election
3. Add candidate details:
   - Name
   - Party Name
   - Position
   - Symbol
   - Description

## Database Tables

### users
- `id` - User ID
- `email` - User email
- `otp` - Current OTP
- `otp_expires_at` - OTP expiration time
- `is_verified` - Email verification status
- `has_voted` - Voting status

### votes
- `id` - Vote ID
- `election_id` - Election reference
- `voter_id` - User reference
- `candidate_id` - Candidate reference
- `voted_at` - Timestamp

### candidates
- `id` - Candidate ID
- `election_id` - Election reference
- `name` - Candidate name
- `party_name` - Party name
- `vote_count` - Total votes received

## Security Features

1. **OTP Expiration**: OTP expires after 5 minutes
2. **Single Vote**: Unique constraint on (election_id, voter_id)
3. **Verification Required**: Only verified users can vote
4. **Active Election Check**: Only active elections allow voting
5. **Vote Tracking**: `has_voted` flag prevents multiple votes

## Important Notes

1. **OTP Display**: For testing, OTP is shown in toast notification. In production, send via email/SMS.

2. **No Email Service**: This implementation doesn't use email services. OTP is stored in database and displayed for testing.

3. **Simple & Clean**: Code is kept simple for BCA final year project requirements.

4. **MySQL Only**: All data stored in MySQL database, no external services needed.

## Troubleshooting

### Backend not starting
```bash
# Check if MySQL is running
# Verify .env file has correct credentials
# Run: node create-database.js
```

### OTP not working
```bash
# Check OTP in database:
SELECT email, otp, otp_expires_at FROM users WHERE email = 'your@email.com';
```

### Cannot vote
```bash
# Check if election is active:
SELECT * FROM elections WHERE status = 'active';

# Check if user is verified:
SELECT is_verified, has_voted FROM users WHERE email = 'your@email.com';
```

## Project Structure

```
backend/
├── controllers/
│   ├── otpController.js      # OTP verification logic
│   └── voteController.js     # Voting logic
├── routes/
│   ├── otpRoutes.js          # OTP endpoints
│   └── voteRoutes.js         # Voting endpoints
└── models/
    ├── User.js               # User model with OTP
    ├── Vote.js               # Vote model
    └── Candidate.js          # Candidate model

frontend/
└── src/
    └── pages/
        ├── VerifyOTP.jsx     # OTP verification page
        ├── CastVote.jsx      # Voting page
        └── VoteSuccess.jsx   # Success confirmation
```

## Conclusion

Your Smart E-Voting system is now complete with:
- ✅ OTP verification using MySQL
- ✅ Secure voting system
- ✅ Duplicate vote prevention
- ✅ Clean and simple code
- ✅ Ready for BCA final year project

Good luck with your project! 🎓
