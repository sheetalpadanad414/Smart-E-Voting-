const Vote = require('../models/Vote');
const Candidate = require('../models/Candidate');
const Election = require('../models/Election');
const User = require('../models/User');
const { pool } = require('../config/database');

class VoteController {
  // Get candidates for voting
  static async getCandidates(req, res, next) {
    try {
      const { electionId } = req.params;

      // Check if election exists and is active
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.status !== 'active') {
        return res.status(400).json({ error: 'Election is not active' });
      }

      // Get candidates
      const result = await Candidate.getByElection(electionId);

      res.json({
        success: true,
        election: {
          id: election.id,
          title: election.title,
          description: election.description
        },
        candidates: result.candidates
      });
    } catch (error) {
      next(error);
    }
  }

  // Cast vote
  static async castVote(req, res, next) {
    try {
      const { electionId, candidateId, userId } = req.body;

      if (!electionId || !candidateId || !userId) {
        return res.status(400).json({ error: 'Election ID, Candidate ID, and User ID are required' });
      }

      // Check if user exists and is verified
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (!user.is_verified) {
        return res.status(403).json({ error: 'User is not verified' });
      }

      // Check if election exists and is active
      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (election.status !== 'active') {
        return res.status(400).json({ error: 'Election is not active' });
      }

      // Check if candidate exists
      const candidate = await Candidate.findById(candidateId);
      if (!candidate) {
        return res.status(404).json({ error: 'Candidate not found' });
      }

      // Check if user has already voted
      const hasVoted = await Vote.hasVoted(electionId, userId);
      if (hasVoted) {
        return res.status(400).json({ error: 'You have already voted in this election' });
      }

      // Get IP and device info
      const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
      const deviceInfo = req.headers['user-agent'] || 'unknown';

      // Cast vote
      const vote = await Vote.create({
        election_id: electionId,
        voter_id: userId,
        candidate_id: candidateId,
        ip_address: ipAddress,
        device_info: deviceInfo
      });

      // Update candidate vote count
      await Candidate.incrementVoteCount(candidateId);

      // Update user has_voted flag
      const connection = await pool.getConnection();
      await connection.query('UPDATE users SET has_voted = TRUE WHERE id = ?', [userId]);
      connection.release();

      res.json({
        success: true,
        message: 'Vote cast successfully',
        vote: {
          id: vote.id,
          candidate_name: candidate.name
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Check if user has voted
  static async checkVoteStatus(req, res, next) {
    try {
      const { electionId, userId } = req.params;

      const hasVoted = await Vote.hasVoted(electionId, userId);

      res.json({
        success: true,
        hasVoted
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = VoteController;
