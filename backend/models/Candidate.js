const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Candidate {
  static async create(candidateData) {
    const {
      election_id,
      name,
      description,
      symbol,
      image_url,
      position,
      party_name
    } = candidateData;

    const id = generateUUID();

    const query = `
      INSERT INTO candidates (id, election_id, name, description, symbol, image_url, position, party_name)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [
        id,
        election_id,
        name,
        description,
        symbol,
        image_url,
        position,
        party_name
      ]);
      connection.release();
      return { id, name };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Candidate already exists in this election');
      }
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM candidates WHERE id = ?';
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [id]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  }

  static async getByElection(electionId, page = 1, limit = 50) {
    const query = `
      SELECT id, name, description, symbol, image_url, position, party_name, vote_count, created_at
      FROM candidates 
      WHERE election_id = ? 
      ORDER BY created_at ASC 
      LIMIT ?, ?
    `;

    const connection = await pool.getConnection();
    const [candidates] = await connection.query(query, [electionId, (page - 1) * limit, limit]);

    // Get total count
    const [countResult] = await connection.query(
      'SELECT COUNT(*) as total FROM candidates WHERE election_id = ?',
      [electionId]
    );
    connection.release();

    return {
      candidates,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async update(candidateId, updates) {
    const allowedFields = ['name', 'description', 'symbol', 'image_url', 'position', 'party_name'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return false;

    values.push(candidateId);
    const query = `UPDATE candidates SET ${updateFields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    await connection.query(query, values);
    connection.release();
    return true;
  }

  static async delete(candidateId) {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM candidates WHERE id = ?', [candidateId]);
    connection.release();
    return true;
  }

  static async incrementVoteCount(candidateId) {
    const query = 'UPDATE candidates SET vote_count = vote_count + 1 WHERE id = ?';
    const connection = await pool.getConnection();
    await connection.query(query, [candidateId]);
    connection.release();
  }
}

module.exports = Candidate;
