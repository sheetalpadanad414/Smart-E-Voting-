const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/locationController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes - anyone can view countries and states
router.get('/countries', LocationController.getAllCountries);
router.get('/countries/:countryId/states', LocationController.getStatesByCountry);

// Protected routes - check voting eligibility
router.get('/elections/:electionId/eligibility', 
  authenticateToken, 
  authorizeRole(['voter']), 
  LocationController.checkVotingEligibility
);

// Admin routes - manage countries and states
router.post('/countries', 
  authenticateToken, 
  authorizeRole(['admin']), 
  LocationController.createCountry
);

router.post('/states', 
  authenticateToken, 
  authorizeRole(['admin']), 
  LocationController.createState
);

module.exports = router;
