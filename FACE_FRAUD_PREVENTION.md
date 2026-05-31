# Face Fraud Prevention System

## Overview

This system prevents voting fraud by detecting when someone tries to register the same face with multiple email accounts to vote multiple times in the same election.

## How It Works

### Scenario: Fraud Attempt

```
User A registers with email: john@example.com
├─ Captures face
├─ Face descriptor stored
└─ ✅ Can vote

User B tries to register with email: fake@example.com
├─ Captures THE SAME FACE as User A
├─ System compares face with all existing faces in election
├─ Detects 85% similarity with john@example.com
└─ ❌ BLOCKED: "This face is already registered by another account"
```

## Detection Process

### Step 1: User Tries to Register Face

```javascript
POST /api/face/store-descriptor
{
  "descriptor": [0.123, 0.456, ...], // 128-dimensional face vector
  "electionId": "election-123"
}
```

### Step 2: Check Same User Duplicate

```sql
SELECT id FROM election_face_data 
WHERE user_id = ? AND election_id = ?
```

- **If found:** "Face already registered for this election"
- **If not found:** Continue to fraud check

### Step 3: Check for Face Fraud

```javascript
// Get all faces registered in this election (except current user)
SELECT face_descriptor, user_id, email 
FROM election_face_data 
WHERE election_id = ? AND user_id != ?

// Compare new face with each existing face
for (each existingFace) {
  similarity = calculateSimilarity(newFace, existingFace)
  
  if (similarity >= 0.6) { // 60% threshold
    // FRAUD DETECTED!
    return {
      matched: true,
      matchedEmail: existingFace.email,
      similarity: similarity
    }
  }
}
```

### Step 4: Response

**If fraud detected (similarity ≥ 60%):**
```json
{
  "success": false,
  "fraud": true,
  "message": "This face is already registered for this election by another account (john@example.com). Each person can only vote once per election.",
  "matchedEmail": "john@example.com"
}
```

**If no fraud (unique face):**
```json
{
  "success": true,
  "message": "Face registered successfully for this election"
}
```

## Similarity Calculation

### Euclidean Distance

```javascript
function calculateDistance(descriptor1, descriptor2) {
  let sum = 0;
  for (let i = 0; i < 128; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
}
```

### Similarity Score

```javascript
function calculateSimilarity(descriptor1, descriptor2) {
  const distance = calculateDistance(descriptor1, descriptor2);
  const similarity = Math.max(0, 1 - distance);
  return similarity; // 0 to 1 (0% to 100%)
}
```

### Threshold

- **Similarity ≥ 0.6 (60%):** Same person → BLOCK
- **Similarity < 0.6 (60%):** Different person → ALLOW

## Database Schema

### election_face_data (existing)
```sql
CREATE TABLE election_face_data (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  election_id VARCHAR(36) NOT NULL,
  face_descriptor JSON NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_election (user_id, election_id)
);
```

### face_fraud_detection_logs (new)
```sql
CREATE TABLE face_fraud_detection_logs (
  id VARCHAR(36) PRIMARY KEY,
  election_id VARCHAR(36) NOT NULL,
  attempted_user_id VARCHAR(36) NOT NULL,
  attempted_email VARCHAR(100),
  matched_user_id VARCHAR(36) NOT NULL,
  matched_email VARCHAR(100),
  similarity_score DECIMAL(5,4),
  blocked BOOLEAN DEFAULT TRUE,
  detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Example Fraud Scenarios

### Scenario 1: Multiple Accounts, Same Face

```
Day 1, 10:00 AM
├─ john@example.com registers face
│  └─ ✅ SUCCESS: Face stored

Day 1, 11:00 AM
├─ fake1@example.com tries to register SAME FACE
│  ├─ System compares with john@example.com
│  ├─ Similarity: 87%
│  └─ ❌ BLOCKED: "Face already registered by john@example.com"

Day 1, 12:00 PM
├─ fake2@example.com tries to register SAME FACE
│  ├─ System compares with john@example.com
│  ├─ Similarity: 85%
│  └─ ❌ BLOCKED: "Face already registered by john@example.com"
```

### Scenario 2: Different People (Allowed)

```
Day 1, 10:00 AM
├─ john@example.com registers face
│  └─ ✅ SUCCESS: Face stored

