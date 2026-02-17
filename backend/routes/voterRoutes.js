const express = require('express');
const router = express.Router();
const VoterController = require('../controllers/voterController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateVote } = require('../middleware/validators');

// Public routes (elections and results) - No authentication required
router.get('/elections', VoterController.getAvailableElections);
router.get('/elections/:id', VoterController.getElectionDetails);
router.get('/elections/:id/results', VoterController.getElectionResults);
router.get('/elections/:id/results/export', VoterController.exportResultsPDF);

// Protected routes (voting and history) - Authentication required
router.post('/vote/request-otp', authenticateToken, authorizeRole(['voter']), VoterController.requestVoteOTP);
router.post('/vote/verify-otp', authenticateToken, authorizeRole(['voter']), VoterController.verifyVoteOTP);
router.post('/vote', authenticateToken, authorizeRole(['voter']), validateVote, VoterController.castVote);
router.get('/voting-history', authenticateToken, authorizeRole(['voter']), VoterController.getVotingHistory);

module.exports = router;
