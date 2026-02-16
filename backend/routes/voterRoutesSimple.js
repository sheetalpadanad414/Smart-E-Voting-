const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterControllerSimple');
const { verifyToken } = require('../middleware/authMiddleware');

// Cast Vote Route (Requires JWT token)
router.post('/vote', verifyToken, voterController.castVote);

// Get Voting Status Route
router.get('/status', verifyToken, voterController.getVotingStatus);

module.exports = router;
