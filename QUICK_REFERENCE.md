# Quick Reference - Election-Specific Face Recognition

## 🚀 Quick Start

### Run Migration
```bash
cd backend
node run-face-migration.js
```

### Test Cleanup
```bash
cd backend
node test-face-cleanup.js
```

### Start Server
```bash
cd backend
npm start
# Cleanup job starts automatically
```

---

## 📝 API Quick Reference

### Register Face
```javascript
POST /api/face/store-descriptor
Body: { descriptor: Array, electionId: String }
```

### Check Status
```javascript
GET /api/face/status?electionId=<id>
Response: { success: true, data: { registered: Boolean } }
```

### Get Elections Needing Registration
```javascript
GET /api/face/elections-needing-registration
Response: { success: true, data: [{ id, title, face_registered }] }
```

### Cleanup (Admin)
```javascript
POST /api/face/cleanup-inactive
Response: { electionsProcessed: Number, recordsDeleted: Number }
```

### Statistics (Admin)
```javascript
GET /api/face/stats
Response: { activeElections, totalRegistrations, byElectionType, recentCleanups }
```

---

## 💻 Frontend Code Snippets

### Register Face
```javascript
import { faceAPI } from './services/api';

// In component
const registerFace = async (descriptor, electionId) => {
  const response = await faceAPI.storeFaceDescriptor(descriptor, electionId);
  if (response.data.success) {
    toast.success('Face registered for this election!');
  }
};
```

### Check Status
```javascript
const checkFaceStatus = async (electionId) => {
  const response = await faceAPI.getFaceStatus(electionId);
  return response.data.registered;
};
```

### Get Elections Needing Registration
```javascript
const getElectionsNeedingFace = async () => {
  const response = await faceAPI.getElectionsNeedingRegistration();
  return response.data.filter(e => !e.face_registered);
};
```

### Face Registration Component
```jsx
<FaceRegistration 
  electionId={currentElectionId}
  onSuccess={() => {
    setShowModal(false);
    refreshFaceStatus();
  }}
  onCancel={() => navigate('/elections')}
/>
```

---

## 🗄️ Database Queries

### Check Face Registrations
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

### View Cleanup Logs
```sql
SELECT * FROM face_data_cleanup_logs 
ORDER BY cleaned_at DESC 
LIMIT 10;
```

### Check User's Registrations
```sql
SELECT 
  e.title,
  e.election_type,
  efd.registered_at,
  efd.verification_count
FROM election_face_data efd
JOIN elections e ON efd.election_id = e.id
WHERE efd.user_id = '<user_id>';
```

### Find Elections Without Face Data
```sql
SELECT 
  e.id,
  e.title,
  e.status,
  COUNT(efd.id) as face_registrations
FROM elections e
LEFT JOIN election_face_data efd ON e.id = efd.election_id
WHERE e.status = 'active'
GROUP BY e.id
HAVING face_registrations = 0;
```

---

## 🔧 Service Methods

### ElectionFaceService

```javascript
const ElectionFaceService = require('./services/electionFaceService');

// Register face
await ElectionFaceService.registerFaceForElection(userId, electionId, descriptor);

// Check if registered
const hasRegistered = await ElectionFaceService.hasFaceForElection(userId, electionId);

// Get face data
const faceData = await ElectionFaceService.getFaceForElection(userId, electionId);

// Record verification
await ElectionFaceService.recordVerification(userId, electionId, verified, similarity);

// Get elections needing registration
const elections = await ElectionFaceService.getElectionsNeedingFaceRegistration(userId);

// Cleanup inactive elections
const result = await ElectionFaceService.cleanupInactiveElectionFaceData();

// Cleanup specific election
await ElectionFaceService.cleanupElectionFaceData(electionId);

// Get statistics
const stats = await ElectionFaceService.getFaceRegistrationStats();
```

---

## 🕐 Cleanup Job

### Schedule
- Runs every hour at minute 0
- Uses node-schedule
- Starts automatically with server

### Manual Trigger
```javascript
const FaceDataCleanupJob = require('./jobs/faceDataCleanup');
await FaceDataCleanupJob.runNow();
```

### What Gets Cleaned
- Elections with status 'completed'
- Elections with status 'draft'
- Elections where end_date < NOW()

---

## 🐛 Troubleshooting

### Face Data Not Deleting
```bash
# Check election status
SELECT id, title, status, end_date FROM elections WHERE id = '<id>';

# Manually trigger cleanup
curl -X POST http://localhost:5000/api/face/cleanup-inactive \
  -H "Authorization: Bearer <admin_token>"
```

### Can't Register Face
```bash
# Check if already registered
SELECT * FROM election_face_data 
WHERE user_id = '<user_id>' AND election_id = '<election_id>';

# Check election status (must be 'active')
SELECT status FROM elections WHERE id = '<election_id>';
```

### Cleanup Job Not Running
```bash
# Check server logs for:
# "✓ Face data cleanup job scheduled (runs hourly)"

# Verify node-schedule is installed
npm list node-schedule
```

---

## 📊 Monitoring

### Check Active Registrations
```javascript
const stats = await ElectionFaceService.getFaceRegistrationStats();
console.log('Active Elections:', stats.activeElections);
console.log('Total Registrations:', stats.totalRegistrations);
console.log('By Type:', stats.byElectionType);
```

### View Recent Cleanups
```sql
SELECT 
  election_title,
  election_type,
  records_deleted,
  cleanup_reason,
  cleaned_at
FROM face_data_cleanup_logs
ORDER BY cleaned_at DESC
LIMIT 10;
```

### Check Verification Logs
```sql
SELECT 
  u.name,
  e.title,
  fvl.verification_type,
  fvl.verified,
  fvl.similarity_score,
  fvl.created_at
FROM face_verification_logs fvl
JOIN users u ON fvl.user_id = u.id
JOIN elections e ON fvl.election_id = e.id
ORDER BY fvl.created_at DESC
LIMIT 20;
```

---

## ✅ Testing Checklist

- [ ] Migration runs successfully
- [ ] Server starts without errors
- [ ] Face registration works with election ID
- [ ] Face status check returns correct result
- [ ] Multiple elections work independently
- [ ] Cleanup deletes correct data
- [ ] Cleanup logs are created
- [ ] Statistics are accurate
- [ ] Admin endpoints work
- [ ] Frontend components updated

---

## 📚 Documentation Files

1. **ELECTION_SPECIFIC_FACE_RECOGNITION.md** - Complete docs
2. **FACE_RECOGNITION_UPDATE_SUMMARY.md** - Overview
3. **FRONTEND_UPDATE_GUIDE.md** - Frontend guide
4. **IMPLEMENTATION_COMPLETE.md** - Status
5. **QUICK_REFERENCE.md** - This file

---

## 🎯 Key Points

- ✅ Face data is stored **per election**
- ✅ Face data is **automatically deleted** when election ends
- ✅ Users must register face **for each active election**
- ✅ Cleanup job runs **every hour**
- ✅ All operations are **logged**
- ✅ Statistics are **available**

---

## 🔗 Related Files

### Backend
- `backend/services/electionFaceService.js` - Main service
- `backend/controllers/faceController.js` - API controller
- `backend/jobs/faceDataCleanup.js` - Cleanup job
- `backend/migrations/add-election-specific-face-data.js` - Migration

### Frontend
- `frontend/src/services/api.js` - API methods
- `frontend/src/components/FaceRegistration.jsx` - Registration UI

---

**Last Updated:** 2026-05-03
**Status:** Backend Complete | Frontend Updates Needed
