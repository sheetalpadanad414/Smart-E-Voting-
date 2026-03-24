const express = require('express');
const router = express.Router();
const InstitutionalController = require('../controllers/institutionalController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

router.use(authenticateToken, authorizeRole(['admin']));

// Elections
router.get('/elections', InstitutionalController.getAllElections);
router.post('/elections', InstitutionalController.createElection);
router.put('/elections/:id', InstitutionalController.updateElection);
router.delete('/elections/:id', InstitutionalController.deleteElection);

// Candidates
router.get('/elections/:election_id/candidates', InstitutionalController.getCandidates);
router.post('/candidates', InstitutionalController.createCandidate);
router.put('/candidates/:id', InstitutionalController.updateCandidate);
router.delete('/candidates/:id', InstitutionalController.deleteCandidate);

module.exports = router;
