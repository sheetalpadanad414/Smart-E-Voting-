const { pool } = require('../config/database');
const AuditLog = require('../models/AuditLog');

class AdminService {
  static async getUserStatistics() {
    const connection = await pool.getConnection();
    
    const [totalUsers] = await connection.query('SELECT COUNT(*) as total FROM users');
    const [adminUsers] = await connection.query('SELECT COUNT(*) as total FROM users WHERE role = "admin"');
    const [verifiedVoters] = await connection.query('SELECT COUNT(*) as total FROM users WHERE role = "voter" AND is_verified = 1');
    const [unverifiedVoters] = await connection.query('SELECT COUNT(*) as total FROM users WHERE role = "voter" AND is_verified = 0');

    connection.release();

    return {
      total_users: totalUsers[0].total,
      total_admins: adminUsers[0].total,
      verified_voters: verifiedVoters[0].total,
      unverified_voters: unverifiedVoters[0].total
    };
  }

  static async getElectionStatistics() {
    const connection = await pool.getConnection();
    
    const [draftElections] = await connection.query('SELECT COUNT(*) as total FROM elections WHERE status = "draft"');
    const [activeElections] = await connection.query('SELECT COUNT(*) as total FROM elections WHERE status = "active"');
    const [completedElections] = await connection.query('SELECT COUNT(*) as total FROM elections WHERE status = "completed"');

    connection.release();

    return {
      draft: draftElections[0].total,
      active: activeElections[0].total,
      completed: completedElections[0].total
    };
  }

  static async getDashboardStats(userId) {
    const users = await this.getUserStatistics();
    const elections = await this.getElectionStatistics();

    const connection = await pool.getConnection();
    const [recentLogs] = await connection.query(`
      SELECT al.*, u.name as user_name 
      FROM audit_logs al 
      LEFT JOIN users u ON al.user_id = u.id 
      ORDER BY al.created_at DESC 
      LIMIT 10
    `);
    connection.release();

    return {
      users,
      elections,
      recent_activities: recentLogs
    };
  }

  static async logAction(userId, action, entityType, entityId, changes, ipAddress) {
    return await AuditLog.create(userId, action, entityType, entityId, changes, ipAddress);
  }

  static async getAuditLogs(filters, page = 1, limit = 50) {
    return await AuditLog.getLog(filters, page, limit);
  }
}

module.exports = AdminService;
