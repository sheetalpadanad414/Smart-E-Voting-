const mysql = require('mysql2/promise');
require('dotenv').config();

const addVoterTrackingFields = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Adding voter tracking fields to users table...');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Add otp_verified column if it doesn't exist
    if (!existingColumns.includes('otp_verified')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN otp_verified BOOLEAN DEFAULT FALSE AFTER is_verified
      `);
      console.log('✓ Added otp_verified column');
    } else {
      console.log('⚠ otp_verified column already exists');
    }

    // Add has_voted column if it doesn't exist
    if (!existingColumns.includes('has_voted')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN has_voted BOOLEAN DEFAULT FALSE AFTER otp_verified
      `);
      console.log('✓ Added has_voted column');
    } else {
      console.log('⚠ has_voted column already exists');
    }

    // Update has_voted for users who have already voted
    await connection.query(`
      UPDATE users u
      SET has_voted = TRUE
      WHERE EXISTS (
        SELECT 1 FROM votes v WHERE v.voter_id = u.id
      )
    `);
    console.log('✓ Updated has_voted status for existing voters');

    await connection.end();
    console.log('\n✓ Migration completed successfully!\n');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
};

addVoterTrackingFields();
