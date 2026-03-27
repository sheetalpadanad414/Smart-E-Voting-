const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Candidate {
  static async create(candidateData) {
    const {
      election_id,
      name,
      description,
      position,
      party_id,
      party_name,
      inst_role,
      organization
    } = candidateData;

    const connection = await pool.getConnection();
    try {
      const [elections] = await connection.query(
        'SELECT status FROM elections WHERE id = ?',
        [election_id]
      );

      if (elections.length === 0) {
        throw new Error('Election not found');
      }

      if (elections[0].status === 'completed') {
        throw new Error('Cannot add candidate to completed election');
      }

      const [existing] = await connection.query(
        'SELECT id FROM candidates WHERE election_id = ? AND name = ?',
        [election_id, name]
      );

      if (existing.length > 0) {
        throw new Error('Candidate with this name already exists in this election');
      }

      const id = generateUUID();

      const query = `
        INSERT INTO candidates (id, election_id, name, description, position, party_id, party_name, inst_role, organization)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await connection.query(query, [
        id,
        election_id,
        name,
        description,
        position || null,
        party_id || null,
        party_name || null,
        inst_role || null,
        organization || null
      ]);

      connection.release();
      return { id, name, party_id, inst_role, organization };
    } catch (error) {
      connection.release();
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
      SELECT 
        c.id, c.name, c.description, c.symbol, c.image_url, c.position, 
        c.party_name, c.party_id, c.vote_count, c.election_id, c.created_at,
        p.name as party_name_from_table, p.logo as party_logo,
        e.title as election_title, e.status as election_status
      FROM candidates c
      LEFT JOIN parties p ON c.party_id = p.id COLLATE utf8mb4_unicode_ci
      LEFT JOIN elections e ON c.election_id = e.id
      WHERE c.election_id = ? 
      ORDER BY c.created_at ASC 
      LIMIT ?, ?
    `;

    const connection = await pool.getConnection();
    try {
      const [candidates] = await connection.query(query, [electionId, (page - 1) * limit, limit]);

      // Get total count
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM candidates WHERE election_id = ?',
        [electionId]
      );
      connection.release();

      // Merge party name (prefer from parties table) and convert logo URL
      const Party = require('./Party');
      const processedCandidates = candidates.map(c => ({
        ...c,
        party_name: c.party_name_from_table || c.party_name,
        party_logo: Party.generateLogoUrl(c.party_logo)  // Convert filename to full URL
      }));

      return {
        candidates: processedCandidates,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      connection.release();
      console.error('Error in Candidate.getByElection:', error);
      throw error;
    }
  }

  static async getByParty(partyId, page = 1, limit = 50) {
    const query = `
      SELECT 
        c.id, c.name, c.description, c.symbol, c.image_url, c.position, 
        c.party_id, c.vote_count, c.election_id, c.created_at,
        e.title as election_title, e.status as election_status,
        p.name as party_name, p.logo as party_logo
      FROM candidates c
      LEFT JOIN elections e ON c.election_id = e.id
      LEFT JOIN parties p ON c.party_id COLLATE utf8mb4_unicode_ci = p.id
      WHERE c.party_id = ? 
      ORDER BY c.created_at DESC 
      LIMIT ?, ?
    `;

    const connection = await pool.getConnection();
    try {
      const [candidates] = await connection.query(query, [partyId, (page - 1) * limit, limit]);

      // Get total count
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as total FROM candidates WHERE party_id = ?',
        [partyId]
      );
      connection.release();

      // Return logo as-is from database (direct URL)
      const processedCandidates = candidates.map(c => ({
        ...c,
        party_logo: c.party_logo
      }));

      return {
        candidates: processedCandidates,
        total: countResult[0].total,
        pages: Math.ceil(countResult[0].total / limit)
      };
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  static async update(candidateId, updates) {
    const allowedFields = ['name', 'description', 'position', 'party_id', 'party_name', 'inst_role', 'organization'];
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
