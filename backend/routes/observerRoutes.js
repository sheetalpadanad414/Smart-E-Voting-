const express = require('express');
const router = express.Router();
const ObserverController = require('../controllers/observerController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and observer role
router.use(authenticateToken);
router.use(authorizeRole('observer'));

// Get all public elections to observe
router.get('/elections', ObserverController.getObservableElections);

// View election results (read-only)
router.get('/elections/:electionId/results', ObserverController.viewElectionResults);

// Get voting trends over time
router.get('/elections/:electionId/trends', ObserverController.getVotingTrends);

// Get comparative analysis of candidates
router.get('/elections/:electionId/analysis', ObserverController.getComparativeAnalysis);

// Export public report
router.get('/elections/:electionId/report', ObserverController.exportPublicReport);

// Get integrity verification data
router.get('/elections/:electionId/integrity', ObserverController.getIntegrityVerification);

module.exports = router;
