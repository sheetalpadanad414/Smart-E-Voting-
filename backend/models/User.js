const { pool } = require('../config/database');
const { hashPassword, generateUUID } = require('../utils/auth');

class User {
  static async create(userData) {
    const {
      name,
      email,
      password,
      phone,
      role = 'voter',
      department = null,
      designation = null,
      assignment_area = null
    } = userData;

    const id = generateUUID();
    const hashedPassword = await hashPassword(password);

    const query = `
      INSERT INTO users (id, name, email, password, phone, role, department, designation, assignment_area)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [id, name, email, hashedPassword, phone, role, department, designation, assignment_area]);
      connection.release();
      return { id, email, name, role };
    } catch (error) {
      connection.release();
      if (error.code === 'ER_DUP_ENTRY') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [email]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  }

  static async findById(id) {
    const query = 'SELECT id, name, email, phone, role, is_verified, voter_id, department, designation, assignment_area, last_login FROM users WHERE id = ?';
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [id]);
    connection.release();
    return rows.length > 0 ? rows[0] : null;
  }

  static async updateVerification(userId) {
    const query = `
      UPDATE users SET is_verified = true, verified_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    const connection = await pool.getConnection();
    await connection.query(query, [userId]);
    connection.release();
  }

  static async updateOTP(email, otp, expiresAt) {
    const query = `UPDATE users SET otp = ?, otp_expires_at = ? WHERE email = ?`;
    const connection = await pool.getConnection();
    await connection.query(query, [otp, expiresAt, email]);
    connection.release();
  }

  static async verifyOTP(email, otp) {
    const query = `
      SELECT id FROM users 
      WHERE email = ? AND otp = ? AND otp_expires_at > NOW()
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [email, otp]);
    connection.release();
    return rows.length > 0;
  }

  static async updateLastLogin(userId) {
    const query = `UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?`;
    const connection = await pool.getConnection();
    await connection.query(query, [userId]);
    connection.release();
  }

  static async recordFailedLogin(email) {
    const query = `
      UPDATE users 
      SET failed_login_attempts = failed_login_attempts + 1
      WHERE email = ?
    `;
    const connection = await pool.getConnection();
    await connection.query(query, [email]);
    connection.release();
  }

  static async lockAccount(email) {
    const lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
    const query = `UPDATE users SET locked_until = ? WHERE email = ?`;
    const connection = await pool.getConnection();
    await connection.query(query, [lockUntil, email]);
    connection.release();
  }

  static async isAccountLocked(email) {
    const query = `
      SELECT locked_until FROM users WHERE email = ? AND locked_until > NOW()
    `;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, [email]);
    connection.release();
    return rows.length > 0;
  }

  static async resetFailedAttempts(email) {
    const query = `
      UPDATE users 
      SET failed_login_attempts = 0, locked_until = NULL
      WHERE email = ?
    `;
    const connection = await pool.getConnection();
    await connection.query(query, [email]);
    connection.release();
  }

  static async getAll(page = 1, limit = 20, filters = {}) {
    let query = 'SELECT id, name, email, phone, role, is_verified, voter_id, department, designation, assignment_area, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (filters.role) {
      query += ' AND role = ?';
      params.push(filters.role);
    }
    if (filters.is_verified !== undefined) {
      query += ' AND is_verified = ?';
      params.push(filters.is_verified);
    }

    query += ' ORDER BY created_at DESC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [users] = await connection.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    if (filters.role) {
      countQuery += ' AND role = ?';
      countParams.push(filters.role);
    }
    if (filters.is_verified !== undefined) {
      countQuery += ' AND is_verified = ?';
      countParams.push(filters.is_verified);
    }

    const [countResult] = await connection.query(countQuery, countParams);
    connection.release();

    return {
      users,
      total: countResult[0].total,
      pages: Math.ceil(countResult[0].total / limit)
    };
  }

  static async updateUser(userId, updates) {
    const allowedFields = ['name', 'phone', 'voter_id', 'department', 'designation', 'assignment_area'];
    const updateFields = [];
    const values = [];

    for (const [key, value] of Object.entries(updates)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updateFields.length === 0) return false;

    values.push(userId);
    const query = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

    const connection = await pool.getConnection();
    await connection.query(query, values);
    connection.release();
    return true;
  }

  static async deleteUser(userId) {
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);
    connection.release();
    return true;
  }
}

module.exports = User;
