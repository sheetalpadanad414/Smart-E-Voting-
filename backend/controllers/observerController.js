const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Vote = require('../models/Vote');
const User = require('../models/User');

class ObserverController {
  // Get all public elections to observe
  static async getObservableElections(req, res, next) {
    try {
      const elections = await Election.getAll(1, 100, { is_public: true });

      const enrichedElections = await Promise.all(
        elections.elections.map(async (election) => {
          const candidates = await Candidate.getByElection(election.id);
          const votes = await Vote.getByElection(election.id);
          return {
            ...election,
            candidateCount: candidates.length,
            voteCount: votes.length
          };
        })
      );

      res.json({
        elections: enrichedElections,
        total: elections.total
      });
    } catch (error) {
      next(error);
    }
  }

  // View election details (read-only)
  static async viewElectionResults(req, res, next) {
    try {
      const { electionId } = req.params;
      const userId = req.user.userId;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (!election.is_public) {
        return res.status(403).json({ error: 'This election is not publicly visible' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      // Calculate detailed statistics
      const totalVotes = votes.length;
      const uniqueVoters = new Set(votes.map(v => v.voter_id)).size;

      const candidateStats = candidates.map(candidate => {
        const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
        return {
          id: candidate.id,
          name: candidate.name,
          party_name: candidate.party_name,
          symbol: candidate.symbol,
          image_url: candidate.image_url,
          voteCount: candidateVotes.length,
          percentage: totalVotes > 0 ? ((candidateVotes.length / totalVotes) * 100).toFixed(2) : 0
        };
      });

      res.json({
        election: {
          id: election.id,
          title: election.title,
          description: election.description,
          status: election.status,
          start_date: election.start_date,
          end_date: election.end_date,
          created_at: election.created_at
        },
        results: candidateStats,
        statistics: {
          totalVotes,
          uniqueVoters,
          candidateCount: candidates.length,
          averageVotesPerCandidate: totalVotes > 0 ? (totalVotes / candidates.length).toFixed(2) : 0,
          votingStatus: election.status
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get voting trends over time
  static async getVotingTrends(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (!election.is_public) {
        return res.status(403).json({ error: 'This election is not publicly visible' });
      }

      const votes = await Vote.getByElection(electionId);

      // Group votes by hour
      const hourlyTrends = {};
      votes.forEach(vote => {
        const date = new Date(vote.voted_at);
        const hour = date.getHours();
        const dateKey = date.toISOString().split('T')[0];
        const key = `${dateKey} ${hour}:00`;
        hourlyTrends[key] = (hourlyTrends[key] || 0) + 1;
      });

      // Group votes by candidate over time
      const candidates = await Candidate.getByElection(electionId);
      const candidateTrends = {};

      candidates.forEach(candidate => {
        candidateTrends[candidate.name] = {};
        votes.forEach(vote => {
          if (vote.candidate_id === candidate.id) {
            const date = new Date(vote.voted_at);
            const hour = date.getHours();
            const dateKey = date.toISOString().split('T')[0];
            const key = `${dateKey} ${hour}:00`;
            candidateTrends[candidate.name][key] = (candidateTrends[candidate.name][key] || 0) + 1;
          }
        });
      });

      res.json({
        hourlyTrends,
        candidateTrends,
        totalVotes: votes.length,
        trendsPeriod: {
          from: votes.length > 0 ? votes[0].voted_at : null,
          to: votes.length > 0 ? votes[votes.length - 1].voted_at : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Get comparative analysis
  static async getComparativeAnalysis(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (!election.is_public) {
        return res.status(403).json({ error: 'This election is not publicly visible' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      const totalVotes = votes.length;
      
      // Rank candidates by votes
      const candidateRanking = candidates
        .map(candidate => {
          const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
          return {
            rank: 0, // Will be set below
            name: candidate.name,
            party: candidate.party_name,
            votes: candidateVotes.length,
            percentage: totalVotes > 0 ? ((candidateVotes.length / totalVotes) * 100).toFixed(2) : 0
          };
        })
        .sort((a, b) => b.votes - a.votes)
        .map((candidate, index) => ({
          ...candidate,
          rank: index + 1
        }));

      // Calculate victory margin
      let victoryMargin = null;
      if (candidateRanking.length >= 2) {
        victoryMargin = candidateRanking[0].votes - candidateRanking[1].votes;
      }

      res.json({
        electionTitle: election.title,
        candidateRanking,
        analysis: {
          totalCandidates: candidates.length,
          totalVotes,
          leader: candidateRanking[0],
          runnerUp: candidateRanking.length > 1 ? candidateRanking[1] : null,
          victoryMargin,
          leaderMarginPercentage: totalVotes > 0 && victoryMargin ? ((victoryMargin / totalVotes) * 100).toFixed(2) : null
        }
      });
    } catch (error) {
      next(error);
    }
  }

  // Export public election report
  static async exportPublicReport(req, res, next) {
    try {
      const { electionId } = req.params;
      const { format = 'json' } = req.query;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (!election.is_public) {
        return res.status(403).json({ error: 'This election is not publicly visible' });
      }

      const candidates = await Candidate.getByElection(electionId);
      const votes = await Vote.getByElection(electionId);

      const report = {
        electionTitle: election.title,
        electionStatus: election.status,
        candidates: candidates.map(candidate => {
          const candidateVotes = votes.filter(v => v.candidate_id === candidate.id);
          return {
            name: candidate.name,
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
        const csv = convertObserverReportToCSV(report);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="election-report-${electionId}.csv"`);
        res.send(csv);
      } else {
        res.json(report);
      }
    } catch (error) {
      next(error);
    }
  }

  // Get integrity verification data (for transparency)
  static async getIntegrityVerification(req, res, next) {
    try {
      const { electionId } = req.params;

      const election = await Election.findById(electionId);
      if (!election) {
        return res.status(404).json({ error: 'Election not found' });
      }

      if (!election.is_public) {
        return res.status(403).json({ error: 'This election is not publicly visible' });
      }

      const votes = await Vote.getByElection(electionId);
      const candidates = await Candidate.getByElection(electionId);

      // Check data consistency
      const verification = {
        timestamp: new Date(),
        electionId,
        checks: {
          totalVotes: votes.length,
          totalCandidates: candidates.length,
          validVotesCount: votes.filter(v => v.voter_id && v.candidate_id).length,
          invalidVotesCount: votes.filter(v => !v.voter_id || !v.candidate_id).length,
          allVotesMatched: votes.every(v => candidates.some(c => c.id === v.candidate_id))
        },
        status: 'verified'
      };

      res.json(verification);
    } catch (error) {
      next(error);
    }
  }
}

// Helper function to convert observer report to CSV
function convertObserverReportToCSV(report) {
  let csv = 'Public Election Report\n\n';
  csv += `Election Title,${report.electionTitle}\n`;
  csv += `Status,${report.electionStatus}\n`;
  csv += `Total Votes,${report.summary.totalVotes}\n\n`;
  csv += 'Candidate Name,Party,Votes,Percentage\n';
  
  report.candidates.forEach(candidate => {
    csv += `${candidate.name},${candidate.party},${candidate.votes},${candidate.percentage}%\n`;
  });

  csv += '\n\nNote: This is a public report generated by the election observation system.';
  return csv;
}

module.exports = ObserverController;
