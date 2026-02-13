const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class Election {
  static async create(electionData, createdBy) {
    const {
      title,
      description,
      start_date,
      end_date,
      is_public = true
    } = electionData;

    const id = generateUUID();

    const query = `
      INSERT INTO elections (id, title, description, start_date, end_date, is_public, created_by, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'draft')
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [
        id,
        title,
        description,
        start_date,
        end_date,
        is_public,
        createdBy
      ]);
      connection.release();
      return { id, title, status: 'draft' };
    } catch (error) {
      connection.release();
      throw error;
    }
  }

  static async findById(id) {
    const query = `
      SELECT e.*, u.name as created_by_name 
      FROM elections e 
      LEFT JOIN users u ON e.created_by = u.id 
      WHERE e.id = ?
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [id]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  }

  static async getAll(page = 1, limit = 20, filters = {}) {
    let query = `
      SELECT id, title, description, start_date, end_date, status, is_public, created_at 
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

    query += ' ORDER BY created_at DESC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [elections] = await connection.query(query, params);

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

    const [countResult] = await connection.query(countQuery, countParams);
    connection.release();

    return {
      elections,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async updateStatus(electionId, status) {
    const query = 'UPDATE elections SET status = ? WHERE id = ?';
    const connection = await pool.getConnection();
    await connection.query(query, [status, electionId]);
    connection.release();
  }

  static async update(electionId, updates) {
    const allowedFields = ['title', 'description', 'start_date', 'end_date', 'is_public'];
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
