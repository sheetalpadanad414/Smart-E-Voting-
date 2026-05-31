# Face Recognition System Update - Summary

## What Changed

The face recognition system has been completely redesigned to store face data **per election** instead of globally per user. Face data is now automatically deleted when elections become inactive.

## Key Changes

### ✅ One Face Registration Per Election
- Users must register their face for each active election separately
- Example: If Vidhan Sabha and Lok Sabha elections are both active, user registers face twice
- Face data is tied to specific election ID and type

### ✅ Automatic Cleanup
- Face data automatically deleted when election ends
- Cleanup job runs every hour
- Manual cleanup available for admins

### ✅ Privacy & Compliance
- Face data only stored while election is active
- Automatic deletion ensures data minimization
- Clear audit trail of all operations

## Files Created

### Backend
1. **`backend/migrations/add-election-specific-face-data.js`**
   - Database migration for new tables
   - Creates `election_face_data` table
   - Creates `face_data_cleanup_logs` table
   - Updates `face_verification_logs` table

2. **`backend/services/electionFaceService.js`**
   - Core service for election-specific face data
   - Handles registration, verification, cleanup
   - Provides statistics and monitoring

3. **`backend/jobs/faceDataCleanup.js`**
   - Scheduled job for automatic cleanup
   - Runs every hour
   - Can be triggered manually

4. **`backend/run-face-migration.js`**
   - Script to run the migration
   - Easy setup command

### Documentation
5. **`ELECTION_SPECIFIC_FACE_RECOGNITION.md`**
   - Complete documentation
   - API reference
   - Examples and troubleshooting

6. **`FACE_RECOGNITION_UPDATE_SUMMARY.md`** (this file)
   - Quick overview of changes

## Files Modified

### Backend
1. **`backend/controllers/faceController.js`**
   - Updated all methods to require election ID
   - Added new endpoints for election-specific operations
   - Added admin endpoints for cleanup and stats

2. **`backend/routes/faceRoutes.js`**
   - Added new routes for election-specific operations
   - Added admin routes

3. **`backend/server.js`**
   - Added FaceDataCleanupJob import
   - Started cleanup job on server start

### Frontend
4. **`frontend/src/services/api.js`**
   - Updated all faceAPI methods to include election ID
   - Added new methods for election-specific operations

## Database Changes

### New Tables

#### `election_face_data`
```sql
CREATE TABLE election_face_data (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  election_id VARCHAR(36) NOT NULL,
  election_type VARCHAR(50) NOT NULL,
  election_subtype VARCHAR(50),
  face_descriptor JSON NOT NULL,
  face_image_path VARCHAR(255),
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_verified_at TIMESTAMP NULL,
  verification_count INT DEFAULT 0,
  UNIQUE KEY unique_user_election (user_id, election_id)
);
```

#### `face_data_cleanup_logs`
```sql
CREATE TABLE face_data_cleanup_logs (
  id VARCHAR(36) PRIMARY KEY,
  election_id VARCHAR(36) NOT NULL,
  election_type VARCHAR(50) NOT NULL,
  election_title VARCHAR(255),
  records_deleted INT DEFAULT 0,
  cleanup_reason VARCHAR(100),
  cleaned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Updated Tables

#### `face_verification_logs`
- Added `election_id` column
- Added `election_type` column

## API Changes

### Updated Endpoints (Now Require Election ID)

```javascript
// Before
POST /api/face/store-descriptor
Body: { descriptor: Array }

// After
POST /api/face/store-descriptor
Body: { descriptor: Array, electionId: String }
```

```javascript
// Before
GET /api/face/status

// After
GET /api/face/status?electionId=<id>
```

### New Endpoints

```javascript
// Get elections needing face registration
GET /api/face/elections-needing-registration

// Cleanup inactive election face data (admin)
POST /api/face/cleanup-inactive

