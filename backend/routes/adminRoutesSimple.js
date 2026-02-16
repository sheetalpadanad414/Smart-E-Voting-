const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminControllerSimple');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Dashboard Route (Admin only)
router.get('/dashboard', verifyToken, verifyAdmin, adminController.getDashboard);

// Add Candidate Route (Admin only)
router.post('/candidates', verifyToken, verifyAdmin, adminController.addCandidate);

// Get All Candidates Route
router.get('/candidates', adminController.getAllCandidates);

// Delete Candidate Route (Admin only)
router.delete('/candidates/:id', verifyToken, verifyAdmin, adminController.deleteCandidate);

// Start Election Route (Admin only)
router.post('/election/start', verifyToken, verifyAdmin, adminController.startElection);

// Stop Election Route (Admin only)
router.post('/election/stop', verifyToken, verifyAdmin, adminController.stopElection);

// Get Election Status Route
router.get('/election/status', adminController.getElectionStatus);

// Get Election Results Route (Public)
router.get('/election/results', adminController.getElectionResults);

module.exports = router;
