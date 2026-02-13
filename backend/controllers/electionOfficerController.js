const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');
const AdminService = require('../services/adminService');

class ElectionOfficerController {
  // Get assigned elections
  static async getAssignedElections(req, res, next) {
    try {
      const userId = req.user.userId;
      const user = await User.findById(userId);

      // Get elections based on assignment area
      const elections = await Election.getAll(1, 100, {
        status: ['draft', 'active', 'completed']
      });

      const filteredElections = elections.elections.filter(election => {
        // If assignment_area is set, filter by it
        if (user.assignment_area) {
          return election.title.toLowerCase().includes(user.assignment_area.toLowerCase()) || 
                 election.description.toLowerCase().includes(user.assignment_area.toLowerCase());
        }
        return elections; // If no assignment, show all
      });

      res.json({
        elections: filteredElections,
        total: filteredElections.length
      });
    } catch (error) {
      next(error);
    }
  }

  // Get election details with candidates and votes
  static async getElectionDetails(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;
      const user = await User.findById(userId);

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      // Check if officer is assigned to this election
      if (user.assignment_area && !election.title.toLowerCase().includes(user.assignment_area.toLowerCase())) {
        return res.status(403).json({ error: 'You are not assigned to this election' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      // Calculate voting statistics
      const totalVotes = votes.length;
      const voterCount = new Set(votes.map(v => v.voter_id)).size;
      const candidateStats = candidates.map(candidate => {
        const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
        return {
          ...candidate,
          voteCount: candidateVotes.length,
          percentage: totalVotes > 0 ? ((candidateVotes.length / totalVotes) * 100).toFixed(2) : 0
        };
      });

      res.json({
        election,
        candidates: candidateStats,
        statistics: {
          totalVotes,
          voterCount,
          candidateCount: candidates.length,
          votingPercentage: voterCount > 0 ? ((totalVotes / voterCount) * 100).toFixed(2) : 0
        }
      });

      // Log action
      AdminService.logAction(userId, 'VIEW_ELECTION', 'election', electionId, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Get live voting updates
  static async getVotingUpdates(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      // Get votes per hour for the last 24 hours
      const hourlyData = {};
      votes.forEach(vote => {
        const hour = new Date(vote.voted_at).getHours();
        hourlyData[hour] = (hourlyData[hour] || 0) + 1;
      });

      const candidateStats = candidates.map(candidate => {
        const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
        return {
          ...candidate,
          voteCount: candidateVotes.length
        };
      });

      res.json({
        election,
        candidates: candidateStats,
        totalVotes: votes.length,
        hourlyUpdates: hourlyData,
        lastUpdated: new Date()
      });
    } catch (error) {
      next(error);
    }
  }

  // Generate live report
  static async generateLiveReport(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      const report = {
        electionTitle: election.title,
        electionDescription: election.description,
        startDate: election.start_date,
        endDate: election.end_date,
        status: election.status,
        totalVotes: votes.length,
        uniqueVoters: new Set(votes.map(v => v.voter_id)).size,
        candidates: candidates.map(candidate => {
          const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
          return {
            name: candidate.name,
            party: candidate.party_name,
            votes: candidateVotes.length,
            percentage: votes.length > 0 ? ((candidateVotes.length / votes.length) * 100).toFixed(2) : 0
          };
        }),
        generatedAt: new Date(),
        generatedBy: userId
      };

      res.json(report);

      // Log action
      AdminService.logAction(userId, 'GENERATE_REPORT', 'election', electionId, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Get voter turnout by area
  static async getVoterTurnout(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;
      const user = await User.findById(userId);

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const votes = await Vote.getByElection(electionId);
      const voters = await User.getAll(1, 10000, { role: 'voter' });

      const turnoutStats = {
        totalEligibleVoters: voters.users.length,
        totalVotesCast: votes.length,
        turnoutPercentage: voters.users.length > 0 ? ((votes.length / voters.users.length) * 100).toFixed(2) : 0,
        votedVoters: votes.length,
        notVotedVoters: voters.users.length - votes.length
      };

      res.json(turnoutStats);

      // Log action
      AdminService.logAction(userId, 'VIEW_TURNOUT', 'election', electionId, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Monitor suspicious activities
  static async getMonitoringAlerts(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const votes = await Vote.getByElection(electionId);

      // Check for suspicious patterns
      const alerts = [];

      // Check for multiple votes from same IP
      const ipVoteCounts = {};
      votes.forEach(vote => {
        if (vote.ip_address) {
          ipVoteCounts[vote.ip_address] = (ipVoteCounts[vote.ip_address] || 0) + 1;
        }
      });

      Object.entries(ipVoteCounts).forEach(([ip, count]) => {
        if (count > 1) {
          alerts.push({
            type: 'MULTIPLE_VOTES_SAME_IP',
            ip,
            count,
            severity: 'HIGH'
          });
        }
      });

      // Check for voting within suspicious timeframes
      const voteTimes = votes.map(v => new Date(v.voted_at).getTime());
      const suspiciousTimes = voteTimes.filter((time, index) => {
        if (index === 0) return false;
        return (time - voteTimes[index - 1]) < 1000; // Less than 1 second apart
      });

      if (suspiciousTimes.length > 0) {
        alerts.push({
          type: 'SUSPICIOUS_TIMING',
          count: suspiciousTimes.length,
          severity: 'MEDIUM'
        });
      }

      res.json({
        electionId,
        alerts,
        totalAlertsCount: alerts.length,
        checkedAt: new Date()
      });

      // Log action
      AdminService.logAction(userId, 'MONITOR_ALERTS', 'election', electionId, {}, req.ip);
    } catch (error) {
      next(error);
    }
  }

  // Export election data (CSV/PDF)
  static async exportElectionData(req, res, next) {
    try {
      const { electionId } = req.params;
      const { format = 'json' } = req.query;
      const userId = req.user.userId;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      const data = {
        election: {
          id: election.id,
          title: election.title,
          description: election.description,
          startDate: election.start_date,
          endDate: election.end_date,
          status: election.status
        },
        results: candidates.map(candidate => {
          const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
          return {
            candidateName: candidate.name,
            party: candidate.party_name,
            votes: candidateVotes.length,
            percentage: votes.length > 0 ? ((candidateVotes.length / votes.length) * 100).toFixed(2) : 0
          };
        }),
        summary: {
          totalVotes: votes.length,
          totalCandidates: candidates.length,
          exportedAt: new Date()
        }
      };

      if (format === 'csv') {
        const csv = convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="election-${electionId}.csv"`);
        res.send(csv);
      } else {
        res.json(data);
      }

      // Log action
      AdminService.logAction(userId, 'EXPORT_DATA', 'election', electionId, { format }, req.ip);
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to convert to CSV
function convertToCSV(data) {
  let csv = 'Election Report\n\n';
  csv += `Title,${data.election.title}\n`;
  csv += `Status,${data.election.status}\n`;
  csv += `Total Votes,${data.summary.totalVotes}\n\n`;
  csv += 'Candidate Name,Party,Votes,Percentage\n';
  
  data.results.forEach(result => {
    csv += `${result.candidateName},${result.party},${result.votes},${result.percentage}%\n`;
  });

  return csv;
}

module.exports = ElectionOfficerController;
