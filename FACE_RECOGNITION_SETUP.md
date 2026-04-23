# Face Recognition Setup Guide

## Quick Start

### Step 1: Install Dependencies

#### Backend
```bash
cd backend
npm install face-api.js@0.22.2 canvas@2.11.2 sharp@0.33.0 @tensorflow/tfjs-node@4.11.0
```

#### Frontend
```bash
cd frontend
npm install react-webcam@7.1.1
```

### Step 2: Download Face Recognition Models

Create models directory and download pre-trained models:

```bash
cd backend
mkdir -p models/face-recognition
cd models/face-recognition
```

Download these files from face-api.js repository:
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/ssd_mobilenetv1_model-weights_manifest.json
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/ssd_mobilenetv1_model-shard1
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/face_landmark_68_model-weights_manifest.json
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/face_landmark_68_model-shard1
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/face_recognition_model-weights_manifest.json
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/face_recognition_model-shard1
- https://github.com/justadudewhohacks/face-api.js/blob/master/weights/face_recognition_model-shard2

Or use this script:

```bash
# Download models script
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/ssd_mobilenetv1_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_landmark_68_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-weights_manifest.json
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard1
wget https://github.com/justadudewhohacks/face-api.js/raw/master/weights/face_recognition_model-shard2
```

### Step 3: Run Database Migration

```bash
cd backend
node migrations/add-face-recognition.js
```

### Step 4: Update Environment Variables

Add to `backend/.env`:
```env
FACE_RECOGNITION_ENABLED=true
FACE_SIMILARITY_THRESHOLD=0.6
```

### Step 5: Register Face Routes in Server

Add to `backend/server.js`:

```javascript
const faceRoutes = require('./routes/faceRoutes');

// After other routes
app.use('/api/face', faceRoutes);
```

### Step 6: Load Models at Startup

Add to `backend/server.js` (after database connection):

```javascript
const faceRecognitionService = require('./services/faceRecognitionService');

// Load face recognition models
faceRecognitionService.loadModels()
  .then(() => console.log('✓ Face recognition ready'))
  .catch(err => console.error('Face recognition unavailable:', err));
```

### Step 7: Update API Service (Frontend)

Add to `frontend/src/services/api.js`:

```javascript
// Face Recognition endpoints
export const faceAPI = {
  registerFace: (faceImage) => {
    const formData = new FormData();
    formData.append('face', faceImage);
    return api.post('/face/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  verifyFace: (faceImage) => {
    const formData = new FormData();
    formData.append('face', faceImage);
    return api.post('/face/verify', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  getFaceStatus: () => api.get('/face/status'),
  
  deleteFaceData: () => api.delete('/face/delete')
};
```

## Usage Examples

### 1. Register Face During User Registration

```javascript
import { useState } from 'react';
import FaceCapture from '../components/FaceCapture';
import { faceAPI } from '../services/api';
import toast from 'react-hot-toast';

function RegisterPage() {
  const [showFaceCapture, setShowFaceCapture] = useState(false);

  const handleFaceCapture = async (faceBlob) => {
    try {
      const response = await faceAPI.registerFace(faceBlob);
      toast.success('Face registered successfully!');
      setShowFaceCapture(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Face registration failed');
    }
  };

  return (
    <div>
      <button onClick={() => setShowFaceCapture(true)}>
        Register Face
      </button>

      {showFaceCapture && (
        <FaceCapture
          mode="register"
          onCapture={handleFaceCapture}
          onCancel={() => setShowFaceCapture(false)}
        />
      )}
    </div>
  );
}
```

### 2. Verify Face Before Voting

```javascript
import { useState } from 'react';
import FaceCapture from '../components/FaceCapture';
import { faceAPI } from '../services/api';
import toast from 'react-hot-toast';

function VotingPage() {
  const [showFaceVerify, setShowFaceVerify] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);

  const handleFaceVerify = async (faceBlob) => {
    try {
      const response = await faceAPI.verifyFace(faceBlob);
      
      if (response.data.data.verified) {
        toast.success('Face verified! You can now vote.');
        setFaceVerified(true);
        setShowFaceVerify(false);
      } else {
        toast.error(response.data.data.message);
        // Fallback to OTP
      }
    } catch (error) {
      toast.error('Face verification failed. Please use OTP.');
      // Fallback to OTP
    }
  };

  return (
    <div>
      {!faceVerified && (
        <button onClick={() => setShowFaceVerify(true)}>
          Verify Face to Vote
        </button>
      )}

      {showFaceVerify && (
        <FaceCapture
          mode="verify"
          onCapture={handleFaceVerify}
          onCancel={() => setShowFaceVerify(false)}
        />
      )}

      {faceVerified && (
        <div>
          {/* Show voting interface */}
        </div>
      )}
    </div>
  );
}
```

## Testing

### Test Face Registration
```bash
curl -X POST http://localhost:5000/api/face/register \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "face=@test-face.jpg"
```

### Test Face Verification
```bash
curl -X POST http://localhost:5000/api/face/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "face=@test-face.jpg"
```

### Check Face Status
```bash
curl http://localhost:5000/api/face/status \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Troubleshooting

### Issue: "Cannot find module 'canvas'"
**Solution**: Install canvas with native dependencies
```bash
# Windows
npm install --global windows-build-tools
npm install canvas

# Linux
sudo apt-get install build-essential libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev librsvg2-dev
npm install canvas

# macOS
brew install pkg-config cairo pango libpng jpeg giflib librsvg
npm install canvas
```

### Issue: "Face recognition models not available"
**Solution**: Ensure models are downloaded to `backend/models/face-recognition/`

### Issue: "No face detected in image"
**Solution**: 
- Ensure good lighting
- Face should be clearly visible
- Remove glasses/masks
- Look directly at camera

### Issue: Low similarity scores
**Solution**:
- Adjust threshold in .env: `FACE_SIMILARITY_THRESHOLD=0.5`
- Ensure consistent lighting between registration and verification
- Register face in similar conditions to verification

## Performance Optimization

### 1. Use GPU Acceleration (Optional)
```bash
npm install @tensorflow/tfjs-node-gpu
```

### 2. Cache Face Descriptors
Already implemented in service - descriptors are stored in database

### 3. Image Optimization
Already implemented - images are resized to 640x480 and compressed

### 4. Async Processing
Consider using a job queue for face processing in production:
```bash
npm install bull redis
```

## Security Best Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Rate Limiting**: Limit face verification attempts
3. **Encryption**: Encrypt face descriptors in database
4. **Consent**: Get explicit user consent
5. **Data Retention**: Delete face data when user account is deleted
6. **Audit Logs**: All verification attempts are logged

## Production Checklist

- [ ] Models downloaded and accessible
- [ ] Database migration completed
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Face data encryption enabled
- [ ] User consent flow implemented
- [ ] Fallback to OTP working
- [ ] Verification logs monitored
- [ ] Privacy policy updated
- [ ] GDPR compliance verified

## Support

For issues or questions:
1. Check troubleshooting section
2. Review face-api.js documentation
3. Check server logs for errors
4. Test with different images/lighting

## Next Steps

1. Implement liveness detection (blink detection)
2. Add multiple face angle registration
3. Implement anti-spoofing measures
4. Add face quality checks
5. Implement face aging tolerance
