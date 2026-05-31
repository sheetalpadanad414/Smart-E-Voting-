const { pool } = require('../config/database');

/**
 * Migration: Add election-specific face data storage
 * - Face data is now tied to specific election types
 * - Automatically cleaned up when elections end
 */
async function migrate() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting migration: Election-specific face data...');

    // Create table for election-specific face registrations
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election_face_data (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        election_id VARCHAR(36) NOT NULL,
        election_type VARCHAR(50) NOT NULL,
        election_subtype VARCHAR(50),
        face_descriptor JSON NOT NULL,
        face_image_path VARCHAR(255),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_verified_at TIMESTAMP NULL,
        verification_count INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_election (user_id, election_id),
        INDEX idx_user_id (user_id),
        INDEX idx_election_id (election_id),
        INDEX idx_election_type (election_type),
        INDEX idx_registered_at (registered_at)
      )
    `);
    console.log('✓ election_face_data table created');

    // Update face_verification_logs to link to election
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'face_verification_logs'
      AND COLUMN_NAME = 'election_id'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE face_verification_logs
        ADD COLUMN election_id VARCHAR(36) NULL AFTER user_id,
        ADD COLUMN election_type VARCHAR(50) NULL AFTER election_id,
        ADD INDEX idx_election_id (election_id)
      `);
      console.log('✓ Added election tracking to face_verification_logs');
    }

    // Create cleanup log table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS face_data_cleanup_logs (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        election_type VARCHAR(50) NOT NULL,
        election_title VARCHAR(255),
        records_deleted INT DEFAULT 0,
        cleanup_reason VARCHAR(100),
        cleaned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_election_id (election_id),
        INDEX idx_cleaned_at (cleaned_at)
      )
    `);
    console.log('✓ face_data_cleanup_logs table created');

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
