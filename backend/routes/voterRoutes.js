const express = require('express');
const router = express.Router();
const VoterController = require('../controllers/voterController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateVote } = require('../middleware/validators');

// Public routes (elections and results)
router.get('/elections', VoterController.getAvailableElections);
router.get('/elections/:id', VoterController.getElectionDetails);
router.get('/elections/:id/results', VoterController.getElectionResults);
router.get('/elections/:id/results/export', VoterController.exportResultsPDF);

// Protected routes (voting and history)
router.use(authenticateToken, authorizeRole(['voter']));
router.post('/vote/request-otp', VoterController.requestVoteOTP);
router.post('/vote/verify-otp', VoterController.verifyVoteOTP);
router.post('/vote', validateVote, VoterController.castVote);
router.get('/voting-history', VoterController.getVotingHistory);

module.exports = router;
