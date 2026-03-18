const express = require('express');
const router = express.Router();
const PartyController = require('../controllers/partyController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public routes (for dropdowns in forms)
router.get('/simple', PartyController.getPartiesSimple);

// Protected routes (require authentication)
router.get('/', authenticateToken, PartyController.getAllParties);
router.get('/:id', authenticateToken, PartyController.getParty);

// Admin only routes (no file upload - using direct URLs)
router.post('/', authenticateToken, authorizeRole(['admin']), PartyController.createParty);
router.put('/:id', authenticateToken, authorizeRole(['admin']), PartyController.updateParty);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), PartyController.deleteParty);

module.exports = router;
