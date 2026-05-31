# Election-Specific Face Recognition System

## Overview

The face recognition system has been updated to store face data per election type. Face data is automatically deleted when elections become inactive or completed.

## Key Features

### 1. **One Face Registration Per Election**
- Users must register their face for each active election
- Face data is tied to specific election ID and type
- Prevents reuse of face data across different elections

### 2. **Automatic Cleanup**
- Face data is automatically deleted when elections end
- Cleanup job runs every hour
- Manual cleanup available for admins

### 3. **Election Type Tracking**
- Face data tracks election type (e.g., "Vidhan Sabha", "Lok Sabha")
- Face data tracks election subtype if applicable
- Verification logs include election context

## Database Schema

### New Tables

#### `election_face_data`
Stores face descriptors per election:
```sql
- id: Unique identifier
- user_id: Reference to user
- election_id: Reference to election
- election_type: Type of election (e.g., "Vidhan Sabha")
- election_subtype: Subtype if applicable
- face_descriptor: JSON array of face features
- face_image_path: Optional image path
- registered_at: Registration timestamp
- last_verified_at: Last verification timestamp
- verification_count: Number of verifications
```

#### `face_data_cleanup_logs`
Tracks cleanup operations:
```sql
- id: Unique identifier
- election_id: Election that was cleaned
- election_type: Type of election
- election_title: Election name
- records_deleted: Number of records removed
- cleanup_reason: Why cleanup occurred
- cleaned_at: Cleanup timestamp
```

### Updated Tables

#### `face_verification_logs`
Now includes election context:
```sql
- election_id: Which election was verified
- election_type: Type of election
```

## API Endpoints

### Voter Endpoints

#### Register Face for Election
```
POST /api/face/store-descriptor
Body: { descriptor: Array, electionId: String }
```

#### Get Face Status for Election
```
GET /api/face/status?electionId=<id>
```

#### Get Elections Needing Registration
```
GET /api/face/elections-needing-registration
Returns: List of active elections and registration status
```

### Admin Endpoints

#### Cleanup Inactive Election Face Data
```
POST /api/face/cleanup-inactive
Returns: { electionsProcessed, recordsDeleted }
```

#### Delete Face Data for Specific Election
```
DELETE /api/face/delete
Body: { electionId: String }
```

#### Get Face Registration Statistics
```
GET /api/face/stats
Returns: Statistics about face registrations
```

## Backend Services

### ElectionFaceService

Main service for managing election-specific face data:

```javascript
// Register face for election
await ElectionFaceService.registerFaceForElection(userId, electionId, descriptor);

// Check if registered
const hasRegistered = await ElectionFaceService.hasFaceForElection(userId, electionId);

// Get face data
const faceData = await ElectionFaceService.getFaceForElection(userId, electionId);

// Record verification
await ElectionFaceService.recordVerification(userId, electionId, verified, similarity);

// Cleanup inactive elections
await ElectionFaceService.cleanupInactiveElectionFaceData();
```

## Automatic Cleanup Job

### Schedule
- Runs every hour at minute 0
- Uses node-schedule library
- Started automatically with server

### Cleanup Logic
1. Finds elections with status 'completed' or 'draft'
2. Finds elections where end_date < NOW()
3. Deletes all face data for those elections
4. Logs cleanup operations

### Manual Trigger
```javascript
const FaceDataCleanupJob = require('./jobs/faceDataCleanup');
await FaceDataCleanupJob.runNow();
```

## Frontend Integration

### Updated API Calls

```javascript
import { faceAPI } from './services/api';

// Register face for specific election
await faceAPI.storeFaceDescriptor(descriptor, electionId);

// Check status for specific election
const status = await faceAPI.getFaceStatus(electionId);

// Get elections needing registration
const elections = await faceAPI.getElectionsNeedingRegistration();
```

### Face Registration Flow

1. User logs in and verifies OTP
2. System checks for active elections
3. For each active election without face registration:
   - Show face registration modal
   - Capture face and extract descriptor
   - Store descriptor with election ID
4. User can now vote in that election

## Migration

### Run Migration

```bash
cd backend
node run-face-migration.js
```

### What It Does

1. Creates `election_face_data` table
2. Creates `face_data_cleanup_logs` table
3. Adds election tracking to `face_verification_logs`
4. Preserves existing data

## Example Scenarios

### Scenario 1: Vidhan Sabha Election

1. **Election Starts**
   - Vidhan Sabha election becomes active
   - Users see face registration prompt

2. **User Registers**
   - User captures face
   - Face data stored with election_id and election_type="Vidhan Sabha"

3. **User Votes**
   - Face verified against stored data for this election
   - Vote is cast

4. **Election Ends**
   - Election status changes to 'completed'
   - Cleanup job runs (within 1 hour)
   - All face data for this election is deleted

### Scenario 2: Multiple Elections

1. **Two Active Elections**
   - Lok Sabha election (national)
   - Vidhan Sabha election (state)

2. **User Must Register Twice**
   - Register face for Lok Sabha
   - Register face for Vidhan Sabha separately

3. **Independent Data**
   - Each election has its own face data
   - Ending one election doesn't affect the other

## Security & Privacy

### Data Isolation
- Face data is isolated per election
- No cross-election data sharing
- Automatic deletion ensures privacy

### Audit Trail
- All registrations logged
- All verifications logged
- All cleanups logged

### Compliance
- Face data deleted when no longer needed
- Users control when to register
- Clear purpose limitation (specific election)

## Monitoring

### Check Statistics

```javascript
const stats = await ElectionFaceService.getFaceRegistrationStats();
// Returns:
// - activeElections: Number of active elections
// - totalRegistrations: Total face registrations
// - byElectionType: Breakdown by election type
// - recentCleanups: Recent cleanup operations
```

### View Cleanup Logs

```sql
SELECT * FROM face_data_cleanup_logs 
ORDER BY cleaned_at DESC 
LIMIT 10;
```

## Troubleshooting

### Face Data Not Deleting

1. Check election status:
```sql
SELECT id, title, status, end_date FROM elections WHERE id = '<election_id>';
```

2. Manually trigger cleanup:
```bash
curl -X POST http://localhost:5000/api/face/cleanup-inactive \
  -H "Authorization: Bearer <admin_token>"
```

### User Can't Register Face

1. Check if already registered:
```sql
SELECT * FROM election_face_data 
WHERE user_id = '<user_id>' AND election_id = '<election_id>';
```

2. Check election status:
```sql
SELECT status FROM elections WHERE id = '<election_id>';
```
(Must be 'active')

### Cleanup Job Not Running

1. Check server logs for "Face data cleanup job scheduled"
2. Verify node-schedule is installed
3. Check for errors in cleanup job execution

## Best Practices

1. **Always pass election ID** when working with face data
2. **Check election status** before allowing registration
3. **Monitor cleanup logs** regularly
4. **Test cleanup** in staging before production
5. **Inform users** about face data deletion policy

## Future Enhancements

- [ ] Configurable cleanup schedule per election type
- [ ] Face data export before deletion (for audit)
- [ ] Notification to users before face data deletion
- [ ] Bulk face registration for multiple elections
- [ ] Face data retention policies per election category
