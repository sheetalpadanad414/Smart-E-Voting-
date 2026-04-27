# Test Registration Flow - Debug Steps

## Current Status
- Backend: Running on port 5000 ✅
- Frontend: Running on port 3000 ✅
- Face routes registered ✅
- FaceRegistration component exists ✅
- react-webcam installed ✅

## Debug Steps

### Step 1: Open Browser Console
1. Open http://localhost:3000/register
2. Open DevTools (F12)
3. Go to Console tab
4. Clear console

### Step 2: Register New User
1. Fill registration form:
   - Name: Test User
   - Email: test@example.com
   - Phone: 1234567890
   - Password: password123
   - Confirm Password: password123

2. Click "Create Account"

3. Check console for:
   - "🔐 Auto-filled development OTP: XXXXXX"

### Step 3: Verify OTP
1. OTP should be auto-filled
2. Click "Verify OTP"

3. Check console for:
   - "✅ OTP Verified: {...}"
   - "👤 User Role: voter"
   - "🎭 Showing face registration modal for voter"
   - "🔍 Register Component - showFaceRegistration: true"
   - "✅ Rendering FaceRegistration component"

### Step 4: Check if Modal Appears
- If modal appears: ✅ Working!
- If modal doesn't appear: Check console for errors

## Common Issues

### Issue 1: Modal Not Appearing
**Symptoms**: Console shows "🎭 Showing face registration modal" but no modal visible

**Possible Causes**:
1. Z-index issue (modal behind other elements)
2. CSS not loaded
3. Component rendering but hidden

**Solution**: Check Elements tab in DevTools for FaceRegistration component

### Issue 2: Camera Not Working
**Symptoms**: Modal appears but camera doesn't start

**Possible Causes**:
1. Browser permissions denied
2. HTTPS required (but localhost should work)
3. Camera in use by another app

**Solution**: 
- Check browser permissions
- Close other apps using camera
- Try different browser

### Issue 3: Models Not Loading
**Symptoms**: "Loading face recognition models..." never completes

**Possible Causes**:
1. Model files missing from public/models/
2. Network error loading models
3. face-api.js not installed

**Solution**:
- Check frontend/public/models/ folder has 7 files
- Check Network tab for 404 errors
- Run: npm list face-api.js

## Manual Test Commands

### Check if models exist:
```bash
ls frontend/public/models/
```

Should show:
- face_landmark_68_model-shard1
- face_landmark_68_model-weights_manifest.json
- face_recognition_model-shard1
- face_recognition_model-shard2
- face_recognition_model-weights_manifest.json
- tiny_face_detector_model-shard1
- tiny_face_detector_model-weights_manifest.json

### Check face-api.js installed:
```bash
cd frontend
npm list face-api.js
```

Should show: face-api.js@0.22.2

### Check backend face routes:
```bash
curl http://localhost:5000/api/face/status -H "Authorization: Bearer YOUR_TOKEN"
```

Should return: {"success":true,"data":{"registered":false}}

## Expected Console Output

### After OTP Verification:
```
✅ OTP Verified: {user: {...}, token: "..."}
👤 User Role: voter
🎭 Showing face registration modal for voter
🔍 Register Component - showFaceRegistration: true
✅ Rendering FaceRegistration component
```

### When Modal Loads:
```
Loading face recognition models...
Face recognition models loaded successfully
```

### After Capturing Face:
```
Face detected with confidence: 0.XX
Face descriptor extracted: [128 numbers]
```

### After Registering Face:
```
✅ Face registered successfully!
Registration complete! You can now vote.
```

## Next Steps

1. Follow debug steps above
2. Check console output
3. Report any errors you see
4. Take screenshot if modal doesn't appear
