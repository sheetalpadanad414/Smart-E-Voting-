# Face Recognition Testing Guide

## ✅ Implementation Complete

The face recognition feature has been fully integrated into the Smart E-Voting system with the following flow:

### Registration Flow (New Users)
1. User fills registration form
2. User verifies email with OTP
3. **Face registration modal appears automatically** (for voters only)
4. User captures face photo
5. Face descriptor is stored in database
6. User is redirected to elections page

### Login Flow (Existing Users)
1. User enters email and password
2. User verifies OTP
3. **System checks if face is registered**:
   - If face registered → Redirect to face verification page
   - If no face → Redirect directly to elections page
4. User captures face for verification
5. Face is matched against stored descriptor
6. If match successful → Redirect to elections page
7. If match fails → Option to use OTP fallback

## 🧪 Testing Instructions

### Test 1: New User Registration with Face Registration

1. **Start the application**:
   - Backend: Already running on http://localhost:5000
   - Frontend: Open http://localhost:3000

2. **Register a new voter account**:
   - Go to http://localhost:3000/register
   - Fill in the registration form:
     - Name: Test Voter
     - Email: testvoter@example.com
     - Phone: 1234567890
     - Password: password123
     - Confirm Password: password123
   - Click "Create Account"

3. **Verify OTP**:
   - Check the toast notification for the development OTP (it auto-fills)
   - Click "Verify OTP"

4. **Register Face** (Modal appears automatically):
   - Allow camera access when prompted
   - Position your face in the center of the oval guide
   - Ensure good lighting
   - Click "Capture Photo"
   - Review the captured image
   - Click "Register Face"
   - Wait for processing (face descriptor extraction)
   - Success message appears
   - Redirected to elections page

5. **Verify Registration**:
   - Face descriptor should be stored in database
   - User should be on /elections page

### Test 2: Login with Face Verification

1. **Logout** (if logged in):
   - Clear localStorage or logout from the app

2. **Login with the registered account**:
   - Go to http://localhost:3000/login
   - Email: testvoter@example.com
   - Password: password123
   - Click "Sign In"

3. **Verify OTP**:
   - Check the toast notification for the development OTP
   - Enter or wait for auto-fill
   - Click "Verify OTP"

4. **Face Verification** (Automatic redirect):
   - You should be redirected to /face-verification
   - Allow camera access
   - Position your face in the center
   - Click "Capture & Verify"
   - System processes and compares face
   - If match successful (similarity > 40%):
     - Success message appears
     - Redirected to /elections after 2 seconds
   - If match fails:
     - Error message with similarity score
     - Option to "Use OTP Instead" appears

5. **Verify Login**:
   - User should be on /elections page
   - Can proceed to vote

### Test 3: Face Verification Failure & OTP Fallback

1. **Login with registered account**
2. **Verify OTP**
3. **On Face Verification page**:
   - Capture a photo with poor lighting or different angle
   - Or have someone else try to verify
   - Click "Verify Face"
   - Should see "Verification Failed" message
   - Click "Use OTP Instead"
   - Should be redirected to /verify-otp or /elections

### Test 4: Login Without Face Registration

1. **Register a new voter** but skip face registration:
   - Register normally
   - When face registration modal appears, click "Cancel"
   - Should be redirected to /elections

2. **Logout and login again**:
   - Login with this account
   - Verify OTP
   - Should be redirected directly to /elections (no face verification)
   - Toast message: "Face not registered. You can register it from your profile."

### Test 5: Admin Login (No Face Recognition)

1. **Login as admin**:
   - Email: admin@evoting.com
   - Password: admin123
   - No OTP required
   - No face verification
   - Direct redirect to /admin/dashboard

## 📊 Database Verification

Check the database to verify face data is stored correctly:

```sql
-- Check user's face registration status
SELECT id, email, face_verified, face_registered_at 
FROM users 
WHERE email = 'testvoter@example.com';

-- Check face verification logs
SELECT * FROM face_verification_logs 
WHERE user_id = (SELECT id FROM users WHERE email = 'testvoter@example.com')
ORDER BY verified_at DESC;
```

## 🔍 Browser Console Checks

Open browser DevTools (F12) and check:

1. **Face-api.js models loading**:
   - Should see: "Loading face recognition models..."
   - Should see: "Face recognition models loaded successfully"

2. **Face detection**:
   - Should see: "Face detected with confidence: X.XX"
   - Should see: "Face descriptor extracted: [128 numbers]"

3. **Face verification**:
   - Should see: "Comparing faces..."
   - Should see: "Similarity: X.XX, Match: true/false"

## 🎯 Expected Results

### Registration Flow
- ✅ Face registration modal appears after OTP verification
- ✅ Camera access works
- ✅ Face detection works (confidence > 0.5)
- ✅ Face descriptor stored in database
- ✅ Redirect to elections page

### Login Flow
- ✅ OTP verification works
- ✅ Redirect to face verification page (if face registered)
- ✅ Face verification works (similarity threshold: 40%)
- ✅ Redirect to elections page on success
- ✅ OTP fallback available on failure

### Security
- ✅ Face descriptors stored as JSON in database
- ✅ All face processing happens in browser (client-side)
- ✅ No face images stored on server
- ✅ Face verification logs recorded

## 🐛 Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS or localhost
- Try different browser

### Models Not Loading
- Check network tab for model files
- Verify files exist in `frontend/public/models/`
- Check console for errors

### Face Detection Fails
- Ensure good lighting
- Face should be clearly visible
- Remove glasses if possible
- Try different angle

### Face Verification Always Fails
- Check similarity threshold (currently 0.6 = 60%)
- Verify stored descriptor exists in database
- Check console for comparison logs

### Backend Errors
- Check backend console for errors
- Verify database connection
- Check face routes are registered

## 📝 Notes

- Face recognition uses face-api.js (100% free, client-side)
- Face descriptors are 128-dimensional vectors
- Similarity threshold: distance < 0.6 (60% match)
- All processing happens in browser (no server-side AI)
- Face images are NOT stored, only descriptors
- Fallback to OTP if face verification fails

## 🎉 Success Criteria

The implementation is successful if:
1. ✅ New users can register their face after OTP verification
2. ✅ Registered users are prompted for face verification on login
3. ✅ Face verification works with good accuracy
4. ✅ OTP fallback is available
5. ✅ Non-registered users can still login without face verification
6. ✅ Admin login bypasses face recognition
7. ✅ All face data is stored securely in database
8. ✅ Face verification logs are recorded

## 🚀 Next Steps

After successful testing:
1. Adjust similarity threshold if needed (in `useFaceRecognition.js`)
2. Add face re-registration option in user profile
3. Add face verification statistics in admin dashboard
4. Consider adding liveness detection for enhanced security
5. Add face verification for voting (optional extra security layer)
