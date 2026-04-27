# Test Face Registration Database Update

## Quick Test Checklist

### Before Testing
```bash
cd backend
node verify-face-columns.js
```
Note the current count of users with `face_registered`.

### Test Steps

1. **Start servers**
   ```bash
   # Terminal 1
   cd backend
   npm run dev
   
   # Terminal 2
   cd frontend
   npm start
   ```

2. **Register new voter**
   - Go to: http://localhost:3000/register
   - Email: test@example.com
   - Fill all fields
   - Submit

3. **Verify OTP**
   - OTP auto-filled
   - Click "Verify OTP"

4. **Face registration modal appears**
   - ✅ Modal shows
   - ✅ Camera activates
   - Capture face
   - Click "Register Face"

5. **Watch browser console**
   ```
   ✅ Token stored in localStorage for API authentication
   💾 Storing face descriptor in database...
   ✅ Backend response: {success: true}
   ```

6. **Watch backend console**
   ```
   📥 storeFaceDescriptor called
   💾 Updating users table...
   ✅ User face data updated successfully
   ```

7. **Check Network tab**
   - Request: POST /api/face/store-descriptor
   - Status: **200 OK** (not 401)
   - Response: `{"success": true}`

### After Testing

**Verify database:**
```bash
cd backend
node verify-face-columns.js
```

**Expected changes:**
- `face_registered` count increased by 1
- `total_logs` increased by 1

**Check specific user:**
```sql
SELECT id, email, face_verified, face_registered_at
FROM users
WHERE email = 'test@example.com';
```

**Expected:**
- `face_verified`: 1 (was 0)
- `face_registered_at`: Current timestamp (was NULL)

## Success Criteria

✅ No 401 error in network tab
✅ Backend logs show "User face data updated successfully"
✅ Database shows face_verified = 1
✅ Verification log created
✅ User redirected to voting page or elections page

## If Still Failing

1. Check localStorage has token:
   ```javascript
   console.log(localStorage.getItem('token'));
   ```

2. Check API request headers:
   - Open Network tab
   - Click on store-descriptor request
   - Check Headers → Authorization: Bearer ...

3. Check backend logs for errors

4. Run database verification script
