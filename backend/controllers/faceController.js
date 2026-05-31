const { pool } = require('../config/database');
const ElectionFaceService = require('../services/electionFaceService');
const FaceFraudDetectionService = require('../services/faceFraudDetectionService');

class FaceController {
  /**
   * Store face descriptor for specific election
   */
  static async storeFaceDescriptor(req, res) {
    try {
      console.log('📥 storeFaceDescriptor called');
      console.log('   User ID:', req.user?.userId);
      console.log('   Request body keys:', Object.keys(req.body));
      
      const userId = req.user.userId;
      const { descriptor, electionId } = req.body;

      console.log('   Descriptor type:', typeof descriptor);
      console.log('   Descriptor is array:', Array.isArray(descriptor));
      console.log('   Descriptor length:', descriptor?.length);
      console.log('   Election ID:', electionId);

      if (!descriptor || !Array.isArray(descriptor)) {
        console.error('❌ Invalid descriptor:', { descriptor: typeof descriptor, isArray: Array.isArray(descriptor) });
        return res.status(400).json({
          success: false,
          message: 'Invalid face descriptor'
        });
      }

      if (!electionId) {
        return res.status(400).json({
          success: false,
          message: 'Election ID is required'
        });
      }

      // Check if already registered for this election (same user)
      console.log('🔍 Checking if already registered...');
      console.log('   User ID:', userId);
      console.log('   Election ID:', electionId);
      
      const alreadyRegistered = await ElectionFaceService.hasFaceForElection(userId, electionId);
      
      console.log('   Already registered:', alreadyRegistered);
      
      if (alreadyRegistered) {
        console.log('❌ REJECTED: Face already registered for this election');
        return res.status(400).json({
          success: false,
          message: 'Face already registered for this election. You cannot register again for the same election.'
        });
      }

      console.log('✅ Not registered yet, checking for fraud...');

      // Check for duplicate face (fraud detection)
      const fraudCheck = await FaceFraudDetectionService.checkForDuplicateFace(
        userId,
        electionId,
        descriptor,
        0.6 // 60% similarity threshold
      );

      if (fraudCheck && fraudCheck.matched) {
        console.log('🚨 FRAUD DETECTED!');
        console.log('   Attempted user:', userId);
        console.log('   Matched user:', fraudCheck.matchedUserId);
        console.log('   Similarity:', (fraudCheck.similarity * 100).toFixed(2) + '%');
        
        // Get current user email
        const connection = await pool.getConnection();
        const [users] = await connection.query(
          'SELECT email FROM users WHERE id = ?',
          [userId]
        );
        connection.release();
        
        const attemptedEmail = users.length > 0 ? users[0].email : 'unknown';
        
        // Log fraud attempt
        await FaceFraudDetectionService.logFraudAttempt(
          userId,
          attemptedEmail,
          fraudCheck.matchedUserId,
          fraudCheck.matchedEmail,
          electionId,
          fraudCheck.similarity
        );
        
        return res.status(403).json({
          success: false,
          message: `This face is already registered for this election by another account (${fraudCheck.matchedEmail}). Each person can only vote once per election.`,
          fraud: true,
          matchedEmail: fraudCheck.matchedEmail
        });
      }

      console.log('✅ No fraud detected, proceeding with registration...');

      // Register face for election
      const result = await ElectionFaceService.registerFaceForElection(
        userId, 
        electionId, 
        descriptor
      );

      console.log('✅ Face registered for election:', result);

      res.json({
        success: true,
        message: 'Face registered successfully for this election',
        data: result
      });

    } catch (error) {
      console.error('❌ Store face descriptor error:', error);
      console.error('   Error stack:', error.stack);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to store face descriptor',
        error: error.message
      });
    }
  }

  /**
   * Get stored face descriptor for specific election
   */
  static async getFaceDescriptor(req, res) {
    try {
      const userId = req.user.userId;
      const { electionId } = req.query;

      if (!electionId) {
        return res.status(400).json({
          success: false,
          message: 'Election ID is required'
        });
      }

      const faceData = await ElectionFaceService.getFaceForElection(userId, electionId);

      if (!faceData) {
        return res.status(404).json({
          success: false,
          message: 'No face registered for this election'
        });
      }

      res.json({
        success: true,
        data: faceData
      });

    } catch (error) {
      console.error('Get face descriptor error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get face descriptor'
      });
    }
  }

  /**
   * Log verification attempt for specific election
   */
  static async logVerification(req, res) {
    try {
      const userId = req.user.userId;
      const { verified, similarity, electionId } = req.body;

      if (!electionId) {
        return res.status(400).json({
          success: false,
          message: 'Election ID is required'
        });
      }

      await ElectionFaceService.recordVerification(userId, electionId, verified, similarity);

      res.json({ success: true });
    } catch (error) {
      console.error('Log verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to log verification'
      });
    }
  }

  /**
   * Check face registration status for specific election
   */
  static async getFaceStatus(req, res) {
    try {
      const userId = req.user.userId;
      const { electionId } = req.query;

      if (!electionId) {
        return res.status(400).json({
          success: false,
          message: 'Election ID is required'
        });
      }

      const registered = await ElectionFaceService.hasFaceForElection(userId, electionId);

      res.json({
        success: true,
        data: { registered }
      });

    } catch (error) {
      console.error('Get face status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get face status'
      });
    }
  }

  /**
   * Get all elections needing face registration
   */
  static async getElectionsNeedingRegistration(req, res) {
    try {
      const userId = req.user.userId;

      const elections = await ElectionFaceService.getElectionsNeedingFaceRegistration(userId);

      res.json({
        success: true,
        data: elections
      });

    } catch (error) {
      console.error('Get elections needing registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get elections'
      });
    }
  }

  /**
   * Delete face data for specific election (admin only)
   */
  static async deleteFaceData(req, res) {
    try {
      const { electionId } = req.body;

      if (!electionId) {
        return res.status(400).json({
          success: false,
          message: 'Election ID is required'
        });
      }

      const result = await ElectionFaceService.cleanupElectionFaceData(electionId);

      res.json({
        success: true,
        message: `Deleted ${result.recordsDeleted} face records`,
        data: result
      });

    } catch (error) {
      console.error('Delete face data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete face data'
      });
    }
  }

  /**
   * Cleanup inactive election face data (admin only)
   */
  static async cleanupInactiveFaceData(req, res) {
    try {
      const result = await ElectionFaceService.cleanupInactiveElectionFaceData();

      res.json({
        success: true,
        message: `Cleaned up face data for ${result.electionsProcessed} elections`,
        data: result
      });

    } catch (error) {
      console.error('Cleanup face data error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cleanup face data'
      });
    }
  }

  /**
   * Get face registration statistics (admin only)
   */
  static async getFaceStats(req, res) {
    try {
      const stats = await ElectionFaceService.getFaceRegistrationStats();
      const fraudStats = await FaceFraudDetectionService.getFraudStats();

      res.json({
        success: true,
        data: {
          ...stats,
          fraud: fraudStats
        }
      });

    } catch (error) {
      console.error('Get face stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get face statistics'
      });
    }
  }
}

module.exports = FaceController;
