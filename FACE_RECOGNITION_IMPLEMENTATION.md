# Face Recognition Feature Implementation Guide

## Overview
Add facial recognition to the Smart E-Voting System for enhanced voter verification during registration and voting.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Face Recognition Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. REGISTRATION                                             │
│     ├─> Capture face photo via webcam                       │
│     ├─> Extract face descriptors (128-dimension vector)     │
│     ├─> Store descriptors in database                       │
│     └─> Store photo in uploads/faces/                       │
│                                                               │
│  2. VOTING VERIFICATION                                      │
│     ├─> Capture live photo                                  │
│     ├─> Extract face descriptors                            │
│     ├─> Compare with stored descriptors                     │
│     ├─> Calculate similarity score                          │
│     └─> Allow voting if match > 0.6 threshold               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Required Dependencies

### Backend
```json
{
  "face-api.js": "^0.22.2",
  "canvas": "^2.11.2",
  "sharp": "^0.33.0",
  "@tensorflow/tfjs-node": "^4.11.0"
}
```

### Frontend
```json
{
  "react-webcam": "^7.1.1",
  "face-api.js": "^0.22.2"
}
```

## Database Schema Changes

### Add to `users` table:
```sql
ALTER TABLE users 
ADD COLUMN face_descriptor TEXT,
ADD COLUMN face_image_path VARCHAR(255),
ADD COLUMN face_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN face_registered_at TIMESTAMP NULL;
```

### Create `face_verification_logs` table:
```sql
CREATE TABLE face_verification_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  verification_type ENUM('registration', 'voting', 'login') NOT NULL,
  similarity_score DECIMAL(5,4),
  verified BOOLEAN,
  image_path VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Implementation Files

### 1. Backend Service: `backend/services/faceRecognitionService.js`
### 2. Backend Controller: `backend/controllers/faceController.js`
### 3. Backend Routes: `backend/routes/faceRoutes.js`
### 4. Backend Model: `backend/models/FaceVerification.js`
### 5. Frontend Component: `frontend/src/components/FaceCapture.jsx`
### 6. Frontend Component: `frontend/src/components/FaceVerification.jsx`
### 7. Frontend Hook: `frontend/src/hooks/useFaceRecognition.js`

## Security Considerations

1. **Privacy**: Face descriptors are stored as numerical vectors, not actual images
2. **Encryption**: Face descriptors should be encrypted in database
3. **Consent**: Users must explicitly consent to facial recognition
4. **Fallback**: Always provide alternative verification (OTP) if face recognition fails
5. **Liveness Detection**: Prevent photo spoofing (future enhancement)

## Features

### Phase 1 (Basic)
- ✅ Face capture during registration
- ✅ Face verification before voting
- ✅ Similarity threshold matching
- ✅ Verification logging

### Phase 2 (Advanced)
- ⏳ Liveness detection (blink detection)
- ⏳ Multiple face angles
- ⏳ Age verification
- ⏳ Real-time face tracking

## Configuration

### Environment Variables (.env)
```env
# Face Recognition Settings
FACE_RECOGNITION_ENABLED=true
FACE_SIMILARITY_THRESHOLD=0.6
FACE_UPLOAD_PATH=uploads/faces
FACE_MODEL_PATH=models/face-recognition
```

## API Endpoints

### Registration
- `POST /api/face/register` - Register face during user registration
- `POST /api/face/update` - Update face data

### Verification
- `POST /api/face/verify` - Verify face before voting
- `GET /api/face/status/:userId` - Check face registration status

### Admin
- `GET /api/admin/face/logs` - View verification logs
- `DELETE /api/admin/face/:userId` - Remove face data

## Usage Flow

### 1. Voter Registration with Face
```javascript
// Frontend captures face
const faceImage = await webcam.getScreenshot();

// Send to backend
await api.post('/api/face/register', {
  userId: user.id,
  faceImage: faceImage
});
```

### 2. Voting Verification
```javascript
// Before allowing vote
const faceImage = await webcam.getScreenshot();

const result = await api.post('/api/face/verify', {
  userId: user.id,
  faceImage: faceImage
});

if (result.verified && result.similarity > 0.6) {
  // Allow voting
} else {
  // Fallback to OTP
}
```

## Performance Optimization

1. **Model Loading**: Load face-api models once at server startup
2. **Image Compression**: Compress images before processing
3. **Caching**: Cache face descriptors in memory
4. **Async Processing**: Process face recognition asynchronously
5. **GPU Acceleration**: Use TensorFlow GPU if available

## Testing Checklist

- [ ] Face capture works on different browsers
- [ ] Face detection accuracy > 95%
- [ ] Face matching accuracy > 90%
- [ ] Handles poor lighting conditions
- [ ] Handles different face angles
- [ ] Prevents photo spoofing
- [ ] Fallback to OTP works
- [ ] Performance < 2 seconds per verification

## Compliance

### GDPR Compliance
- ✅ User consent required
- ✅ Right to delete face data
- ✅ Data encryption
- ✅ Purpose limitation
- ✅ Transparent processing

### Biometric Data Protection
- ✅ Secure storage
- ✅ Access logging
- ✅ Regular audits
- ✅ Incident response plan

## Cost Estimation

### Development Time
- Backend implementation: 8-12 hours
- Frontend implementation: 6-8 hours
- Testing & optimization: 4-6 hours
- Total: 18-26 hours

### Infrastructure
- Storage: ~1MB per user (face image + descriptors)
- Processing: CPU-intensive (consider GPU for scale)
- Models: ~10MB (one-time download)

## Next Steps

1. Install dependencies
2. Run database migrations
3. Download face-api models
4. Implement backend service
5. Implement frontend components
6. Test with real users
7. Deploy and monitor

## Support & Resources

- face-api.js docs: https://github.com/justadudewhohacks/face-api.js
- TensorFlow.js: https://www.tensorflow.org/js
- React Webcam: https://github.com/mozmorris/react-webcam
