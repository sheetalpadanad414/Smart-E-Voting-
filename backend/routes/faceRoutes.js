const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const FaceController = require('../controllers/faceController');

// Store face descriptor (from frontend)
router.post('/store-descriptor', authenticateToken, FaceController.storeFaceDescriptor);

// Get stored face descriptor
router.get('/get-descriptor', authenticateToken, FaceController.getFaceDescriptor);

// Log verification attempt
router.post('/log-verification', authenticateToken, FaceController.logVerification);

// Check face registration status
router.get('/status', authenticateToken, FaceController.getFaceStatus);

// Delete face data
router.delete('/delete', authenticateToken, FaceController.deleteFaceData);

module.exports = router;
