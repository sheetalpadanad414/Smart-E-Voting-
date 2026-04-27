# face_verified Column - Complete Explanation

## Database Schema

### Column Definition
```sql
face_verified TINYINT(1) DEFAULT 0
```

- **Type**: `TINYINT(1)` (Boolean in MySQL)
- **Nullable**: YES
- **Default Value**: `0` (FALSE)

## Values

### Before Face Registration
```
face_verified = 0 (FALSE)
face_descriptor = NULL
face_registered_at = NULL
```

### After Face Registration
```
face_verified = 1 (TRUE)
face_descriptor = '[0.123, 0.456, ...]' (JSON array with 128 numbers)
face_registered_at = '2026-03-28 10:21:48' (Current timestamp)
```

## Update Query

When face registration succeeds, this query runs:

```sql
UPDATE users 
SET face_descriptor = '[0.123, 0.456, ...]',
    face_verified = TRUE,
    face_registered_at = NOW()
WHERE id = 'user-uuid';
```

## Verification Test Results

✅ **Database update works correctly**
- Test user updated successfully
- `face_verified` changed from 0 → 1
- `face_descriptor` stored as JSON (2473 chars)
- `face_registered_at` set to current timestamp
- Verification log created with ID 1

## Current Statistics

From database verification:
- Total users: 34
- Users with face registered: 1 (test user)
- Users without face: 33
- Verification logs: 1 (registration type)

## API Endpoint

**POST** `/api/face/store-descriptor`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "descriptor": [0.123, 0.456, ..., 0.789]  // 128 numbers
}
```

**Response:**
```json
{
  "success": true,
  "message": "Face registered successfully",
  "data": {
    "userId": "user-uuid",
    "affectedRows": 1,
    "logId": 1
  }
}
```

## Verification Logs Table

Each face registration creates a log entry:

```sql
INSERT INTO face_verification_logs 
(user_id, verification_type, verified) 
VALUES ('user-uuid', 'registration', TRUE);
```

**Log Fields:**
- `id`: Auto-increment primary key
- `user_id`: User UUID
- `verification_type`: 'registration' | 'voting' | 'login'
- `similarity_score`: NULL for registration, DECIMAL for verification
- `verified`: TRUE for successful registration
- `image_path`: NULL (not used in browser-based approach)
- `created_at`: Timestamp

## How to Verify

### 1. Check User Face Status
```sql
SELECT id, email, face_verified, face_registered_at
FROM users
WHERE email = 'user@example.com';
```

### 2. Check Verification Logs
```sql
SELECT * FROM face_verification_logs
WHERE user_id = 'user-uuid'
ORDER BY created_at DESC;
```

### 3. Count Registered Users
```sql
SELECT 
  COUNT(*) as total,
  SUM(face_verified = 1) as registered,
  SUM(face_verified = 0 OR face_verified IS NULL) as not_registered
FROM users;
```

## Troubleshooting

### If face_verified stays 0 after registration:

1. **Check authentication**: Token must be valid
   ```javascript
   console.log('Token:', localStorage.getItem('token'));
   ```

2. **Check API call**: Look for errors in browser console
   ```javascript
   console.log('API Response:', response.data);
   ```

3. **Check backend logs**: Server should log the update
   ```
   📥 storeFaceDescriptor called
   💾 Updating users table...
   ✅ User face data updated successfully
   ```

4. **Check database**: Run verification script
   ```bash
   node backend/verify-face-columns.js
   ```

5. **Check user ID**: Ensure correct user is being updated
   ```javascript
   console.log('User ID:', req.user.userId);
   ```

## Expected Flow

1. User registers → OTP verified → Face modal appears
2. User captures face → Face descriptor extracted (128D vector)
3. Frontend calls `/api/face/store-descriptor` with token
4. Backend authenticates user from token
5. Backend updates `users` table:
   - `face_descriptor` = JSON array
   - `face_verified` = 1
   - `face_registered_at` = NOW()
6. Backend inserts log into `face_verification_logs`
7. Backend returns success response
8. Frontend redirects to voting page

## Testing

Run the test script to verify database operations:

```bash
cd backend
node test-face-registration.js
```

This will:
- Find a test user
- Create fake descriptor
- Update database
- Insert verification log
- Verify all changes

Expected output:
```
✅ Face registration works correctly!
face_verified: 1 (TRUE)
face_descriptor: SET (2473 chars)
face_registered_at: 2026-03-28 10:21:48
Verification log: 1 record
```

## Summary

- **Default**: `face_verified = 0` (not registered)
- **After registration**: `face_verified = 1` (registered)
- **Database update**: ✅ Works correctly
- **API endpoint**: `/api/face/store-descriptor`
- **Authentication**: Required (Bearer token)
- **Logging**: Creates entry in `face_verification_logs`

---

**Status**: ✅ Database schema correct, update query works, ready for testing
