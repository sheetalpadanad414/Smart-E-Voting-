const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Election {
  static async create(electionData, createdBy) {
    const {
      title,
      description,
      start_date,
      end_date,
      is_public = true,
      country_id = null,
      state_id = null,
      election_type = null,
      election_subtype = null
    } = electionData;

    const id = generateUUID();

    const connection = await pool.getConnection();

    // Prevent duplicate titles (case-insensitive)
    const [existing] = await connection.query(
      'SELECT id FROM elections WHERE LOWER(title) = LOWER(?)',
      [title.trim()]
    );
    if (existing.length > 0) {
      connection.release();
      throw new Error(`An election with the title "${title}" already exists`);
    }

    const query = `
      INSERT INTO elections (id, title, description, start_date, end_date, is_public, country_id, state_id, election_type, election_subtype, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `;

    try {
      await connection.query(query, [
        id,
        title,
        description,
        start_date,
        end_date,
        is_public,
        country_id,
        state_id,
        election_type,
        election_subtype,
        createdBy
      ]);
      connection.release();
      return { id, title, status: 'draft', country_id, state_id, election_type, election_subtype };
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  static async findById(id) {
    console.log('=== Election.findById ===');
    console.log('Looking for election with ID:', id);
    console.log('ID type:', typeof id);
    console.log('ID length:', id?.length);
    
    const query = `
      SELECT e.*, u.name as created_by_name 
      FROM elections e 
      LEFT JOIN users u ON e.created_by = u.id 
      WHERE e.id = ?
    `;
    
    const connection = await pool.getConnection();
    try {
      console.log('Executing query:', query);
      console.log('With parameter:', [id]);
      
      const [rows] = await connection.query(query, [id]);
      
      console.log('Query returned', rows.length, 'rows');
      if (rows.length > 0) {
        console.log('Election found:', rows[0].title);
      } else {
        console.log('No election found with this ID');
      }
      
      connection.release();
      return rows.length > 0 ? rows[0] : null;
    } catch (error) {
      console.error('Error in Election.findById:', error);
      connection.release();
      throw error;
    }
  }

  static async getAll(page = 1, limit = 20, filters = {}) {
    let query = `
      SELECT id, title, description, start_date, end_date, status, is_public, country_id, state_id, election_type, election_subtype, scope, created_at 
      FROM elections WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.is_public === 'true' || filters.is_public === true) {
      query += ' AND is_public = 1';
    }
    if (filters.country_id) {
      query += ' AND (country_id = ? OR country_id IS NULL)';
      params.push(filters.country_id);
    }
    if (filters.state_id) {
      query += ' AND (state_id = ? OR state_id IS NULL)';
      params.push(filters.state_id);
    }
    if (filters.election_type) {
      query += ' AND election_type = ?';
      params.push(filters.election_type);
    }
    if (filters.election_subtype) {
      query += ' AND election_subtype = ?';
      params.push(filters.election_subtype);
    }

    query += ' ORDER BY created_at DESC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [elections] = await connection.query(query, params);

    // Get candidate count and unique party count for each election
    const electionsWithStats = await Promise.all(
      elections.map(async (election) => {
        const [candidateCount] = await connection.query(
          'SELECT COUNT(*) as total FROM candidates WHERE election_id = ?',
          [election.id]
        );
        
        const [partyCount] = await connection.query(
          'SELECT COUNT(DISTINCT party_id) as total FROM candidates WHERE election_id = ? AND party_id IS NOT NULL',
          [election.id]
        );

        return {
          ...election,
          candidate_count: candidateCount[0].total,
          party_count: partyCount[0].total
        };
      })
    );

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM elections WHERE 1=1';
    const countParams = [];
    if (filters.status) {
      countQuery += ' AND status = ?';
      countParams.push(filters.status);
    }
    if (filters.is_public === 'true' || filters.is_public === true) {
      countQuery += ' AND is_public = 1';
    }
    if (filters.country_id) {
      countQuery += ' AND (country_id = ? OR country_id IS NULL)';
      countParams.push(filters.country_id);
    }
    if (filters.state_id) {
      countQuery += ' AND (state_id = ? OR state_id IS NULL)';
      countParams.push(filters.state_id);
    }
    if (filters.election_type) {
      countQuery += ' AND election_type = ?';
      countParams.push(filters.election_type);
    }
    if (filters.election_subtype) {
      countQuery += ' AND election_subtype = ?';
      countParams.push(filters.election_subtype);
    }

    const [countResult] = await connection.query(countQuery, countParams);
    connection.release();

    return {
      elections: electionsWithStats,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async updateStatusBasedOnDate() {
    const connection = await pool.getConnection();
    
    try {
      // Update to active if start_date has passed and status is draft
      await connection.query(`
        UPDATE elections 
        SET status = 'active' 
        WHERE start_date <= NOW() 
        AND status = 'draft'
      `);

      // Update to completed if end_date has passed and status is active
      await connection.query(`
        UPDATE elections 
        SET status = 'completed' 
        WHERE end_date <= NOW() 
        AND status = 'active'
      `);

      connection.release();
      return true;
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  static async updateStatus(electionId, status) {
    const query = 'UPDATE elections SET status = ? WHERE id = ?';
    const connection = await pool.getConnection();
    await connection.query(query, [status, electionId]);
    connection.release();
  }

  static async update(electionId, updates) {
    const allowedFields = ['title', 'description', 'start_date', 'end_date', 'is_public', 'country_id', 'state_id', 'election_type', 'election_subtype'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return false;

    values.push(electionId);
    const query = `UPDATE elections SET ${updateFields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    await connection.query(query, values);
    connection.release();
    return true;
  }

  static async delete(electionId) {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM elections WHERE id = ?', [electionId]);
    connection.release();
    return true;
  }

  static async getActiveElections() {
    const query = `
      SELECT id, title, status FROM elections 
      WHERE NOW() BETWEEN start_date AND end_date 
      AND status != 'completed'
    `;
    const connection = await pool.getConnection();
    const [elections] = await connection.query(query);
    connection.release();
    return elections;
  }

  static async getElectionsToStart() {
    const query = `
      SELECT id, title FROM elections 
      WHERE start_date <= NOW() 
      AND status = 'draft'
    `;
    const connection = await pool.getConnection();
    const [elections] = await connection.query(query);
    connection.release();
    return elections;
  }

  static async getElectionsToEnd() {
    const query = `
      SELECT id, title FROM elections 
      WHERE end_date <= NOW() 
      AND status = 'active'
    `;
    const connection = await pool.getConnection();
    const [elections] = await connection.query(query);
    connection.release();
    return elections;
  }
}

module.exports = Election;
