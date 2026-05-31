# Frontend Update Guide - Election-Specific Face Recognition

## Overview

This guide explains how to update frontend components to work with the new election-specific face recognition system.

## Key Changes Required

### 1. Pass Election ID to All Face API Calls

All face recognition API calls now require an `electionId` parameter.

### 2. Check Face Status Per Election

Face registration status must be checked for each specific election, not globally.

### 3. Handle Multiple Elections

Users may need to register face for multiple active elections.

## Component Updates

### 1. FaceRegistration Component

**File:** `frontend/src/components/FaceRegistration.jsx`

**Changes Needed:**

```jsx
// Add electionId prop
const FaceRegistration = ({ electionId, onSuccess, onCancel }) => {
  
  // Update storeFaceDescriptor call
  const registerFace = async () => {
    // ... existing code ...
    
    // OLD:
    // const response = await faceAPI.storeFaceDescriptor(descriptor);
    
    // NEW:
    const response = await faceAPI.storeFaceDescriptor(descriptor, electionId);
    
    // ... rest of code ...
  };
  
  return (
    // ... component JSX ...
  );
};
```

**Usage:**

```jsx
// When showing face registration modal
<FaceRegistration 
  electionId={currentElectionId}
  onSuccess={handleRegistrationSuccess}
  onCancel={handleCancel}
/>
```

### 2. Voting Pages

**Files:** 
- `frontend/src/pages/VoterElectionsEnhanced.jsx`
- `frontend/src/pages/UserCategoryElections.jsx`
- Any page with voting functionality

**Changes Needed:**

```jsx
const VotingPage = () => {
  const [electionId, setElectionId] = useState(null);
  const [needsFaceRegistration, setNeedsFaceRegistration] = useState(false);
  
  // Check face status for specific election
  useEffect(() => {
    const checkFaceStatus = async () => {
      if (electionId) {
        try {
          // NEW: Pass election ID
          const response = await faceAPI.getFaceStatus(electionId);
          setNeedsFaceRegistration(!response.data.registered);
        } catch (error) {
          console.error('Error checking face status:', error);
        }
      }
    };
    
    checkFaceStatus();
  }, [electionId]);
  
  // Show face registration modal if needed
  if (needsFaceRegistration) {
    return (
      <FaceRegistration 
        electionId={electionId}
        onSuccess={() => setNeedsFaceRegistration(false)}
        onCancel={() => navigate('/elections')}
      />
    );
  }
  
  return (
    // ... voting UI ...
  );
};
```

### 3. Elections List Page

**File:** `frontend/src/pages/VoterElectionsEnhanced.jsx`

**Add Face Registration Status:**

```jsx
const ElectionsList = () => {
  const [elections, setElections] = useState([]);
  const [faceStatus, setFaceStatus] = useState({});
  
  useEffect(() => {
    const loadElections = async () => {
      const response = await voterAPI.getAvailableElections();
      const electionsList = response.data.elections;
      setElections(electionsList);
      
      // Check face status for each election
      const statusPromises = electionsList.map(async (election) => {
        try {
          const status = await faceAPI.getFaceStatus(election.id);
          return { [election.id]: status.data.registered };
        } catch (error) {
          return { [election.id]: false };
        }
      });
      
      const statuses = await Promise.all(statusPromises);
      const statusMap = Object.assign({}, ...statuses);
      setFaceStatus(statusMap);
    };
    
    loadElections();
  }, []);
  
  return (
    <div>
      {elections.map(election => (
        <div key={election.id}>
          <h3>{election.title}</h3>
          
          {/* Show face registration status */}
          {faceStatus[election.id] ? (
            <span className="text-green-600">✓ Face Registered</span>
          ) : (
            <span className="text-yellow-600">⚠ Face Registration Required</span>
          )}
          
          <button onClick={() => navigate(`/elections/${election.id}/vote`)}>
            Vote Now
          </button>
        </div>
      ))}
    </div>
  );
};
```

### 4. Face Verification During Voting

**When verifying face before casting vote:**

```jsx
const verifyFaceBeforeVoting = async (electionId) => {
  try {
    // Get stored face descriptor for this election
    const storedFace = await faceAPI.getFaceDescriptor(electionId);
    
    if (!storedFace.data) {
      toast.error('Please register your face first');
      return false;
    }
    
    // Capture current face
    const currentDescriptor = await captureFace();
    
    // Compare descriptors
    const similarity = calculateSimilarity(
      storedFace.data.descriptor, 
      currentDescriptor
    );
    
    const verified = similarity >= 0.6;
    
    // Log verification with election ID
    await faceAPI.logVerification(verified, similarity, electionId);
    
    return verified;
  } catch (error) {
    console.error('Face verification error:', error);
    return false;
  }
};
```

## New Features to Add

### 1. Elections Needing Registration Page

Create a page showing all elections that need face registration:

