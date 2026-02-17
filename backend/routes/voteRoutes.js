const express = require('express');
const router = express.Router();
const VoteController = require('../controllers/voteController');

// Get candidates for an election
router.get('/candidates/:electionId', VoteController.getCandidates);

// Cast vote
router.post('/cast', VoteController.castVote);

// Check vote status
router.get('/status/:electionId/:userId', VoteController.checkVoteStatus);

module.exports = router;
