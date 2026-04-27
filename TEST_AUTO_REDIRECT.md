# Test Auto-Redirect to Voting Page

## Prerequisites

1. **Create an Active Election** (as admin):
   - Login as admin
   - Go to Admin Dashboard → Manage Elections
   - Create a new election with:
     - Status: Active
     - Start Date: Today (or past date)
     - End Date: Tomorrow (or future date)
     - Add at least one candidate

## Test Steps

### 1. Start Application
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

### 2. Register New Voter
- Go to: http://localhost:3000/register
- Fill registration form (role: voter)
- Submit

### 3. Verify OTP
- OTP is auto-filled in development
- Click "Verify OTP"

### 4. Face Registration
- Face registration modal appears
- Allow camera access
- Capture your face
- Click "Register Face"

### 5. Watch Auto-Redirect
**Expected behavior:**
- ✅ "Face Registered Successfully!"
- ✅ "Finding active election..."
- ✅ "Redirecting to vote in: [Election Title]"
- ✅ Lands on `/elections/{id}/vote` page
- ✅ Voting interface appears

## Console Logs to Watch

```
✅ Face registered successfully, user logged in
🔑 Token saved to localStorage
🔍 Fetching active elections...
📊 Found X total elections
✅ Found active election: "Election Title" (ID: 123)
🎯 Redirecting to voting page for election: 123
```

## Test Scenarios

### Scenario A: With Active Election
- Create active election first
- Register voter
- **Expected**: Redirect to voting page

### Scenario B: No Active Election
- Ensure no active elections exist
- Register voter
- **Expected**: Redirect to /elections category page
- Toast: "No active elections at the moment"

### Scenario C: Multiple Active Elections
- Create 2+ active elections
- Register voter
- **Expected**: Redirect to first active election found

## Success Criteria

✅ User automatically logged in after face registration
✅ System fetches elections
✅ Finds active election
✅ Redirects to voting page
✅ User can vote immediately
✅ No manual navigation needed

## Troubleshooting

### Redirect not working?
- Check browser console for errors
- Verify token is in localStorage
- Check if election is truly active (status + dates)

### Goes to /elections instead of voting page?
- Verify election status is "active"
- Check start_date is in the past
- Check end_date is in the future
- Ensure election has candidates

### API error?
- Check backend is running
- Verify token is valid
- Check network tab for API response
