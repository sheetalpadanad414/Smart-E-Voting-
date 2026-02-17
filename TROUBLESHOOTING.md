# Troubleshooting Guide - Smart E-Voting System

## Common Issues and Solutions

### 1. "Failed to load election details"

**Symptoms:**
- Error message when trying to view election
- Blank page or loading spinner
- Console error: "Failed to load election details"

**Causes & Solutions:**

#### A. Backend Not Running
```bash
# Check if backend is running
curl http://localhost:5000/health

# If not running, start it
cd backend
npm run dev
```

#### B. MySQL Not Running
```powershell
# Check MySQL status
Get-Service MYSQL80

# Start MySQL (as Administrator)
net start MYSQL80
```

#### C. Database Not Initialized
```bash
cd backend
node config/initDatabase.js
```

#### D. No Elections in Database
```bash
cd backend
node createTestElection.js
```

#### E. Wrong Election ID in URL
- Check the URL: `http://localhost:3000/elections/:id/vote`
- Get valid election ID from: `http://localhost:3000/elections`

### 2. "Connection Refused" / "ERR_CONNECTION_REFUSED"

**Cause:** Backend server not started

**Solution:**
```bash
cd backend
npm run dev

# Should see:
# Server running on port 5000
```

### 3. "Please login to vote"

**Cause:** Not authenticated or token expired

**Solution:**
1. Go to http://localhost:3000/login
2. Login with:
   - Email: voter@test.com
   - Password: voter123
3. If voter doesn't exist:
   ```bash
   cd backend
   node createTestVoter.js
   ```

### 4. "You have already voted in this election"

**Cause:** Duplicate vote prevention working correctly

**Solution:**
- This is expected behavior
- Each user can only vote once per election
- To test again:
  1. Create a new voter account
  2. Or create a new election
  3. Or clear the vote from database (development only)

### 5. "Election is not currently active"

**Cause:** Election status is not "active"

**Solution:**
```sql
-- Check election status
SELECT id, title, status FROM elections;

-- Update to active
UPDATE elections SET status = 'active' WHERE id = 'your-election-id';
```

Or use admin panel to change status.

### 6. CORS Errors

**Symptoms:**
- Console error: "CORS policy blocked"
- "Access-Control-Allow-Origin" error

**Solution:**
Check backend/server.js has:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
```

### 7. "Invalid or expired OTP"

**Cause:** OTP expired (5 minutes default)

**Solution:**
- Click "Resend OTP"
- In development mode, OTP auto-fills
- Check console for OTP value

### 8. Frontend Not Loading

**Symptoms:**
- Blank page
- "Cannot GET /"
- Port 3000 not responding

**Solution:**
```bash
cd frontend
npm install
npm start
```

### 9. "Cannot find module" Errors

**Cause:** Dependencies not installed

**Solution:**
```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### 10. Database Connection Failed

**Symptoms:**
- "Access denied for user"
- "Unknown database"
- "ECONNREFUSED 127.0.0.1:3306"

**Solutions:**

#### A. Wrong Password
Edit `backend/.env`:
```
DB_PASSWORD=your_actual_password
```

#### B. Database Doesn't Exist
```bash
cd backend
node create-database.js
```

#### C. MySQL Not Running
```powershell
net start MYSQL80
```

## Debugging Steps

### 1. Check All Services

```bash
# MySQL
Get-Service MYSQL80

# Backend
curl http://localhost:5000/health

# Frontend
curl http://localhost:3000
```

### 2. Check Console Logs

**Browser Console (F12):**
- Look for red errors
- Check Network tab for failed requests
- Verify API calls are going to correct URL

**Backend Terminal:**
- Look for error messages
- Check for "Server running on port 5000"
- Verify database connection success

### 3. Test API Directly

```bash
# Test elections endpoint
curl http://localhost:5000/api/voter/elections

# Test specific election
curl http://localhost:5000/api/voter/elections/ELECTION_ID
```

### 4. Verify Database

```sql
-- Check elections
SELECT * FROM elections;

-- Check candidates
SELECT * FROM candidates;

-- Check votes
SELECT * FROM votes;

-- Check users
SELECT id, email, role FROM users;
```

## Quick Fixes

### Reset Everything
```bash
# 1. Stop all servers (Ctrl+C)

# 2. Drop and recreate database
cd backend
node create-database.js
node config/initDatabase.js

# 3. Create test data
node createAdmin.js
node createTestVoter.js
node createTestElection.js

# 4. Restart backend
npm run dev

# 5. Restart frontend (new terminal)
cd ../frontend
npm start
```

### Clear Browser Cache
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Clear Local Storage
```javascript
// In browser console
localStorage.clear();
location.reload();
```

## Testing Checklist

✅ MySQL is running
✅ Database exists and has tables
✅ Backend is running on port 5000
✅ Frontend is running on port 3000
✅ Admin user exists
✅ Test voter exists
✅ Test election exists with candidates
✅ Can access http://localhost:3000
✅ Can login as voter
✅ Can see elections list
✅ Can view election details
✅ Can cast vote
✅ Can view voting history

## Still Having Issues?

### 1. Run System Test
```bash
cd backend
node testVotingSystem.js
```

This will test all components and show exactly what's failing.

### 2. Check Logs
- Backend terminal output
- Browser console (F12)
- Network tab in DevTools

### 3. Verify Configuration
- `backend/.env` - Database credentials
- `frontend/.env` - API URL
- `backend/server.js` - CORS settings

### 4. Common Mistakes
- ❌ Wrong port numbers
- ❌ MySQL not started
- ❌ Wrong database password
- ❌ Not running `npm install`
- ❌ Using wrong election ID
- ❌ Not logged in
- ❌ Token expired

## Error Messages Reference

| Error | Meaning | Solution |
|-------|---------|----------|
| ECONNREFUSED | Service not running | Start the service |
| 401 Unauthorized | Not logged in | Login first |
| 404 Not Found | Wrong URL/ID | Check URL |
| 500 Internal Server Error | Backend error | Check backend logs |
| CORS Error | Cross-origin blocked | Check CORS config |
| ER_DUP_ENTRY | Duplicate vote | Expected behavior |
| ER_NO_SUCH_TABLE | Table missing | Run initDatabase.js |

## Getting Help

If you're still stuck:
1. Check all items in Testing Checklist
2. Run `node testVotingSystem.js`
3. Review error messages carefully
4. Check both browser and backend logs
5. Verify all configuration files
