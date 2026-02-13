const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class OTP {
  static async create(email, otp, purpose, expiresAt) {
    const id = generateUUID();

    const query = `
      INSERT INTO otps (id, email, otp, purpose, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `;

    const connection = await pool.getConnection();
    try {
      await connection.query(query, [id, email, otp, purpose, expiresAt]);
      connection.release();
      return { id };
    } catch (error) {
      connection.release();
      throw error;
    }
  }
  static async verify(email, otp, purpose = null) {
    let query = `
      SELECT id FROM otps 
      WHERE email = ? AND otp = ? AND expires_at > NOW() AND is_verified = false
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const params = [email, otp];
    if (purpose) {
      // include purpose in the where clause
      query = `
        SELECT id FROM otps 
        WHERE email = ? AND otp = ? AND purpose = ? AND expires_at > NOW() AND is_verified = false
        ORDER BY created_at DESC
        LIMIT 1
      `;
      params.push(purpose);
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    
    if (rows.length > 0) {
      // Mark as verified
      await connection.query(
        'UPDATE otps SET is_verified = true WHERE id = ?',
        [rows[0].id]
      );
      connection.release();
      return true;
    }
    
    connection.release();
    return false;
  }

  static async hasVerified(email, purpose = null) {
    let query = 'SELECT id FROM otps WHERE email = ? AND is_verified = true AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1';
    const params = [email];
    if (purpose) {
      query = 'SELECT id FROM otps WHERE email = ? AND purpose = ? AND is_verified = true AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1';
      params.push(purpose);
    }

    const connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    connection.release();
    return rows.length > 0;
  }

  static async deleteExpired() {
    const query = 'DELETE FROM otps WHERE expires_at < NOW()';
    const connection = await pool.getConnection();
    await connection.query(query);
    connection.release();
  }
}

module.exports = OTP;
