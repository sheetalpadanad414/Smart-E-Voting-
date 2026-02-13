const User = require('../models/User');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const AdminService = require('../services/adminService');
require('dotenv').config();

class AdminController {
  // Dashboard stats
  static async getDashboard(req, res, next) {
    try {
      const stats = await AdminService.getDashboardStats(req.user.userId);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  }

  // Get all users
  static async getAllUsers(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const role = req.query.role;
      const verified = req.query.verified;

      const filters = {};
      if (role) filters.role = role;
      if (verified !== undefined) filters.is_verified = verified === 'true';

      const result = await User.getAll(page, limit, filters);

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        users: result.users
      });
    } catch (error) {
      next(error);
    }
  }

  // Create user
  static async createUser(req, res, next) {
    try {
      const { name, email, password, phone, role } = req.body;

      if (!['admin', 'voter'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const user = await User.create({ name, email, password, phone, role });

      // Mark as verified if created by admin
      if (role === 'admin') {
        await User.updateVerification(user.id);
      }

      res.status(201).json({
        message: 'User created successfully',
        user
      });

      // Log action
      AdminService.logAction(req.user.userId, 'CREATE_USER', 'user', user.id, { name, email, role }, req.ip);
    } catch (error) {
      if (error.message === 'Email already exists') {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Update user
  static async updateUser(req, res, next) {
    try {
      const { id } = req.params;
      const { name, phone, voter_id } = req.body;

      const success = await User.updateUser(id, { name, phone, voter_id });

      if (!success) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      const user = await User.findById(id);

      res.json({
        message: 'User updated successfully',
        user
      });

      // Log action
      AdminService.logAction(req.user.userId, 'UPDATE_USER', 'user', id, req.body, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Delete user
  static async deleteUser(req, res, next) {
    try {
      const { id } = req.params;

      if (id === req.user.userId) {
        return res.status(400).json({ error: 'Cannot delete your own account' });
      }

      await User.deleteUser(id);

      res.json({ message: 'User deleted successfully' });

      // Log action
      AdminService.logAction(req.user.userId, 'DELETE_USER', 'user', id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Create election
  static async createElection(req, res, next) {
    try {
      const { title, description, start_date, end_date, is_public } = req.body;

      const election = await Election.create(
        { title, description, start_date, end_date, is_public },
        req.user.userId
      );

      res.status(201).json({
        message: 'Election created successfully',
        election
      });

      // Log action
      AdminService.logAction(req.user.userId, 'CREATE_ELECTION', 'election', election.id, req.body, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Get all elections
  static async getAllElections(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;

      const result = await Election.getAll(page, limit, { status });

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        elections: result.elections
      });
    } catch (error) {
      next(error);
    }
  }

  // Get election by ID
  static async getElection(req, res, next) {
    try {
      const { id } = req.params;

      const election = await Election.findById(id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      // Get candidates
      const candidatesResult = await Candidate.getByElection(id);

      res.json({
        election,
        candidates: candidatesResult.candidates,
        total_candidates: candidatesResult.total
      });
    } catch (error) {
      next(error);
    }
  }

  // Update election
  static async updateElection(req, res, next) {
    try {
      const { id } = req.params;
      const { title, description, start_date, end_date, is_public } = req.body;

      const success = await Election.update(id, { title, description, start_date, end_date, is_public });

      if (!success) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      const election = await Election.findById(id);

      res.json({
        message: 'Election updated successfully',
        election
      });

      // Log action
      AdminService.logAction(req.user.userId, 'UPDATE_ELECTION', 'election', id, req.body, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Delete election
  static async deleteElection(req, res, next) {
    try {
      const { id } = req.params;

      const election = await Election.findById(id);
      if (!election || election.status !== 'draft') {
        return res.status(400).json({ error: 'Can only delete draft elections' });
      }

      await Election.delete(id);

      res.json({ message: 'Election deleted successfully' });

      // Log action
      AdminService.logAction(req.user.userId, 'DELETE_ELECTION', 'election', id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Create candidate
  static async createCandidate(req, res, next) {
    try {
      const { election_id, name, description, symbol, image_url, position, party_name } = req.body;

      const election = await Election.findById(election_id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const candidate = await Candidate.create({
        election_id,
        name,
        description,
        symbol,
        image_url,
        position,
        party_name
      });

      res.status(201).json({
        message: 'Candidate created successfully',
        candidate
      });

      // Log action
      AdminService.logAction(req.user.userId, 'CREATE_CANDIDATE', 'candidate', candidate.id, req.body, req.ip);
    } catch (error) {
      if (error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get candidates for election
  static async getCandidates(req, res, next) {
    try {
      const { election_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await Candidate.getByElection(election_id, page, limit);

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        candidates: result.candidates
      });
    } catch (error) {
      next(error);
    }
  }

  // Update candidate
  static async updateCandidate(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const success = await Candidate.update(id, updates);

      if (!success) {
        return res.status(400).json({ error: 'No updates provided' });
      }

      const candidate = await Candidate.findById(id);

      res.json({
        message: 'Candidate updated successfully',
        candidate
      });

      // Log action
      AdminService.logAction(req.user.userId, 'UPDATE_CANDIDATE', 'candidate', id, updates, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Delete candidate
  static async deleteCandidate(req, res, next) {
    try {
      const { id } = req.params;

      await Candidate.delete(id);

      res.json({ message: 'Candidate deleted successfully' });

      // Log action
      AdminService.logAction(req.user.userId, 'DELETE_CANDIDATE', 'candidate', id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Get audit logs
  static async getAuditLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const userId = req.query.user_id;
      const action = req.query.action;
      const entityType = req.query.entity_type;

      const filters = {};
      if (userId) filters.userId = userId;
      if (action) filters.action = action;
      if (entityType) filters.entityType = entityType;

      const logs = await AdminService.getAuditLogs(filters, page, limit);

      res.json({ logs });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AdminController;
