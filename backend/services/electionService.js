const schedule = require('node-schedule');
const Election = require('../models/Election');
const Vote = require('../models/Vote');
const { pool } = require('../config/database');

class ElectionService {
  static async checkAndStartElections() {
    try {
      const elections = await Election.getElectionsToStart();
      for (const election of elections) {
        await Election.updateStatus(election.id, 'active');
        console.log(`✓ Election started: ${election.title}`);
      }
    } catch (error) {
      console.error('Error starting elections:', error);
    }
  }

  static async checkAndEndElections() {
    try {
      const elections = await Election.getElectionsToEnd();
      for (const election of elections) {
        await Election.updateStatus(election.id, 'completed');
        await this.generateResultsCache(election.id);
        console.log(`✓ Election ended: ${election.title}`);
      }
    } catch (error) {
      console.error('Error ending elections:', error);
    }
  }

  static async generateResultsCache(electionId) {
    try {
      const results = await Vote.getElectionResults(electionId);
      const totalVotes = await Vote.getTotalVotes(electionId);

      // Get total voters count
      const connection = await pool.getConnection();
      const [userCount] = await connection.query('SELECT COUNT(*) as total FROM users WHERE role = "voter" AND is_verified = 1');
      connection.release();

      const cacheData = {
        id: require('../utils/auth').generateUUID(),
        election_id: electionId,
        total_voters: userCount[0].total,
        total_votes: totalVotes,
        results: JSON.stringify(results),
        last_updated: new Date()
      };

      const query = `
        INSERT INTO election_results_cache (id, election_id, total_voters, total_votes, results)
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        total_votes = VALUES(total_votes),
        results = VALUES(results),
        last_updated = CURRENT_TIMESTAMP
      `;

      const connection2 = await pool.getConnection();
      await connection2.query(query, [
        cacheData.id,
        cacheData.election_id,
        cacheData.total_voters,
        cacheData.total_votes,
        cacheData.results
      ]);
      connection2.release();
    } catch (error) {
      console.error('Error generating results cache:', error);
    }
  }

  static scheduleElectionChecks() {
    // Check every minute
    schedule.scheduleJob('* * * * *', async () => {
      await this.checkAndStartElections();
      await this.checkAndEndElections();
    });

    console.log('✓ Election scheduler started');
  }
}

module.exports = ElectionService;
