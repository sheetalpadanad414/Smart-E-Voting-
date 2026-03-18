const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrateDatabase() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('DATABASE MIGRATION - Adding Missing Columns');
    console.log('='.repeat(60) + '\n');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_e_voting',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database\n');

    // Check if columns exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'smart_e_voting']);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    console.log('Existing columns:', existingColumns.join(', '));
    console.log('');

    // Add locked_until column if missing
    if (!existingColumns.includes('locked_until')) {
      console.log('Adding locked_until column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN locked_until DATETIME NULL DEFAULT NULL
      `);
      console.log('✓ Added locked_until column');
    } else {
      console.log('✓ locked_until column already exists');
    }

    // Add failed_login_attempts column if missing
    if (!existingColumns.includes('failed_login_attempts')) {
      console.log('Adding failed_login_attempts column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN failed_login_attempts INT DEFAULT 0
      `);
      console.log('✓ Added failed_login_attempts column');
    } else {
      console.log('✓ failed_login_attempts column already exists');
    }

    // Add last_login column if missing
    if (!existingColumns.includes('last_login')) {
      console.log('Adding last_login column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN last_login DATETIME NULL DEFAULT NULL
      `);
      console.log('✓ Added last_login column');
    } else {
      console.log('✓ last_login column already exists');
    }

    // Add verification_token column if missing
    if (!existingColumns.includes('verification_token')) {
      console.log('Adding verification_token column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN verification_token VARCHAR(255) NULL DEFAULT NULL
      `);
      console.log('✓ Added verification_token column');
    } else {
      console.log('✓ verification_token column already exists');
    }

    // Add is_verified column if missing
    if (!existingColumns.includes('is_verified')) {
      console.log('Adding is_verified column...');
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN is_verified BOOLEAN DEFAULT TRUE
      `);
      console.log('✓ Added is_verified column');
    } else {
      console.log('✓ is_verified column already exists');
    }

    console.log('\n' + '='.repeat(60));
    console.log('MIGRATION COMPLETED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run migration
migrateDatabase();
