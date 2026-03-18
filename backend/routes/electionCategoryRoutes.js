const express = require('express');
const router = express.Router();
const ElectionCategoryController = require('../controllers/electionCategoryController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(authenticateToken, authorizeRole(['admin']));

// Get all categories
router.get('/', ElectionCategoryController.getAllCategories);

// Get category by ID
router.get('/:id', ElectionCategoryController.getCategory);

// Get elections by category
router.get('/:id/elections', ElectionCategoryController.getElectionsByCategory);

// Get category statistics
router.get('/:id/statistics', ElectionCategoryController.getCategoryStatistics);

// Create election in category
router.post('/:id/elections', ElectionCategoryController.createElectionInCategory);

// Get election types by category
router.get('/:id/types', ElectionCategoryController.getTypesByCategory);

module.exports = router;
