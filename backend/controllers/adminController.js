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

  // Get voters with verification status
  static async getVotersWithStatus(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const verified = req.query.verified;
      const otpVerified = req.query.otp_verified;
      const hasVoted = req.query.has_voted;

      const filters = { role: 'voter' };
      if (verified !== undefined) filters.is_verified = verified === 'true';
      if (otpVerified !== undefined) filters.otp_verified = otpVerified === 'true';
      if (hasVoted !== undefined) filters.has_voted = hasVoted === 'true';

      const result = await User.getVotersWithStatus(page, limit, filters);

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        voters: result.voters
      });
    } catch (error) {
      next(error);
    }
  }

  // Export voters to CSV
  static async exportVotersCSV(req, res, next) {
    try {
      const verified = req.query.verified;
      const otpVerified = req.query.otp_verified;
      const hasVoted = req.query.has_voted;

      const filters = { role: 'voter' };
      if (verified !== undefined) filters.is_verified = verified === 'true';
      if (otpVerified !== undefined) filters.otp_verified = otpVerified === 'true';
      if (hasVoted !== undefined) filters.has_voted = hasVoted === 'true';

      const voters = await User.getAllVotersForExport(filters);

      // Generate CSV
      const csvHeader = 'Name,Email,Phone,Voter ID,Verified,OTP Verified,Has Voted,Last Login,Created At\n';
      const csvRows = voters.map(voter => {
        return [
          voter.name || '',
          voter.email || '',
          voter.phone || '',
          voter.voter_id || '',
          voter.is_verified ? 'Yes' : 'No',
          voter.otp_verified ? 'Yes' : 'No',
          voter.has_voted ? 'Yes' : 'No',
          voter.last_login ? new Date(voter.last_login).toLocaleString() : 'Never',
          voter.created_at ? new Date(voter.created_at).toLocaleString() : ''
        ].map(field => `"${field}"`).join(',');
      }).join('\n');

      const csv = csvHeader + csvRows;

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=voters-${Date.now()}.csv`);
      res.send(csv);

      // Log action
      AdminService.logAction(req.user.userId, 'EXPORT_VOTERS_CSV', 'user', null, filters, req.ip);
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
      const { title, description, start_date, end_date, is_public, election_type, election_subtype } = req.body;

      const election = await Election.create(
        { title, description, start_date, end_date, is_public, election_type, election_subtype },
        req.user.userId
      );

      res.status(201).json({
        message: 'Election created successfully',
        election
      });

      // Log action
      AdminService.logAction(req.user.userId, 'CREATE_ELECTION', 'election', election.id, req.body, req.ip);
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        return res.status(409).json({ error: error.message });
      }
      next(error);
    }
  }

  // Get all elections
  static async getAllElections(req, res, next) {
    try {
      // Auto-update election status based on dates
      await Election.updateStatusBasedOnDate();

      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;
      const status = req.query.status;
      const countryId = req.query.country_id;
      const stateId = req.query.state_id;
      const electionType = req.query.election_type;
      const electionSubtype = req.query.election_subtype;

      const filters = {};
      if (status) filters.status = status;
      if (countryId) filters.country_id = parseInt(countryId);
      if (stateId) filters.state_id = parseInt(stateId);
      if (electionType) filters.election_type = electionType;
      if (electionSubtype) filters.election_subtype = electionSubtype;

      const result = await Election.getAll(page, limit, filters);

      // Fetch location names for each election
      const Location = require('../models/Location');
      const electionsWithLocation = await Promise.all(
        result.elections.map(async (election) => {
          let countryName = null;
          let stateName = null;

          if (election.country_id) {
            const country = await Location.getCountryById(election.country_id);
            countryName = country ? country.name : null;
          }

          if (election.state_id) {
            const state = await Location.getStateById(election.state_id);
            stateName = state ? state.name : null;
          }

          return {
            ...election,
            country_name: countryName,
            state_name: stateName
          };
        })
      );

      res.json({
        total: result.total,
        pages: result.pages,
        current_page: page,
        elections: electionsWithLocation
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
      const { title, description, start_date, end_date, is_public, election_type, election_subtype } = req.body;

      const success = await Election.update(id, { title, description, start_date, end_date, is_public, election_type, election_subtype });

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
      const { election_id, name, description, position, party_id, party_name, inst_role, organization } = req.body;

      const election = await Election.findById(election_id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const isInstitutional = ['college', 'university', 'society', 'company']
        .includes((election.election_type || '').toLowerCase());

      if (isInstitutional) {
        if (!inst_role || !organization) {
          return res.status(400).json({ error: 'Position and Organization are required for institutional elections' });
        }
        if (party_id || party_name) {
          return res.status(400).json({ error: 'Party data is not allowed for institutional elections' });
        }
      }

      const candidate = await Candidate.create({
        election_id,
        name,
        description,
        position: isInstitutional ? null : position,
        party_id: isInstitutional ? null : (party_id || null),
        party_name: isInstitutional ? null : (party_name || null),
        inst_role: isInstitutional ? inst_role : null,
        organization: isInstitutional ? organization : null
      });

      res.status(201).json({
        message: 'Candidate created successfully',
        candidate
      });

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

  // Get candidates by party
  static async getCandidatesByParty(req, res, next) {
    try {
      const { party_id } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;

      const result = await Candidate.getByParty(party_id, page, limit);

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
