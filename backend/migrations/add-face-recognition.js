const { pool } = require('../config/database');

async function migrateFaceRecognition() {
  const connection = await pool.getConnection();
  
  try {
    console.log('Starting face recognition migration...');

    // Add face columns to users table
    console.log('1. Adding face columns to users table...');
    await connection.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS face_descriptor TEXT,
      ADD COLUMN IF NOT EXISTS face_image_path VARCHAR(255),
      ADD COLUMN IF NOT EXISTS face_verified BOOLEAN DEFAULT FALSE,
      ADD COLUMN IF NOT EXISTS face_registered_at TIMESTAMP NULL
    `);
    console.log('✓ Face columns added to users table');

    // Create face_verification_logs table
    console.log('2. Creating face_verification_logs table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS face_verification_logs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNSIGNED NOT NULL,
        verification_type ENUM('registration', 'voting', 'login') NOT NULL,
        similarity_score DECIMAL(5,4),
        verified BOOLEAN,
        image_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ face_verification_logs table created');

    console.log('✅ Face recognition migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateFaceRecognition()
    .then(() => {
      console.log('Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}

module.exports = migrateFaceRecognition;
