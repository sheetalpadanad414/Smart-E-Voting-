const { pool } = require('../config/database');
const { generateUUID } = require('../utils/auth');

/**
 * Service for detecting face fraud
 * Prevents same face from being used by multiple accounts
 */
class FaceFraudDetectionService {
  
  /**
   * Calculate Euclidean distance between two face descriptors
   */
  static calculateDistance(descriptor1, descriptor2) {
    if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
      throw new Error('Descriptors must be arrays');
    }
    
    if (descriptor1.length !== descriptor2.length) {
      throw new Error('Descriptors must have same length');
    }
    
    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
      const diff = descriptor1[i] - descriptor2[i];
      sum += diff * diff;
    }
    
    return Math.sqrt(sum);
  }
  
  /**
   * Calculate similarity score (0-1, higher is more similar)
   */
  static calculateSimilarity(descriptor1, descriptor2) {
    const distance = this.calculateDistance(descriptor1, descriptor2);
    // Convert distance to similarity (inverse relationship)
    // Typical face-api.js distance threshold is 0.6
    // Distance of 0 = 100% similar, distance of 1+ = 0% similar
    const similarity = Math.max(0, 1 - distance);
    return similarity;
  }
  
  /**
   * Check if face descriptor matches any existing face in the election
   * Returns match if similarity > threshold (default 0.6 = 60%)
   */
  static async checkForDuplicateFace(userId, electionId, newDescriptor, threshold = 0.6) {
    const connection = await pool.getConnection();
    
    try {
      console.log('🔍 Checking for duplicate face in election...');
      console.log('   User ID:', userId);
      console.log('   Election ID:', electionId);
      console.log('   Similarity threshold:', threshold);
      
      // Get all face descriptors for this election (excluding current user)
      const [existingFaces] = await connection.query(
        `SELECT efd.user_id, efd.face_descriptor, u.email, u.name
         FROM election_face_data efd
         JOIN users u ON efd.user_id = u.id
         WHERE efd.election_id = ? AND efd.user_id != ?`,
        [electionId, userId]
      );
      
      console.log('   Found', existingFaces.length, 'existing face registrations to check');
      
      if (existingFaces.length === 0) {
        console.log('✅ No existing faces to compare');
        return null;
      }
      
      // Check each existing face for similarity
      for (const existingFace of existingFaces) {
        const existingDescriptor = JSON.parse(existingFace.face_descriptor);
        const similarity = this.calculateSimilarity(newDescriptor, existingDescriptor);
        
        console.log(`   Comparing with user ${existingFace.email}: similarity = ${(similarity * 100).toFixed(2)}%`);
        
        if (similarity >= threshold) {
          console.log('⚠️ FRAUD DETECTED! Face matches existing user');
          console.log('   Matched user:', existingFace.email);
          console.log('   Similarity:', (similarity * 100).toFixed(2) + '%');
          
          return {
            matched: true,
            matchedUserId: existingFace.user_id,
            matchedEmail: existingFace.email,
            matchedName: existingFace.name,
            similarity: similarity
          };
        }
      }
      
      console.log('✅ No matching faces found - face is unique');
      return null;
      
    } finally {
      connection.release();
    }
  }
  
  /**
   * Log fraud detection attempt
   */
  static async logFraudAttempt(attemptedUserId, attemptedEmail, matchedUserId, matchedEmail, electionId, similarity) {
    const connection = await pool.getConnection();
    
    try {
      const id = generateUUID();
      await connection.query(
        `INSERT INTO face_fraud_detection_logs 
         (id, election_id, attempted_user_id, attempted_email, matched_user_id, matched_email, similarity_score, blocked)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
        [id, electionId, attemptedUserId, attemptedEmail, matchedUserId, matchedEmail, similarity]
      );
      
      console.log('📝 Fraud attempt logged:', id);
      
    } finally {
      connection.release();
    }
  }
  
  /**
   * Get fraud detection statistics
   */
  static async getFraudStats() {
    const connection = await pool.getConnection();
    
    try {
      // Total fraud attempts
      const [totalAttempts] = await connection.query(
        'SELECT COUNT(*) as count FROM face_fraud_detection_logs WHERE blocked = TRUE'
      );
      
      // Fraud attempts by election
      const [byElection] = await connection.query(
        `SELECT e.title, COUNT(*) as attempts
         FROM face_fraud_detection_logs ffd
         JOIN elections e ON ffd.election_id = e.id
         WHERE ffd.blocked = TRUE
         GROUP BY ffd.election_id
         ORDER BY attempts DESC
         LIMIT 10`
      );
      
      // Recent fraud attempts
      const [recentAttempts] = await connection.query(
        `SELECT ffd.*, e.title as election_title
         FROM face_fraud_detection_logs ffd
         JOIN elections e ON ffd.election_id = e.id
         WHERE ffd.blocked = TRUE
         ORDER BY ffd.detected_at DESC
         LIMIT 20`
      );
      
      return {
        totalAttempts: totalAttempts[0].count,
        byElection,
        recentAttempts
      };
      
    } finally {
      connection.release();
    }
  }
}

module.exports = FaceFraudDetectionService;
