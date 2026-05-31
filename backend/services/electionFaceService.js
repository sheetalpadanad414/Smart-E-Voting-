const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

/**
 * Service for managing election-specific face data
 * Face data is registered per election and auto-deleted when election ends
 */
class ElectionFaceService {
  
  /**
   * Register face for a specific election
   */
  static async registerFaceForElection(userId, electionId, descriptor, imagePath = null) {
    const connection = await pool.getConnection();
    
    try {
      // Get election details
      const [elections] = await connection.query(
        'SELECT election_type, election_subtype, status FROM elections WHERE id = ?',
        [electionId]
      );

      if (!elections.length) {
        throw new Error('Election not found');
      }

      const election = elections[0];

      if (election.status !== 'active') {
        throw new Error('Can only register face for active elections');
      }

      // Check if already registered for this election
      const [existing] = await connection.query(
        'SELECT id FROM election_face_data WHERE user_id = ? AND election_id = ?',
        [userId, electionId]
      );

      if (existing.length > 0) {
        throw new Error('Face already registered for this election');
      }

      // Insert face data
      const id = generateUUID();
      await connection.query(
        `INSERT INTO election_face_data 
         (id, user_id, election_id, election_type, election_subtype, face_descriptor, face_image_path)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, userId, electionId, election.election_type, election.election_subtype, JSON.stringify(descriptor), imagePath]
      );

      // Log registration
      await connection.query(
        `INSERT INTO face_verification_logs 
         (user_id, election_id, election_type, verification_type, verified) 
         VALUES (?, ?, ?, 'registration', TRUE)`,
        [userId, electionId, election.election_type]
      );

      return {
        success: true,
        id,
        electionType: election.election_type,
        electionSubtype: election.election_subtype
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Check if user has registered face for specific election
   */
  static async hasFaceForElection(userId, electionId) {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔍 hasFaceForElection query:');
      console.log('   User ID:', userId);
      console.log('   Election ID:', electionId);
      
      const [rows] = await connection.query(
        'SELECT id FROM election_face_data WHERE user_id = ? AND election_id = ?',
        [userId, electionId]
      );
      
      console.log('   Query result rows:', rows.length);
      if (rows.length > 0) {
        console.log('   Found existing registration:', rows[0].id);
      }
      
      return rows.length > 0;
    } finally {
      connection.release();
    }
  }

  /**
   * Get face descriptor for user in specific election
   */
  static async getFaceForElection(userId, electionId) {
    const connection = await pool.getConnection();
    
    try {
      const [rows] = await connection.query(
        `SELECT face_descriptor, election_type, election_subtype, registered_at 
         FROM election_face_data 
         WHERE user_id = ? AND election_id = ?`,
        [userId, electionId]
      );

      if (!rows.length) {
        return null;
      }

      return {
        descriptor: JSON.parse(rows[0].face_descriptor),
        electionType: rows[0].election_type,
        electionSubtype: rows[0].election_subtype,
        registeredAt: rows[0].registered_at
      };
    } finally {
      connection.release();
    }
  }

  /**
   * Update verification stats
   */
  static async recordVerification(userId, electionId, verified, similarity) {
    const connection = await pool.getConnection();
    
    try {
      // Update verification count
      await connection.query(
        `UPDATE election_face_data 
         SET last_verified_at = NOW(), 
             verification_count = verification_count + 1
         WHERE user_id = ? AND election_id = ?`,
        [userId, electionId]
      );

      // Get election type
      const [elections] = await connection.query(
        'SELECT election_type FROM elections WHERE id = ?',
        [electionId]
      );

      const electionType = elections.length > 0 ? elections[0].election_type : null;

      // Log verification
      await connection.query(
        `INSERT INTO face_verification_logs 
         (user_id, election_id, election_type, verification_type, similarity_score, verified) 
         VALUES (?, ?, ?, 'voting', ?, ?)`,
        [userId, electionId, electionType, similarity, verified]
      );

    } finally {
      connection.release();
    }
  }

  /**
   * Get all active elections user needs to register face for
   */
  static async getElectionsNeedingFaceRegistration(userId) {
    const connection = await pool.getConnection();
    
    try {
      const [elections] = await connection.query(
        `SELECT e.id, e.title, e.election_type, e.election_subtype, e.start_date, e.end_date,
                CASE WHEN efd.id IS NULL THEN FALSE ELSE TRUE END as face_registered
         FROM elections e
         LEFT JOIN election_face_data efd ON e.id = efd.election_id AND efd.user_id = ?
         WHERE e.status = 'active'
         AND NOW() BETWEEN e.start_date AND e.end_date
         ORDER BY e.start_date ASC`,
        [userId]
      );

      return elections;
    } finally {
      connection.release();
    }
  }

  /**
   * Clean up face data for completed/inactive elections
   */
  static async cleanupInactiveElectionFaceData() {
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get elections that have ended
      const [endedElections] = await connection.query(
        `SELECT e.id, e.title, e.election_type, e.status
         FROM elections e
         WHERE e.status IN ('completed', 'draft')
         OR e.end_date < NOW()`
      );

      let totalDeleted = 0;

      for (const election of endedElections) {
        // Count records to delete
        const [countResult] = await connection.query(
          'SELECT COUNT(*) as count FROM election_face_data WHERE election_id = ?',
          [election.id]
        );

        const recordCount = countResult[0].count;

        if (recordCount > 0) {
          // Delete face data
          await connection.query(
            'DELETE FROM election_face_data WHERE election_id = ?',
            [election.id]
          );

          // Log cleanup
          const logId = generateUUID();
          await connection.query(
            `INSERT INTO face_data_cleanup_logs 
             (id, election_id, election_type, election_title, records_deleted, cleanup_reason)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [logId, election.id, election.election_type, election.title, recordCount, 
             election.status === 'completed' ? 'Election completed' : 'Election inactive']
          );

          totalDeleted += recordCount;
          console.log(`✓ Cleaned up ${recordCount} face records for election: ${election.title}`);
        }
      }

