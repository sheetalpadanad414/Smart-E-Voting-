# Test Face Registration - Quick Guide

## Start Application

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

### Terminal 2 - Frontend
```bash
cd frontend
npm start
```

## Test Steps

### 1. Register New Voter
- Open: http://localhost:3000/register
- Fill form (role: voter)
- Click "Create Account"

### 2. Verify OTP
- OTP auto-filled in development
- Click "Verify OTP"
- **WATCH**: Face registration modal should appear

### 3. Register Face
- Allow camera access
- Position face in oval guide
- Click "Capture Photo"
- Click "Register Face"
- **WATCH**: Success message → Redirect to /elections

## Expected Console Logs
```
✅ OTP Verified
👤 User Role: voter
🎭 Showing face registration modal for voter
✅ showFaceRegistration set to TRUE
🔍 Register Component - State: {step: "face", showFaceRegistration: true}
✅ Rendering FaceRegistration component
🎭 Starting face registration...
✅ Face detected!
💾 Storing face descriptor in database...
✅ Face descriptor stored successfully!
✅ Executing onSuccess callback NOW...
🔄 Redirecting to elections page in 2 seconds...
➡️ Redirecting to /elections
```

## Success Criteria
✅ Modal appears after OTP
✅ Camera works
✅ Face captured
✅ Descriptor saved
✅ Redirected to /elections
✅ User logged in

## If Issues
Check browser console for error logs
