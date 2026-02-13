const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

class AuditLog {
  static async create(userId, action, entityType, entityId, changes = null, ipAddress = null) {
    const id = generateUUID();
    const query = `
      INSERT INTO audit_logs (id, user_id, action, entity_type, entity_id, changes, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    try {
      const connection = await pool.getConnection();
      await connection.query(query, [
        id,
        userId,
        action,
        entityType,
        entityId,
        changes ? JSON.stringify(changes) : null,
        ipAddress
      ]);
      connection.release();
      return { id, success: true };
    } catch (error) {
      console.error('Audit log error:', error);
      return { success: false };
    }
  }

  static async getLog(filters, page = 1, limit = 50) {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (filters.userId) {
      query += ' AND user_id = ?';
      params.push(filters.userId);
    }
    if (filters.action) {
      query += ' AND action = ?';
      params.push(filters.action);
    }
    if (filters.entityType) {
      query += ' AND entity_type = ?';
      params.push(filters.entityType);
    }

    query += ' ORDER BY created_at DESC LIMIT ?, ?';
    params.push((page - 1) * limit, limit);

    const connection = await pool.getConnection();
    const [logs] = await connection.query(query, params);
    connection.release();

    return logs;
  }
}

module.exports = AuditLog;