```jsx
import { faceAPI } from '../services/api';

const FaceRegistrationNeeded = () => {
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadElections = async () => {
      try {
        const response = await faceAPI.getElectionsNeedingRegistration();
        setElections(response.data);
      } catch (error) {
        console.error('Error loading elections:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadElections();
  }, []);
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Face Registration Required</h1>
      
      {elections.filter(e => !e.face_registered).length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-600">
            ✓ You're all set! Face registered for all active elections.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {elections.filter(e => !e.face_registered).map(election => (
            <div key={election.id} className="border rounded-lg p-6">
              <h3 className="text-xl font-semibold">{election.title}</h3>
              <p className="text-gray-600">{election.election_type}</p>
              <p className="text-sm text-gray-500">
                {new Date(election.start_date).toLocaleDateString()} - 
                {new Date(election.end_date).toLocaleDateString()}
              </p>
              
              <button 
                onClick={() => handleRegisterFace(election.id)}
                className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg"
              >
                Register Face for This Election
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

### 2. Face Registration Status Badge

Create a reusable component:

```jsx
const FaceRegistrationBadge = ({ electionId }) => {
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await faceAPI.getFaceStatus(electionId);
        setRegistered(response.data.registered);
      } catch (error) {
        console.error('Error checking face status:', error);
      } finally {
        setLoading(false);
      }
    };
    
    checkStatus();
  }, [electionId]);
  
  if (loading) {
    return <span className="text-gray-400">Checking...</span>;
  }
  
  return registered ? (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
      <FiCheck className="mr-1" /> Face Registered
    </span>
  ) : (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-800">
      <FiAlertCircle className="mr-1" /> Registration Required
    </span>
  );
};
```

### 3. Admin Face Statistics Dashboard

```jsx
const AdminFaceStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await faceAPI.getFaceStats();
        setStats(response.data);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Active Elections</h3>
        <p className="text-3xl font-bold text-blue-600">
          {stats.activeElections}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Total Registrations</h3>
        <p className="text-3xl font-bold text-green-600">
          {stats.totalRegistrations}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">By Election Type</h3>
        <div className="space-y-2">
          {stats.byElectionType.map(type => (
            <div key={type.election_type} className="flex justify-between">
              <span>{type.election_type}</span>
              <span className="font-semibold">{type.count}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="col-span-full bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Recent Cleanups</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Election</th>
              <th className="text-left py-2">Type</th>
              <th className="text-right py-2">Records Deleted</th>
              <th className="text-right py-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentCleanups.map(cleanup => (
              <tr key={cleanup.id} className="border-b">
                <td className="py-2">{cleanup.election_title}</td>
                <td className="py-2">{cleanup.election_type}</td>
                <td className="text-right py-2">{cleanup.records_deleted}</td>
                <td className="text-right py-2">
                  {new Date(cleanup.cleaned_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
```

## User Flow Examples

### Flow 1: First Time Voter

1. User registers account
2. User verifies email/OTP
3. User logs in
4. System detects active elections
5. For each active election:
   - Check if face registered
   - If not, show registration modal
   - User registers face
6. User can now vote in all elections

### Flow 2: Returning Voter with New Election

1. User logs in
2. System shows elections list
3. User sees:
   - Election A: ✓ Face Registered (can vote)
   - Election B: ⚠ Registration Required (new election)
4. User clicks on Election B
5. Face registration modal appears
6. User registers face for Election B
7. User can now vote in Election B

### Flow 3: After Election Ends

1. Election ends (status changes to 'completed')
2. Cleanup job runs (within 1 hour)
3. User's face data for that election is deleted
4. User logs in later
5. System shows only active elections
6. Completed election no longer requires face data

## Testing Checklist

- [ ] Face registration works for specific election
- [ ] Face status check returns correct status per election
- [ ] Multiple elections can have separate face registrations
- [ ] Face verification uses correct election's data
- [ ] Elections list shows registration status
- [ ] Face registration modal receives election ID
- [ ] Cleanup doesn't affect active elections
- [ ] Admin can view face statistics
- [ ] Admin can trigger manual cleanup
- [ ] Error handling for missing election ID

## Common Issues & Solutions

### Issue 1: "Election ID is required" error

**Solution:** Ensure all face API calls include election ID:
```javascript
// Wrong
await faceAPI.getFaceStatus();

// Correct
await faceAPI.getFaceStatus(electionId);
```

### Issue 2: Face registration modal doesn't close

**Solution:** Ensure onSuccess callback is properly called:
```javascript
<FaceRegistration 
  electionId={electionId}
  onSuccess={() => {
    setShowModal(false);
    // Refresh face status
    checkFaceStatus();
  }}
/>
```

### Issue 3: User can't vote after registering face

**Solution:** Refresh face status after registration:
```javascript
const handleRegistrationSuccess = async () => {
  setShowRegistrationModal(false);
  // Refresh status
  const status = await faceAPI.getFaceStatus(electionId);
  setFaceRegistered(status.data.registered);
};
```

## Migration Path

### Phase 1: Update API Calls (Required)
1. Update all `faceAPI` calls to include election ID
2. Test with one election

### Phase 2: Update UI (Recommended)
1. Add face registration status badges
2. Show registration prompts per election
3. Update elections list

### Phase 3: Add New Features (Optional)
1. Face registration dashboard
2. Admin statistics page
3. Bulk registration flow

## Summary

**Key Points:**
- Always pass `electionId` to face API calls
- Check face status per election, not globally
- Handle multiple elections separately
- Show clear UI for registration status
- Test thoroughly with multiple elections

**Benefits:**
- Better privacy (data deleted when not needed)
- Better security (data isolated per election)
- Better UX (clear per-election status)
- Compliance with data minimization principles
