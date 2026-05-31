# Face Registration Workflow - How It Works

## System Behavior

### ✅ What the System Does

1. **First Registration (Active Election)**
   - User registers face for Election A (e.g., Vidhan Sabha)
   - Face data stored in database with election_id
   - User can now vote in Election A
   - ✅ **SUCCESS**

2. **Attempt Duplicate Registration (Same Election)**
   - User tries to register face again for Election A
   - System checks: Already registered for this election?
   - ❌ **REJECTED** with message: "Face already registered for this election"
   - User cannot register twice for same election

3. **Election Becomes Inactive**
   - Election A ends (status changes to 'completed')
   - Cleanup job runs (every hour)
   - Face data for Election A is **automatically deleted**
   - Database cleaned up

4. **New Election Becomes Active**
   - Election B (e.g., Lok Sabha) becomes active
   - User tries to register face for Election B
   - System checks: No face registered for Election B
   - ✅ **ALLOWED** - User can register face for new election

## Example Timeline

```
Day 1, 9:00 AM
├─ Vidhan Sabha election starts (status: active)
│
Day 1, 10:00 AM
├─ User registers face for Vidhan Sabha
│  └─ ✅ SUCCESS: Face stored with election_id
│
Day 1, 11:00 AM
├─ User tries to register face again for Vidhan Sabha
│  └─ ❌ REJECTED: "Face already registered for this election"
│
Day 1, 12:00 PM
├─ User votes in Vidhan Sabha
│  └─ ✅ SUCCESS: Face verified, vote cast
│
Day 7, 6:00 PM
├─ Vidhan Sabha election ends (status: completed)
│
Day 7, 7:00 PM
├─ Cleanup job runs
│  └─ ✅ Face data for Vidhan Sabha deleted
│
Day 8, 9:00 AM
├─ Lok Sabha election starts (status: active)
│
Day 8, 10:00 AM
├─ User registers face for Lok Sabha
│  └─ ✅ SUCCESS: New face registration allowed
│
Day 8, 11:00 AM
├─ User tries to register face again for Lok Sabha
│  └─ ❌ REJECTED: "Face already registered for this election"
```

## Database Flow

### Registration Check

```sql
-- When user tries to register face
-- System checks:
SELECT id FROM election_face_data 
WHERE user_id = '<user_id>' 
AND election_id = '<election_id>';

-- If found → REJECT (already registered)
-- If not found → ALLOW (proceed with registration)
```

### After Registration

```sql
-- Face data stored
INSERT INTO election_face_data 
(id, user_id, election_id, election_type, face_descriptor)
VALUES (...);

-- Result:
user_id: abc-123
election_id: vidhan-sabha-2026
election_type: Vidhan Sabha
face_descriptor: [0.123, 0.456, ...]
registered_at: 2026-05-03 10:00:00
```

### After Election Ends

```sql
-- Cleanup job finds inactive elections
SELECT id FROM elections 
WHERE status = 'completed' 
OR end_date < NOW();

-- Deletes face data
DELETE FROM election_face_data 
WHERE election_id IN (...);

-- Logs cleanup
INSERT INTO face_data_cleanup_logs 
(election_id, records_deleted, cleanup_reason)
VALUES ('vidhan-sabha-2026', 150, 'Election completed');
```

## Code Implementation

### Backend Check (Already Implemented)

```javascript
// In faceController.js
static async storeFaceDescriptor(req, res) {
  const { userId, electionId, descriptor } = req.body;
  
  // ✅ Check if already registered
  const alreadyRegistered = await ElectionFaceService.hasFaceForElection(
    userId, 
    electionId
  );
  
  if (alreadyRegistered) {
    // ❌ REJECT duplicate registration
    return res.status(400).json({
      success: false,
      message: 'Face already registered for this election'
    });
  }
  
  // ✅ ALLOW new registration
  await ElectionFaceService.registerFaceForElection(
    userId, 
    electionId, 
    descriptor
  );
}
```

### Frontend Handling

```javascript
// In FaceRegistration.jsx
const registerFace = async () => {
  try {
    const response = await faceAPI.storeFaceDescriptor(
      descriptor, 
      activeElection.id
    );
    
    if (response.data.success) {
      toast.success('Face registered successfully!');
      onSuccess();
    }
  } catch (error) {
    // Handle duplicate registration error
    if (error.response?.status === 400) {
      const message = error.response.data.message;
      
      if (message.includes('already registered')) {
        toast.error('You have already registered your face for this election');
      } else {
        toast.error(message);
      }
    }
  }
};
```

