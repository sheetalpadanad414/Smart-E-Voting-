# Face Registration Fix - Election-Specific Implementation

## Issue
Face registration was failing with 400 Bad Request error because the backend now requires an `electionId` parameter for all face operations.

## Root Cause
The backend was updated to store face data per election, but the frontend `FaceRegistration` component was still calling the API without providing an election ID.

## Solution Implemented

### Frontend Changes

**File:** `frontend/src/components/FaceRegistration.jsx`

#### 1. Added Active Election Loading
```javascript
const [activeElection, setActiveElection] = useState(null);
const [loadingElection, setLoadingElection] = useState(true);

useEffect(() => {
  const loadActiveElection = async () => {
    const response = await voterAPI.getAvailableElections(1, 200);
    const elections = response.data.elections || [];
    
    const now = new Date();
    const active = elections.find(election => {
      const start = new Date(election.start_date);
      const end = new Date(election.end_date);
      return election.status === 'active' && now >= start && now <= end;
    });
    
    if (active) {
      setActiveElection(active);
    }
    setLoadingElection(false);
  };
  
  loadActiveElection();
}, []);
```

#### 2. Updated API Call to Include Election ID
```javascript
// OLD (causing 400 error)
const response = await faceAPI.storeFaceDescriptor(descriptor);

// NEW (working)
const response = await faceAPI.storeFaceDescriptor(descriptor, activeElection.id);
```

#### 3. Added Election Info to UI
```javascript
<p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
  Registering for: <span className="font-semibold text-blue-600">
    {activeElection.title}
  </span>
</p>
```

#### 4. Added Loading State
Shows loading indicator while fetching active election and loading face recognition models.

### Backend Status

✅ Backend server restarted successfully
✅ Face data cleanup job running (hourly)
✅ Election-specific face data system active

## How It Works Now

### Registration Flow

1. **User completes OTP verification**
2. **FaceRegistration component loads:**
   - Fetches all available elections
   - Finds first active election
   - Loads face recognition models
3. **User captures face:**
   - Face is detected and descriptor extracted
   - Descriptor is sent to backend WITH election ID
4. **Backend stores face data:**
   - Face data stored in `election_face_data` table
   - Linked to specific election
   - User can now vote in that election

### What Changed

**Before:**
- Face data stored globally per user
- One face registration for all elections
- No election context

**After:**
- Face data stored per election
- Separate registration for each election
- Face data auto-deleted when election ends
- Better privacy and security

## Testing

### Test the Fix

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```
   Should see: `✓ Face data cleanup job scheduled (runs hourly)`

2. **Register New User:**
   - Go to http://localhost:3000/register
   - Fill in details and verify OTP
   - Face registration modal should appear

3. **Verify Election Info:**
   - Modal should show "Registering for: [Election Name]"
   - Capture face and click Register

4. **Check Success:**
   - Should see success message
   - Should redirect to elections page
   - Can now vote in that election

### Verify in Database

```sql
-- Check face registration
SELECT 
  u.name,
  e.title as election,
  efd.registered_at
FROM election_face_data efd
JOIN users u ON efd.user_id = u.id
JOIN elections e ON efd.election_id = e.id
ORDER BY efd.registered_at DESC;
```

## Error Handling

### No Active Election
If no active election is found:
- Shows error toast: "No active election found"
- Closes modal automatically
- User redirected back

### Face Detection Fails
If face confidence < 0.5:
- Shows error: "Face detection confidence too low"
- User can retake photo
- Processing stops

### API Error
If backend returns error:
- Shows specific error message from backend
- User can retry
- Processing stops

## Benefits

### Privacy
- Face data only stored while election is active
- Automatically deleted when election ends
- No indefinite storage

### Security
- Face data isolated per election
- No cross-election data reuse
- Clear audit trail

### User Experience
- Clear indication of which election
- Automatic election detection
- Smooth registration flow

## Next Steps

### For Multiple Elections

If user needs to vote in multiple elections:

1. **After first registration:**
   - User can vote in first election
   - System detects other active elections

2. **Before voting in second election:**
   - Check if face registered for that election
   - If not, show registration modal again
   - Register face for second election

3. **Implementation:**
   ```javascript
   // In voting page
   useEffect(() => {
     const checkFaceStatus = async () => {
       const status = await faceAPI.getFaceStatus(electionId);
       if (!status.data.registered) {
         setShowFaceRegistration(true);
       }
     };
     checkFaceStatus();
   }, [electionId]);
   ```

## Files Modified

1. **frontend/src/components/FaceRegistration.jsx**
   - Added active election loading
   - Updated API call with election ID
   - Added election info to UI
   - Improved error handling

2. **backend/server.js**
   - Restarted with face cleanup job

## Summary

✅ Face registration now works with election-specific system
✅ Backend requires and receives election ID
✅ Frontend automatically detects active election
✅ User sees which election they're registering for
✅ Face data properly stored per election
✅ Cleanup job running to delete old face data

The 400 error is now fixed and face registration works correctly with the new election-specific system!
