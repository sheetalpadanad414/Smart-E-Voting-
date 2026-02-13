const express = require('express');
const router = express.Router();
const ElectionOfficerController = require('../controllers/electionOfficerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and election_officer role
router.use(authenticateToken);
router.use(authorizeRole('election_officer'));

// Get assigned elections
router.get('/elections', ElectionOfficerController.getAssignedElections);

// Get election details with candidates and live vote stats
router.get('/elections/:electionId/details', ElectionOfficerController.getElectionDetails);

// Get live voting updates
router.get('/elections/:electionId/updates', ElectionOfficerController.getVotingUpdates);

// Generate live report
router.get('/elections/:electionId/report', ElectionOfficerController.generateLiveReport);

// Get voter turnout statistics
router.get('/elections/:electionId/turnout', ElectionOfficerController.getVoterTurnout);

// Monitor suspicious activities/alerts
router.get('/elections/:electionId/alerts', ElectionOfficerController.getMonitoringAlerts);

// Export election data
router.get('/elections/:electionId/export', ElectionOfficerController.exportElectionData);

module.exports = router;