      await connection.commit();

      return {
        success: true,
        electionsProcessed: endedElections.length,
        recordsDeleted: totalDeleted
      };

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  /**
   * Clean up face data for specific election
   */
  static async cleanupElectionFaceData(electionId) {
    const connection = await pool.getConnection();
    
    try {
      // Get election details
      const [elections] = await connection.query(
        'SELECT title, election_type, status FROM elections WHERE id = ?',
        [electionId]
      );

      if (!elections.length) {
        throw new Error('Election not found');
      }

      const election = elections[0];

      // Count records
      const [countResult] = await connection.query(
        'SELECT COUNT(*) as count FROM election_face_data WHERE election_id = ?',
        [electionId]
      );

      const recordCount = countResult[0].count;

      if (recordCount > 0) {
        // Delete face data
        await connection.query(
          'DELETE FROM election_face_data WHERE election_id = ?',
          [electionId]
        );

        // Log cleanup
        const logId = generateUUID();
        await connection.query(
          `INSERT INTO face_data_cleanup_logs 
           (id, election_id, election_type, election_title, records_deleted, cleanup_reason)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [logId, electionId, election.election_type, election.title, recordCount, 'Manual cleanup']
        );

        console.log(`✓ Cleaned up ${recordCount} face records for election: ${election.title}`);
      }

      return {
        success: true,
        recordsDeleted: recordCount
      };

    } finally {
      connection.release();
    }
  }

  /**
   * Get face registration statistics
   */
  static async getFaceRegistrationStats() {
    const connection = await pool.getConnection();
    
    try {
      // Total active elections
      const [activeElections] = await connection.query(
        `SELECT COUNT(*) as count FROM elections 
         WHERE status = 'active' AND NOW() BETWEEN start_date AND end_date`
      );

      // Total face registrations
      const [totalRegistrations] = await connection.query(
        'SELECT COUNT(*) as count FROM election_face_data'
      );

      // Registrations by election type
      const [byType] = await connection.query(
        `SELECT election_type, COUNT(*) as count 
         FROM election_face_data 
         GROUP BY election_type`
      );

      // Recent cleanup logs
      const [recentCleanups] = await connection.query(
        `SELECT * FROM face_data_cleanup_logs 
         ORDER BY cleaned_at DESC 
         LIMIT 10`
      );

      return {
        activeElections: activeElections[0].count,
        totalRegistrations: totalRegistrations[0].count,
        byElectionType: byType,
        recentCleanups
      };

    } finally {
      connection.release();
    }
  }
}

module.exports = ElectionFaceService;
