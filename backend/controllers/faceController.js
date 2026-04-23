const { pool } = require('../config/database');

class FaceController {
  /**
   * Store face descriptor (sent from frontend)
   */
  static async storeFaceDescriptor(req, res) {
    try {
      console.log('📥 storeFaceDescriptor called');
      console.log('   User ID:', req.user?.userId);
      console.log('   Request body keys:', Object.keys(req.body));
      
      const userId = req.user.userId;
      const { descriptor } = req.body;

      console.log('   Descriptor type:', typeof descriptor);
      console.log('   Descriptor is array:', Array.isArray(descriptor));
      console.log('   Descriptor length:', descriptor?.length);

      if (!descriptor || !Array.isArray(descriptor)) {
        console.error('❌ Invalid descriptor:', { descriptor: typeof descriptor, isArray: Array.isArray(descriptor) });
        return res.status(400).json({
          success: false,
          message: 'Invalid face descriptor'
        });
      }

      const connection = await pool.getConnection();
      try {
        console.log('💾 Updating users table...');
        const [updateResult] = await connection.query(
          `UPDATE users 
           SET face_descriptor = ?, 
               face_verified = TRUE,
               face_registered_at = NOW()
           WHERE id = ?`,
          [JSON.stringify(descriptor), userId]
        );
        
        console.log('   Update result:', updateResult);
        console.log('   Rows affected:', updateResult.affectedRows);

        if (updateResult.affectedRows === 0) {
          console.error('❌ No rows updated! User ID might not exist:', userId);
        } else {
          console.log('✅ User face data updated successfully');
        }

        // Log registration
        console.log('📝 Inserting verification log...');
        const [logResult] = await connection.query(
          `INSERT INTO face_verification_logs 
           (user_id, verification_type, verified) 
           VALUES (?, 'registration', TRUE)`,
          [userId]
        );
        
        console.log('   Log insert result:', logResult);
        console.log('   Log ID:', logResult.insertId);
        console.log('✅ Verification log created');

        res.json({
          success: true,
          message: 'Face registered successfully',
          data: {
            userId,
            affectedRows: updateResult.affectedRows,
            logId: logResult.insertId
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('❌ Store face descriptor error:', error);
      console.error('   Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: 'Failed to store face descriptor',
        error: error.message
      });
    }
  }

  /**
   * Get stored face descriptor
   */
  static async getFaceDescriptor(req, res) {
    try {
      const userId = req.user.userId;

      const connection = await pool.getConnection();
      try {
        const [users] = await connection.query(
          'SELECT face_descriptor, face_verified FROM users WHERE id = ?',
          [userId]
        );

        if (!users.length || !users[0].face_descriptor) {
          return res.status(404).json({
            success: false,
            message: 'No face registered'
          });
        }

        res.json({
          success: true,
          data: {
            descriptor: JSON.parse(users[0].face_descriptor),
            verified: users[0].face_verified
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get face descriptor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get face descriptor'
      });
    }
  }

  /**
   * Log verification attempt
   */
  static async logVerification(req, res) {
    try {
      const userId = req.user.userId;
      const { verified, similarity } = req.body;

      const connection = await pool.getConnection();
      try {
        await connection.query(
          `INSERT INTO face_verification_logs 
           (user_id, verification_type, similarity_score, verified) 
           VALUES (?, 'voting', ?, ?)`,
          [userId, similarity, verified]
        );

        res.json({ success: true });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Log verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log verification'
      });
    }
  }

  /**
   * Check face registration status
   */
  static async getFaceStatus(req, res) {
    try {
      const userId = req.user.userId;

      const connection = await pool.getConnection();
      try {
        const [users] = await connection.query(
          'SELECT face_verified FROM users WHERE id = ?',
          [userId]
        );

        res.json({
          success: true,
          data: {
            registered: users.length > 0 && users[0].face_verified === 1
          }
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Get face status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get face status'
      });
    }
  }

  /**
   * Delete face data
   */
  static async deleteFaceData(req, res) {
    try {
      const userId = req.user.userId;

      const connection = await pool.getConnection();
      try {
        await connection.query(
          `UPDATE users 
           SET face_descriptor = NULL, 
               face_verified = FALSE,
               face_registered_at = NULL
           WHERE id = ?`,
          [userId]
        );

        res.json({
          success: true,
          message: 'Face data deleted successfully'
        });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error('Delete face data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete face data'
      });
    }
  }
}

module.exports = FaceController;
