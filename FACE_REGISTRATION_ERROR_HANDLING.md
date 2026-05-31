# Face Registration Error Handling

## Updated Behavior

The system now properly handles face registration errors and **does NOT redirect** when face is already registered or fraud is detected.

## Error Scenarios

### 1. Same User, Same Election (Duplicate)

**What happens:**
```
User tries to register face again for same election
↓
System detects: Already registered
↓
❌ Show error: "Face already registered for this election. You cannot register again."
↓
⚠️ STAY on error screen - DO NOT redirect
↓
User must close modal manually
```

**User Experience:**
- Error message displayed for 5 seconds
- Modal stays open
- User cannot proceed to voting
- Must close modal and try different action

### 2. Same Face, Different Email (Fraud)

**What happens:**
```
User tries to register with different email but same face
↓
System detects: Face matches another account (john@example.com)
↓
❌ Show error: "This face is already registered by another account (john@example.com)"
↓
🚨 Log fraud attempt
↓
⏱️ Wait 3 seconds
↓
🚪 LOG OUT user
↓
Clear all auth data
↓
Redirect to login page
↓
Show: "Account suspended due to fraud attempt. Please contact admin."
```

**User Experience:**
- Error message displayed immediately
- After 3 seconds, automatically logged out
- All session data cleared
- Redirected to login page
- Cannot access system until admin review

### 3. New Face (Success)

**What happens:**
```
User registers new unique face
↓
System checks: Not registered, not fraud
↓
✅ Register face successfully
↓
Show success message
↓
Redirect to voting page
```

**User Experience:**
- Success message displayed
- Automatically redirected to voting
- Can proceed to cast vote

## Code Implementation

### Frontend Error Handling

```javascript
// In FaceRegistration.jsx
catch (error) {
  const errorMessage = error.response?.data?.message;
  
  if (errorMessage?.includes('already registered')) {
    // Show error
    toast.error(errorMessage, { duration: 6000 });
    
    // Check if it's fraud
    if (error.response.data.fraud) {
      // FRAUD: Log out user after 3 seconds
      setTimeout(() => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        toast.error('Account suspended due to fraud attempt');
        window.location.href = '/login';
      }, 3000);
    } else {
      // DUPLICATE: Just show error, don't redirect
      // User stays on error screen
    }
    
    setProcessing(false);
    return; // DO NOT call onSuccess()
  }
}
```

### Backend Response

**Duplicate (Same User):**
```json
{
  "success": false,
  "message": "Face already registered for this election. You cannot register again for the same election."
}
```

**Fraud (Different User):**
```json
{
  "success": false,
  "fraud": true,
  "message": "This face is already registered for this election by another account (john@example.com). Each person can only vote once per election.",
  "matchedEmail": "john@example.com"
}
```

## User Flow Diagrams

### Duplicate Attempt Flow

```
┌─────────────────────────┐
│ User clicks "Register   │
│ Face" again             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ System checks:          │
│ Already registered?     │
│ YES                     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ❌ Show Error:          │
│ "Already registered"    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ⚠️ STAY on error screen │
│ DO NOT redirect         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ User must close modal   │
│ manually                │
└─────────────────────────┘
```

### Fraud Attempt Flow

```
┌─────────────────────────┐
│ User registers with     │
│ fake@example.com        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Captures face           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ System compares with    │
│ existing faces          │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 🚨 FRAUD DETECTED!      │
│ Matches john@example.com│
│ Similarity: 85%         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ❌ Show Error:          │
│ "Face already           │
│ registered by           │
│ john@example.com"       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 📝 Log fraud attempt    │
│ in database             │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ⏱️ Wait 3 seconds       │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ 🚪 LOG OUT user         │
│ Clear all auth data     │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Redirect to login       │
│ "Account suspended"     │
└─────────────────────────┘
```

### Success Flow

```
┌─────────────────────────┐
│ User registers with     │
│ john@example.com        │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Captures face           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ System checks:          │
│ - Not registered ✓      │
│ - Not fraud ✓           │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ✅ Register face        │
│ successfully            │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ Show success message    │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│ ✅ Redirect to voting   │
│ page                    │
└─────────────────────────┘
```

## Error Messages

### 1. Duplicate Registration
```
"Face already registered for this election. You cannot register again for the same election."
```
- Duration: 6 seconds
- Action: Stay on screen, no redirect
- User: Must close modal

### 2. Fraud Detection
```
"This face is already registered for this election by another account (john@example.com). Each person can only vote once per election."
```
- Duration: Until logout
- Action: Log out after 3 seconds
- User: Redirected to login

### 3. Account Suspension
```
"Account suspended due to fraud attempt. Please contact admin."
```
- Duration: 5 seconds
- Action: Already logged out
- User: On login page

## Admin Actions

### View Fraud Attempts

```sql
SELECT 
  attempted_email,
  matched_email,
  similarity_score,
  detected_at
FROM face_fraud_detection_logs
WHERE blocked = TRUE
ORDER BY detected_at DESC;
```

### Unblock User (if false positive)

```sql
-- Delete fraud log
DELETE FROM face_fraud_detection_logs 
WHERE attempted_user_id = '<user_id>';

-- User can try again
```

## Testing

### Test Duplicate Prevention

1. Register face for election → ✅ Success
2. Try to register again → ❌ Error shown, stay on screen
3. Close modal → Back to previous page
4. Try to vote → Should work (already registered)

### Test Fraud Detection

1. Register with user1@example.com → ✅ Success
2. Logout
3. Register with user2@example.com using SAME FACE
4. → ❌ Error shown
5. → ⏱️ Wait 3 seconds
6. → 🚪 Logged out automatically
7. → Redirected to login
8. → "Account suspended" message

### Test Success Case

1. Register with unique face → ✅ Success
2. → Success message shown
3. → Automatically redirected to voting
4. → Can cast vote

## Summary

### Key Changes

1. **Duplicate:** Show error, DO NOT redirect, stay on screen
2. **Fraud:** Show error, log out after 3 seconds, redirect to login
3. **Success:** Show success, redirect to voting

### Benefits

- ✅ Clear error handling
- ✅ No confusion about why redirected
- ✅ Fraud attempts result in logout
- ✅ Legitimate users can proceed
- ✅ Admin can review fraud logs

### User Protection

- Cannot bypass duplicate check
- Cannot bypass fraud detection
- Fraud attempts logged
- Account suspended on fraud
- Must contact admin to resolve
