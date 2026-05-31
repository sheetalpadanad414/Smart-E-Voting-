const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const FaceController = require('../controllers/faceController');

// Store face descriptor for specific election
router.post('/store-descriptor', authenticateToken, FaceController.storeFaceDescriptor);

// Get stored face descriptor for specific election
router.get('/get-descriptor', authenticateToken, FaceController.getFaceDescriptor);

// Log verification attempt for specific election
router.post('/log-verification', authenticateToken, FaceController.logVerification);

// Check face registration status for specific election
router.get('/status', authenticateToken, FaceController.getFaceStatus);

// Get all elections needing face registration
router.get('/elections-needing-registration', authenticateToken, FaceController.getElectionsNeedingRegistration);

// Admin routes
router.delete('/delete', authenticateToken, FaceController.deleteFaceData);
router.post('/cleanup-inactive', authenticateToken, FaceController.cleanupInactiveFaceData);
router.get('/stats', authenticateToken, FaceController.getFaceStats);

module.exports = router;
