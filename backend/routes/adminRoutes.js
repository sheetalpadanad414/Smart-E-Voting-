const express = require('express');
const router = express.Router();
const AdminController = require('../controllers/adminController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { validateElectionCreate, validateCandidateCreate } = require('../middleware/validators');

// All admin routes require authentication and admin role
router.use(authenticateToken, authorizeRole(['admin']));

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// User management
router.get('/users', AdminController.getAllUsers);
router.post('/users', AdminController.createUser);
router.put('/users/:id', AdminController.updateUser);
router.delete('/users/:id', AdminController.deleteUser);

// Election management
router.get('/elections', AdminController.getAllElections);
router.get('/elections/:id', AdminController.getElection);
router.post('/elections', validateElectionCreate, AdminController.createElection);
router.put('/elections/:id', AdminController.updateElection);
router.delete('/elections/:id', AdminController.deleteElection);

// Candidate management
router.get('/elections/:election_id/candidates', AdminController.getCandidates);
router.post('/candidates', validateCandidateCreate, AdminController.createCandidate);
router.put('/candidates/:id', AdminController.updateCandidate);
router.delete('/candidates/:id', AdminController.deleteCandidate);

// Audit logs
router.get('/audit-logs', AdminController.getAuditLogs);

module.exports = router;