Day 1, 11:00 AM
├─ mary@example.com registers DIFFERENT FACE
│  ├─ System compares with john@example.com
│  ├─ Similarity: 15%
│  └─ ✅ ALLOWED: Different person
```

## Fraud Detection Logs

### View Fraud Attempts

```sql
SELECT 
  ffd.attempted_email,
  ffd.matched_email,
  ffd.similarity_score,
  ffd.detected_at,
  e.title as election
FROM face_fraud_detection_logs ffd
JOIN elections e ON ffd.election_id = e.id
WHERE ffd.blocked = TRUE
ORDER BY ffd.detected_at DESC;
```

### Example Log Entry

```
attempted_email: fake@example.com
matched_email: john@example.com
similarity_score: 0.8500 (85%)
detected_at: 2026-05-03 11:30:00
election: Vidhan Sabha 2026
blocked: TRUE
```

## Admin Statistics

### Get Fraud Stats

```
GET /api/face/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "activeElections": 2,
    "totalRegistrations": 150,
    "fraud": {
      "totalAttempts": 5,
      "byElection": [
        {
          "title": "Vidhan Sabha 2026",
          "attempts": 3
        },
        {
          "title": "Lok Sabha 2026",
          "attempts": 2
        }
      ],
      "recentAttempts": [
        {
          "attempted_email": "fake@example.com",
          "matched_email": "john@example.com",
          "similarity_score": 0.85,
          "detected_at": "2026-05-03T11:30:00.000Z"
        }
      ]
    }
  }
}
```

## Security Benefits

### 1. Prevents Multiple Voting
- ✅ One face = One vote per election
- ✅ Cannot create multiple accounts with same face
- ✅ Fraud attempts are logged

### 2. Automatic Detection
- ✅ No manual review needed
- ✅ Real-time fraud detection
- ✅ Immediate blocking

### 3. Audit Trail
- ✅ All fraud attempts logged
- ✅ Shows attempted and matched emails
- ✅ Similarity scores recorded

### 4. Privacy Maintained
- ✅ Face data deleted when election ends
- ✅ Only compared within same election
- ✅ No cross-election tracking

## Performance Optimization

### Index for Fast Lookups

```sql
CREATE INDEX idx_election_face_lookup 
ON election_face_data(election_id, registered_at);
```

### Comparison Complexity

- **N faces in election:** O(N) comparisons
- **128-dimensional vectors:** O(128) per comparison
- **Total:** O(N × 128)

**Example:**
- 1,000 registered faces
- 128,000 operations per check
- ~10ms on modern hardware

## Testing

### Test Fraud Detection

```bash
cd backend
node test-fraud-detection.js
```

**Expected Output:**
```
✅ User A registers face: SUCCESS
✅ User B tries same face: BLOCKED
✅ Fraud logged in database
✅ User C registers different face: SUCCESS
```

## Configuration

### Adjust Similarity Threshold

In `backend/controllers/faceController.js`:

```javascript
const fraudCheck = await FaceFraudDetectionService.checkForDuplicateFace(
  userId,
  electionId,
  descriptor,
  0.6 // Change this value (0.0 to 1.0)
);
```

**Recommendations:**
- **0.5 (50%):** More lenient, may allow similar faces
- **0.6 (60%):** Balanced (recommended)
- **0.7 (70%):** Stricter, may block legitimate twins

## User Messages

### Duplicate Email
```
"Email already exists"
```

### Same User, Same Election
```
"Face already registered for this election. You cannot register again for the same election."
```

### Same Face, Different Email (FRAUD)
```
"This face is already registered for this election by another account (john@example.com). Each person can only vote once per election."
```

## Summary

**The system now prevents fraud by:**

1. ✅ Checking if same user already registered (duplicate prevention)
2. ✅ Checking if same face used by different user (fraud detection)
3. ✅ Logging all fraud attempts for audit
4. ✅ Showing clear error messages
5. ✅ Maintaining privacy (data deleted when election ends)

**One face = One vote per election, regardless of how many email accounts someone creates!**
