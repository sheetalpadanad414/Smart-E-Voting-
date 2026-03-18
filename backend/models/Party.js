const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Party {
  /**
   * Generate full logo URL from filename
   * @param {string} filename - Logo filename (e.g., 'aap.png')
   * @returns {string|null} - Full URL or null
   */
  static generateLogoUrl(filename) {
    if (!filename) return null;
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    return `${baseUrl}/uploads/${filename}`;
  }
  static async create(partyData) {
    const { name, logo, description } = partyData;
    const id = generateUUID();

    const query = `
      INSERT INTO parties (id, name, logo, description)
      VALUES (?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [id, name, logo || null, description || null]);
      connection.release();
      return { id, name, logo, description };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Party with this name already exists');
      }
      throw error;
    }
  }

  static async findById(id) {
    const query = 'SELECT * FROM parties WHERE id = ?';
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [id]);
    connection.release();
    
    if (rows.length > 0) {
      const party = rows[0];
      // Convert filename to full URL
      party.logo = this.generateLogoUrl(party.logo);
      return party;
    }
    
    return null;
  }

  static async findByName(name) {
    const query = 'SELECT * FROM parties WHERE name = ?';
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [name]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  }

  static async getAll(page = 1, limit = 50, search = '') {
    let query = `
      SELECT p.*, 
        (SELECT COUNT(*) FROM candidates WHERE party_id COLLATE utf8mb4_unicode_ci = p.id) as candidate_count
      FROM parties p
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      query += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }

    query += ' ORDER BY p.name ASC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [parties] = await connection.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM parties WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND name LIKE ?';
      countParams.push(`%${search}%`);
    }

    const [countResult] = await connection.query(countQuery, countParams);
    connection.release();

    // Convert filenames to full URLs
    const partiesWithUrls = parties.map(party => ({
      ...party,
      logo: this.generateLogoUrl(party.logo)
    }));

    return {
      parties: partiesWithUrls,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async update(partyId, updates) {
    const allowedFields = ['name', 'logo', 'description'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return false;

    values.push(partyId);
    const query = `UPDATE parties SET ${updateFields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, values);
      connection.release();
      return true;
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Party with this name already exists');
      }
      throw error;
    }
  }

  static async delete(partyId) {
    const connection = await pool.getConnection();
    
    try {
      // Check if party has candidates
      const [candidates] = await connection.query(
        'SELECT COUNT(*) as count FROM candidates WHERE party_id COLLATE utf8mb4_unicode_ci = ?',
        [partyId]
      );

      if (candidates[0].count > 0) {
        connection.release();
        throw new Error(`Cannot delete party with ${candidates[0].count} associated candidates`);
      }

      await connection.query('DELETE FROM parties WHERE id = ?', [partyId]);
      connection.release();
      return true;
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  static async getAllSimple() {
    const query = 'SELECT id, name, logo FROM parties ORDER BY name ASC';
    const connection = await pool.getConnection();
    const [parties] = await connection.query(query);
    connection.release();
    
    // Convert filenames to full URLs
    return parties.map(party => ({
      ...party,
      logo: this.generateLogoUrl(party.logo)
    }));
  }
}

module.exports = Party;
