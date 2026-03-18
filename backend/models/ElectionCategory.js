const { pool } = require('../config/database');

class ElectionCategory {
  /**
   * Get all election categories
   */
  static async getAll() {
    const query = `
      SELECT 
        ec.*,
        COUNT(DISTINCT et.id) as type_count,
        COUNT(DISTINCT e.id) as election_count
      FROM election_categories ec
      LEFT JOIN election_types et ON ec.id = et.category_id
      LEFT JOIN elections e ON ec.id = e.category_id
      GROUP BY ec.id
      ORDER BY ec.id ASC
    `;
    
    const connection = await pool.getConnection();
    const [categories] = await connection.query(query);
    connection.release();
    
    return categories;
  }

  /**
   * Get category by ID with types
   */
  static async findById(id) {
    const query = `
      SELECT * FROM election_categories WHERE id = ?
    `;
    
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [id]);
    
    if (rows.length === 0) {
      connection.release();
      return null;
    }
    
    const category = rows[0];
    
    // Get election types for this category
    const [types] = await connection.query(
      'SELECT * FROM election_types WHERE category_id = ? ORDER BY type_name ASC',
      [id]
    );
    
    category.types = types;
    
    connection.release();
    return category;
  }

  /**
   * Get elections by category
   */
  static async getElectionsByCategory(categoryId, page = 1, limit = 20, filters = {}) {
    let query = `
      SELECT 
        e.*,
        et.type_name,
        COUNT(DISTINCT c.id) as candidate_count,
        COUNT(DISTINCT c.party_id) as party_count
      FROM elections e
      LEFT JOIN election_types et ON e.type_id = et.id
      LEFT JOIN candidates c ON e.id = c.election_id
      WHERE e.category_id = ?
    `;
    const params = [categoryId];

    // Apply filters
    if (filters.status) {
      query += ' AND e.status = ?';
      params.push(filters.status);
    }
    if (filters.type_id) {
      query += ' AND e.type_id = ?';
      params.push(filters.type_id);
    }
    if (filters.start_date) {
      query += ' AND e.start_date >= ?';
      params.push(filters.start_date);
    }
    if (filters.end_date) {
      query += ' AND e.end_date <= ?';
      params.push(filters.end_date);
    }

    query += ' GROUP BY e.id ORDER BY e.created_at DESC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [elections] = await connection.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM elections WHERE category_id = ?';
    const countParams = [categoryId];
    
    if (filters.status) {
      countQuery += ' AND status = ?';
      countParams.push(filters.status);
    }
    if (filters.type_id) {
      countQuery += ' AND type_id = ?';
      countParams.push(filters.type_id);
    }

    const [countResult] = await connection.query(countQuery, countParams);
    connection.release();

    return {
      elections,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  /**
   * Get category statistics
   */
  static async getStatistics(categoryId) {
    const connection = await pool.getConnection();
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(DISTINCT e.id) as total_elections,
        COUNT(DISTINCT CASE WHEN e.status = 'active' THEN e.id END) as active_elections,
        COUNT(DISTINCT CASE WHEN e.status = 'completed' THEN e.id END) as completed_elections,
        COUNT(DISTINCT c.id) as total_candidates,
        COUNT(DISTINCT v.id) as total_votes
      FROM elections e
      LEFT JOIN candidates c ON e.id = c.election_id
      LEFT JOIN votes v ON e.id = v.election_id
      WHERE e.category_id = ?
    `, [categoryId]);
    
    connection.release();
    return stats[0];
  }
}

module.exports = ElectionCategory;
