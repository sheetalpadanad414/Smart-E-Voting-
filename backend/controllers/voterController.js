const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const OTP = require('../models/OTP');
const User = require('../models/User');
const { pool } = require('../config/database');
const { generateElectionResultsPDF } = require('../utils/pdfGenerator');
const AdminService = require('../services/adminService');

class VoterController {
  // Get available elections
  static async getAvailableElections(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const result = await Election.getAll(page, limit, { is_public: true });

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

  // Get election details with candidates
  static async getElectionDetails(req, res, next) {
    try {
      const { id } = req.params;

      const election = await Election.findById(id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      // Get candidates
      const candidatesResult = await Candidate.getByElection(id);

      // Check if user has voted
      const hasVoted = await Vote.hasVoted(id, req.user.userId);

      res.json({
        election,
        candidates: candidatesResult.candidates,
        has_voted: hasVoted
      });
    } catch (error) {
      next(error);
    }
  }

  // Cast vote
  static async castVote(req, res, next) {
    try {
      const { election_id, candidate_id } = req.body;

      // Ensure user has completed OTP verification for voting
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const hasVerifiedOTP = await OTP.hasVerified(user.email, 'vote');
      if (!hasVerifiedOTP) {
        return res.status(403).json({ error: 'OTP verification required before voting' });
      }

      // Check election exists and is active
      const election = await Election.findById(election_id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.status !== 'active') {
        return res.status(400).json({ error: 'This election is not currently active' });
      }

      // Check if election is within voting window
      const now = new Date();
      if (now < new Date(election.start_date) || now > new Date(election.end_date)) {
        return res.status(400).json({ error: 'Election voting period has ended or not started' });
      }

      // Check if already voted
      const hasVoted = await Vote.hasVoted(election_id, req.user.userId);
      if (hasVoted) {
        return res.status(400).json({ error: 'You have already voted in this election' });
      }

      // Verify candidate exists
      const candidate = await Candidate.findById(candidate_id);
      if (!candidate || candidate.election_id !== election_id) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Record vote
      const vote = await Vote.create({
        election_id,
        voter_id: req.user.userId,
        candidate_id,
        ip_address: req.ip,
        device_info: req.get('user-agent')
      });

      // Increment candidate vote count
      await Candidate.incrementVoteCount(candidate_id);

      res.status(201).json({
        message: 'Vote cast successfully',
        vote_id: vote.id
      });

      // Log action
      AdminService.logAction(req.user.userId, 'CAST_VOTE', 'vote', vote.id, { election_id, candidate_id }, req.ip);
    } catch (error) {
      if (error.message.includes('already voted')) {
        return res.status(400).json({ error: 'You have already voted in this election' });
      }
      next(error);
    }
  }

  // Request OTP for voting
  static async requestVoteOTP(req, res, next) {
    try {
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      // Generate OTP and store
      const otp = require('../utils/auth').generateOTP();
      const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE || 5) * 60 * 1000);
      await OTP.create(user.email, otp, 'vote', expiresAt);

      const emailSent = await require('../utils/email').sendOTPEmail(user.email, otp, 'vote');
      if (!emailSent) return res.status(500).json({ error: 'Failed to send OTP' });

      res.json({ message: 'OTP sent to registered email' });
    } catch (error) {
      next(error);
    }
  }

  // Verify OTP for voting
  static async verifyVoteOTP(req, res, next) {
    try {
      const { otp } = req.body;
      const user = await User.findById(req.user.userId);
      if (!user) return res.status(404).json({ error: 'User not found' });

      const isValid = await OTP.verify(user.email, otp, 'vote');
      if (!isValid) return res.status(400).json({ error: 'Invalid or expired OTP' });

      res.json({ message: 'OTP verified. You may now vote.' });
    } catch (error) {
      next(error);
    }
  }

  // Get voting history
  static async getVotingHistory(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 20;

      const connection = await pool.getConnection();
      const [votes] = await connection.query(`
        SELECT v.id, e.title as election_title, c.name as candidate_name, v.voted_at
        FROM votes v
        JOIN elections e ON v.election_id = e.id
        JOIN candidates c ON v.candidate_id = c.id
        WHERE v.voter_id = ?
        ORDER BY v.voted_at DESC
        LIMIT ?, ?
      `, [req.user.userId, (page - 1) * limit, limit]);

      const [countResult] = await connection.query('SELECT COUNT(*) as total FROM votes WHERE voter_id = ?', [req.user.userId]);
      connection.release();

      res.json({
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit),
        current_page: page,
        votes
      });
    } catch (error) {
      next(error);
    }
  }

  // Get election results
  static async getElectionResults(req, res, next) {
    try {
      const { id } = req.params;

      const election = await Election.findById(id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.status !== 'completed') {
        return res.status(400).json({ error: 'Results are not yet available' });
      }

      const results = await Vote.getElectionResults(id);
      const totalVotes = await Vote.getTotalVotes(id);

      // Get voter info
      const connection = await pool.getConnection();
      const [voterCount] = await connection.query(
        'SELECT COUNT(*) as total FROM users WHERE role = "voter" AND is_verified = 1'
      );
      connection.release();

      res.json({
        election,
        results: {
          total_voters: voterCount[0].total,
          total_votes: totalVotes,
          candidates: results,
          turnout: ((totalVotes / voterCount[0].total) * 100).toFixed(2)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Export results as PDF
  static async exportResultsPDF(req, res, next) {
    try {
      const { id } = req.params;

      const election = await Election.findById(id);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const results = await Vote.getElectionResults(id);
      const totalVotes = await Vote.getTotalVotes(id);

      const connection = await pool.getConnection();
      const [voterCount] = await connection.query(
        'SELECT COUNT(*) as total FROM users WHERE role = "voter" AND is_verified = 1'
      );
      connection.release();

      const resultsData = {
        total_voters: voterCount[0].total,
        total_votes: totalVotes,
        candidates: results
      };

      const filePath = await generateElectionResultsPDF(election, resultsData);

      res.download(filePath, `election-results-${election.title}.pdf`, (err) => {
        if (err) console.error('Error downloading PDF:', err);
      });

      // Log action
      AdminService.logAction(req.user.userId, 'EXPORT_RESULTS', 'election', id, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VoterController;
