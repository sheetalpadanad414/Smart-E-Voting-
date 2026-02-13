const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Vote {
  static async create(voteData) {
    const {
      election_id,
      voter_id,
      candidate_id,
      ip_address,
      device_info
    } = voteData;

    const id = generateUUID();

    const query = `
      INSERT INTO votes (id, election_id, voter_id, candidate_id, ip_address, device_info)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [
        id,
        election_id,
        voter_id,
        candidate_id,
        ip_address,
        device_info
      ]);
      connection.release();
      return { id };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Voter has already voted in this election');
      }
      throw error;
    }
  }

  static async hasVoted(electionId, voterId) {
    const query = `
      SELECT id FROM votes 
      WHERE election_id = ? AND voter_id = ?
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [electionId, voterId]);
    connection.release();
    return rows.length > 0;
  }

  static async getElectionResults(electionId) {
    const query = `
      SELECT 
        c.id,
        c.name,
        c.symbol,
        c.position,
        c.party_name,
        COUNT(v.id) as vote_count
      FROM candidates c
      LEFT JOIN votes v ON c.id = v.candidate_id AND v.election_id = c.election_id
      WHERE c.election_id = ?
      GROUP BY c.id
      ORDER BY vote_count DESC
    `;

    const connection = await pool.getConnection();
    const [results] = await connection.query(query, [electionId]);
    connection.release();

    return results;
  }

  static async getTotalVotes(electionId) {
    const query = `
      SELECT COUNT(*) as total FROM votes WHERE election_id = ?
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [electionId]);
    connection.release();
    return rows[0].total;
  }

  static async getVoterCount(electionId) {
    const query = `
      SELECT COUNT(DISTINCT voter_id) as total FROM votes WHERE election_id = ?
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [electionId]);
    connection.release();
    return rows[0].total;
  }

  static async getByElection(electionId) {
    const query = `
      SELECT v.*, c.name as candidate_name, u.name as voter_name
      FROM votes v
      LEFT JOIN candidates c ON v.candidate_id = c.id
      LEFT JOIN users u ON v.voter_id = u.id
      WHERE v.election_id = ?
      ORDER BY v.voted_at DESC
    `;
    const connection = await pool.getConnection();
    const [votes] = await connection.query(query, [electionId]);
    connection.release();
    return votes;
  }
}

module.exports = Vote;