## Testing the Workflow

### Test 1: First Registration

```bash
# 1. Create active election
# 2. Register new user
# 3. Try to register face
# Expected: ✅ SUCCESS

curl -X POST http://localhost:5000/api/face/store-descriptor \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "descriptor": [0.1, 0.2, ...],
    "electionId": "election-123"
  }'

# Response:
{
  "success": true,
  "message": "Face registered successfully for this election"
}
```

### Test 2: Duplicate Registration

```bash
# Try to register again with same user and election
# Expected: ❌ REJECTED

curl -X POST http://localhost:5000/api/face/store-descriptor \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "descriptor": [0.1, 0.2, ...],
    "electionId": "election-123"
  }'

# Response:
{
  "success": false,
  "message": "Face already registered for this election"
}
```

### Test 3: Check Registration Status

```bash
# Check if user has registered face for election
curl http://localhost:5000/api/face/status?electionId=election-123 \
  -H "Authorization: Bearer <token>"

# Response (if registered):
{
  "success": true,
  "data": {
    "registered": true
  }
}

# Response (if not registered):
{
  "success": true,
  "data": {
    "registered": false
  }
}
```

### Test 4: Cleanup After Election Ends

```bash
# 1. End the election (set status to 'completed')
UPDATE elections SET status = 'completed' WHERE id = 'election-123';

# 2. Trigger cleanup manually (or wait for hourly job)
curl -X POST http://localhost:5000/api/face/cleanup-inactive \
  -H "Authorization: Bearer <admin_token>"

# Response:
{
  "success": true,
  "message": "Cleaned up face data for 1 elections",
  "data": {
    "electionsProcessed": 1,
    "recordsDeleted": 150
  }
}

# 3. Verify face data deleted
SELECT * FROM election_face_data WHERE election_id = 'election-123';
-- Result: 0 rows (all deleted)
```

### Test 5: Register for New Election

```bash
# 1. Create new active election
# 2. Try to register face with same user
# Expected: ✅ SUCCESS (previous election data was deleted)

curl -X POST http://localhost:5000/api/face/store-descriptor \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "descriptor": [0.1, 0.2, ...],
    "electionId": "election-456"
  }'

# Response:
{
  "success": true,
  "message": "Face registered successfully for this election"
}
```

## User Experience

### Scenario 1: Normal Flow

1. User logs in
2. Sees active election: "Vidhan Sabha 2026"
3. Clicks "Vote Now"
4. System checks: No face registered for this election
5. Shows face registration modal
6. User captures face
7. ✅ Face registered successfully
8. User can now vote

### Scenario 2: Already Registered

1. User logs in
2. Sees active election: "Vidhan Sabha 2026"
3. Clicks "Vote Now"
4. System checks: Face already registered for this election
5. ✅ Proceeds directly to voting (no registration modal)
6. User can vote

### Scenario 3: Tries to Register Again

1. User somehow triggers face registration again
2. System checks: Face already registered
3. ❌ Shows error: "You have already registered your face for this election"
4. Modal closes
5. User redirected to voting page

### Scenario 4: New Election

1. Previous election ended (face data deleted)
2. New election starts: "Lok Sabha 2026"
3. User clicks "Vote Now"
4. System checks: No face registered for this election
5. Shows face registration modal
6. User captures face
7. ✅ Face registered successfully for new election
8. User can vote in new election

## Benefits

### 1. Prevents Duplicate Registrations
- ✅ One face per election
- ✅ Cannot register multiple times
- ✅ Database integrity maintained

### 2. Automatic Cleanup
- ✅ Face data deleted when not needed
- ✅ Privacy maintained
- ✅ Storage optimized

### 3. Fresh Start for New Elections
- ✅ Each election is independent
- ✅ No old data interference
- ✅ Clean slate for each election

### 4. Security
- ✅ Face data isolated per election
- ✅ No cross-election data reuse
- ✅ Audit trail maintained

## Summary

**The system works exactly as you requested:**

1. ✅ User registers face ONCE for active election
2. ❌ Duplicate registration for same election is REJECTED
3. ✅ User can vote in that election
4. ✅ When election ends, face data is AUTO-DELETED
5. ✅ When new election starts, user can register face again

**This is already implemented and working!** The backend has all the checks in place to prevent duplicate registrations and automatically clean up face data when elections end.