// Get face registration statistics (admin)
GET /api/face/stats
```

## How It Works

### Registration Flow

1. **User logs in** → OTP verified
2. **System checks** → Are there active elections?
3. **For each active election:**
   - Check if user has registered face for this election
   - If not, show face registration modal
   - User captures face
   - Face descriptor stored with election ID
4. **User can vote** in elections where face is registered

### Cleanup Flow

1. **Every hour** → Cleanup job runs
2. **Find inactive elections:**
   - Status = 'completed' OR 'draft'
   - OR end_date < NOW()
3. **Delete face data** for those elections
4. **Log cleanup** operation

### Example Timeline

```
Day 1, 9:00 AM  → Vidhan Sabha election starts (status: active)
Day 1, 9:30 AM  → User registers face for Vidhan Sabha
Day 1, 10:00 AM → User votes in Vidhan Sabha
Day 7, 6:00 PM  → Vidhan Sabha election ends (status: completed)
Day 7, 7:00 PM  → Cleanup job runs
Day 7, 7:01 PM  → User's face data for Vidhan Sabha deleted
```

## Installation Steps

### 1. Run Migration

```bash
cd backend
node run-face-migration.js
```

### 2. Restart Server

```bash
npm start
```

The cleanup job will start automatically.

### 3. Verify

Check server logs for:
```
✓ Face data cleanup job scheduled (runs hourly)
```

## Testing

### Test Face Registration

1. Create an active election
2. Login as voter
3. Register face for that election
4. Check database:
```sql
SELECT * FROM election_face_data WHERE user_id = '<user_id>';
```

### Test Cleanup

1. End an election (set status to 'completed')
2. Wait for cleanup job OR trigger manually:
```bash
curl -X POST http://localhost:5000/api/face/cleanup-inactive \
  -H "Authorization: Bearer <admin_token>"
```
3. Check cleanup logs:
```sql
SELECT * FROM face_data_cleanup_logs ORDER BY cleaned_at DESC LIMIT 5;
```

## Breaking Changes

### Frontend Components Need Update

Any component using face recognition must now pass `electionId`:

```javascript
// Before
await faceAPI.storeFaceDescriptor(descriptor);

// After
await faceAPI.storeFaceDescriptor(descriptor, electionId);
```

### Components to Update

1. **`frontend/src/components/FaceRegistration.jsx`**
   - Must receive `electionId` prop
   - Pass to API calls

2. **Any voting page using face verification**
   - Must pass current election ID
   - Check face status per election

## Migration Notes

### Existing Face Data

The migration **does not** migrate existing face data from the old `users` table to the new `election_face_data` table. This is intentional because:

1. Old face data has no election context
2. Users should re-register for active elections
3. Ensures clean start with new system

### Backward Compatibility

The old face data columns in the `users` table are **not removed** by this migration. They can be removed manually after confirming the new system works:

```sql
-- Optional: Remove old columns after migration
ALTER TABLE users 
DROP COLUMN face_descriptor,
DROP COLUMN face_verified,
DROP COLUMN face_registered_at,
DROP COLUMN face_image_path;
```

## Monitoring

### Check Active Registrations

```sql
SELECT 
  e.title,
  e.election_type,
  COUNT(efd.id) as registrations
FROM elections e
LEFT JOIN election_face_data efd ON e.id = efd.election_id
WHERE e.status = 'active'
GROUP BY e.id;
```

### Check Recent Cleanups

```sql
SELECT * FROM face_data_cleanup_logs 
ORDER BY cleaned_at DESC 
LIMIT 10;
```

### Get Statistics via API

```javascript
const stats = await faceAPI.getFaceStats();
console.log(stats);
// {
//   activeElections: 2,
//   totalRegistrations: 150,
//   byElectionType: [
//     { election_type: 'Vidhan Sabha', count: 80 },
//     { election_type: 'Lok Sabha', count: 70 }
//   ],
//   recentCleanups: [...]
// }
```

## Benefits

### 1. Privacy
- Face data only stored when needed
- Automatic deletion
- No indefinite storage

### 2. Security
- Data isolation per election
- No cross-election data reuse
- Clear audit trail

### 3. Compliance
- Data minimization principle
- Purpose limitation
- Automatic retention management

### 4. Flexibility
- Different elections can have different face data
- Easy to extend for election-specific policies
- Scalable to many concurrent elections

## Support

For issues or questions:
1. Check `ELECTION_SPECIFIC_FACE_RECOGNITION.md` for detailed docs
2. Review cleanup logs in database
3. Check server logs for job execution
4. Test manually with API endpoints

## Next Steps

1. ✅ Run migration
2. ✅ Restart server
3. ⏳ Update frontend components to pass election ID
4. ⏳ Test with active elections
5. ⏳ Monitor cleanup logs
6. ⏳ Update user documentation

---

**Status:** Backend implementation complete. Frontend components need updates to pass election ID.
