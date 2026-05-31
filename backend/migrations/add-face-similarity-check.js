const { pool } = require('../config/database');

/**
 * Migration: Add face similarity checking to prevent fraud
 * - Prevents same face from being used by multiple accounts
 * - Adds index for faster face descriptor queries
 */
async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting migration: Face similarity fraud prevention...');

    // Add index on election_id for faster queries
    try {
      await connection.query(`
        CREATE INDEX idx_election_face_lookup 
        ON election_face_data(election_id, registered_at)
      `);
      console.log('✓ Added index for face lookup optimization');
    } catch (error) {
      if (error.code === 'ER_DUP_KEYNAME') {
        console.log('✓ Index already exists');
      } else {
        throw error;
      }
    }

    // Create table for face fraud detection logs
    await connection.query(`
      CREATE TABLE IF NOT EXISTS face_fraud_detection_logs (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        attempted_user_id VARCHAR(36) NOT NULL,
        attempted_email VARCHAR(100),
        matched_user_id VARCHAR(36) NOT NULL,
        matched_email VARCHAR(100),
        similarity_score DECIMAL(5,4),
        blocked BOOLEAN DEFAULT TRUE,
        detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_election_id (election_id),
        INDEX idx_attempted_user (attempted_user_id),
        INDEX idx_detected_at (detected_at)
      )
    `);
    console.log('✓ face_fraud_detection_logs table created');

    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrate()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = { migrate };
