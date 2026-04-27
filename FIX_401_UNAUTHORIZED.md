# Fixed: 401 Unauthorized Error During Face Registration ✅

## Problem Identified

**Error**: `POST /api/face/store-descriptor` returned **401 Unauthorized**

**Root Cause**: Token authentication mismatch
- Face API call requires token in `localStorage`
- During registration, token was stored in `sessionStorage` only
- API interceptor couldn't find token → 401 error
- Database never updated because API call failed

## The Issue

### Before Fix:
```javascript
// OTP verification (Register.jsx)
sessionStorage.setItem('pendingToken', token);  // ❌ Only in sessionStorage

// API interceptor (api.js)
const token = localStorage.getItem('token');    // ❌ Looking in localStorage
// Result: No token found → 401 Unauthorized
```

### API Interceptor Code:
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');  // Only checks localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

## Solution

Store token in **localStorage immediately** after OTP verification, so it's available for the face API call.

### After Fix:
```javascript
// OTP verification (Register.jsx)
localStorage.setItem('token', response.data.token);           // ✅ In localStorage
localStorage.setItem('user', JSON.stringify(response.data.user));
sessionStorage.setItem('pendingToken', response.data.token);  // Backup
login(response.data.user, response.data.token);               // Update Zustand

// Now face API call works
faceAPI.storeFaceDescriptor(descriptor);  // ✅ Token found → 200 OK
```

## Changes Made

### 1. Register.jsx - handleVerifyOTP()

**Before:**
```javascript
if (response.data.user.role === 'voter') {
  // Only stored in sessionStorage
  sessionStorage.setItem('pendingUser', JSON.stringify(response.data.user));
  sessionStorage.setItem('pendingToken', response.data.token);
  setShowFaceRegistration(true);
}
```

**After:**
```javascript
if (response.data.user.role === 'voter') {
  // Store in localStorage IMMEDIATELY for API authentication
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  
  // Also store in sessionStorage as backup
  sessionStorage.setItem('pendingUser', JSON.stringify(response.data.user));
  sessionStorage.setItem('pendingToken', response.data.token);
  
  // Update auth state
  login(response.data.user, response.data.token);
  
  setShowFaceRegistration(true);
}
```

### 2. Register.jsx - handleFaceRegistrationSuccess()

**Simplified** - Token already in localStorage, no need to move it:
```javascript
const handleFaceRegistrationSuccess = async () => {
  setShowFaceRegistration(false);
  
  // Clear session storage backup
  sessionStorage.removeItem('pendingUser');
  sessionStorage.removeItem('pendingToken');
  
  // Fetch elections and redirect
  // ...
};
```

### 3. Register.jsx - handleFaceRegistrationCancel()

**Simplified** - Token already in localStorage:
```javascript
const handleFaceRegistrationCancel = () => {
  setShowFaceRegistration(false);
  
  // Clear session storage
  sessionStorage.removeItem('pendingUser');
  sessionStorage.removeItem('pendingToken');
  
  // Redirect to elections
  window.location.href = '/elections';
};
```

## Flow Comparison

### Before (Broken):
```
OTP Verified
  ↓
Token → sessionStorage only
  ↓
Show face modal
  ↓
Capture face
  ↓
Call faceAPI.storeFaceDescriptor()
  ↓
API interceptor checks localStorage → No token found
  ↓
❌ 401 Unauthorized
  ↓
Database NOT updated
```

### After (Fixed):
```
OTP Verified
  ↓
Token → localStorage + sessionStorage + Zustand
  ↓
Show face modal
  ↓
Capture face
  ↓
Call faceAPI.storeFaceDescriptor()
  ↓
API interceptor checks localStorage → ✅ Token found
  ↓
Request sent with Authorization header
  ↓
✅ 200 OK
  ↓
Database updated:
  - face_verified = 1
  - face_descriptor = JSON array
  - face_registered_at = NOW()
  - Verification log created
```

## Testing

### 1. Start Application
```bash
# Terminal 1
cd backend
npm run dev

# Terminal 2
cd frontend
npm start
```

### 2. Register New Voter
- Go to http://localhost:3000/register
- Fill form (role: voter)
- Verify OTP

### 3. Watch Console Logs

**Frontend:**
```
✅ OTP Verified
👤 User Role: voter
🎭 Showing face registration modal for voter
✅ Token stored in localStorage for API authentication
🔑 Token: eyJhbGciOiJIUzI1NiIs...
💾 Storing face descriptor in database...
✅ Backend response: {success: true, message: "Face registered successfully"}
```

**Backend:**
```
📥 storeFaceDescriptor called
   User ID: user-uuid
💾 Updating users table...
   Rows affected: 1
✅ User face data updated successfully
📝 Inserting verification log...
✅ Verification log created
```

### 4. Verify Database
```bash
cd backend
node verify-face-columns.js
```

**Expected:**
```
User face registration statistics:
  total_users: 35
  face_registered: 2  ← Should increase
  no_face: 33

Verification logs statistics:
  total_logs: 2  ← Should increase
  registrations: 2
```

## Network Request

### Before (401):
```
POST http://localhost:5000/api/face/store-descriptor
Status: 401 Unauthorized
Headers: (no Authorization header)
```

### After (200):
```
POST http://localhost:5000/api/face/store-descriptor
Status: 200 OK
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Response:
  {
    "success": true,
    "message": "Face registered successfully",
    "data": {
      "userId": "user-uuid",
      "affectedRows": 1,
      "logId": 2
    }
  }
```

## Summary

✅ **Root cause**: Token stored in sessionStorage, API looking in localStorage
✅ **Solution**: Store token in localStorage immediately after OTP verification
✅ **Result**: Face API authenticated successfully, database updates correctly
✅ **Verified**: Database schema correct, update query works, authentication fixed

---

**Status**: ✅ FIXED - Face registration now updates database correctly
