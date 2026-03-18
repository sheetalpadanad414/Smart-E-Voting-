const Party = require('../models/Party');
const AdminService = require('../services/adminService');
const path = require('path');
const fs = require('fs');

class PartyController {
  // Get all parties with pagination and search
  static async getAllParties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const search = req.query.search || '';

      const result = await Party.getAll(page, limit, search);

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        parties: result.parties
      });
    } catch (error) {
      next(error);
    }
  }

  // Get all parties (simple list for dropdowns)
  static async getPartiesSimple(req, res, next) {
    try {
      const parties = await Party.getAllSimple();
      res.json({ parties });
    } catch (error) {
      next(error);
    }
  }

  // Get party by ID
  static async getParty(req, res, next) {
    try {
      const { id } = req.params;
      const party = await Party.findById(id);

      if (!party) {
        return res.status(404).json({ error: 'Party not found' });
      }

      res.json({ party });
    } catch (error) {
      next(error);
    }
  }

  // Create party with logo filename
  static async createParty(req, res, next) {
    try {
      const { name, description, logo } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Party name is required' });
      }

      // logo should be just filename (e.g., 'aap.png')
      // Model will convert to full URL when retrieving
      const party = await Party.create({ name, logo: logo || null, description });

      res.status(201).json({
        message: 'Party created successfully',
        party  // Will have full URL from model
      });

      // Log action
      if (req.user) {
        AdminService.logAction(req.user.userId, 'CREATE_PARTY', 'party', party.id, req.body, req.ip);
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Update party with logo filename
  static async updateParty(req, res, next) {
    try {
      const { id } = req.params;
      const updates = { ...req.body };

      // Get existing party
      const existingParty = await Party.findById(id);
      if (!existingParty) {
        return res.status(404).json({ error: 'Party not found' });
      }

      // logo should be just filename (e.g., 'bjp.png')
      // Model will convert to full URL when retrieving
      const success = await Party.update(id, updates);

      if (!success) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      const party = await Party.findById(id);  // Returns with full URL

      res.json({
        message: 'Party updated successfully',
        party
      });

      // Log action
      if (req.user) {
        AdminService.logAction(req.user.userId, 'UPDATE_PARTY', 'party', id, updates, req.ip);
      }
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Delete party
  static async deleteParty(req, res, next) {
    try {
      const { id } = req.params;

      await Party.delete(id);

      res.json({ message: 'Party deleted successfully' });

      // Log action
      if (req.user) {
        AdminService.logAction(req.user.userId, 'DELETE_PARTY', 'party', id, {}, req.ip);
      }
    } catch (error) {
      if (error.message.includes('Cannot delete')) {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  }
}

module.exports = PartyController;
