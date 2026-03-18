const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addElectionTypes = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Adding election types to database...\n');

    // Check if columns already exist
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'elections'
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Add election_type column
    if (!existingColumns.includes('election_type')) {
      await connection.query(`
        ALTER TABLE elections 
        ADD COLUMN election_type VARCHAR(50) NULL AFTER is_public
      `);
      console.log('✓ Added election_type column');
    } else {
      console.log('⚠ election_type column already exists');
    }

    // Add election_subtype column
    if (!existingColumns.includes('election_subtype')) {
      await connection.query(`
        ALTER TABLE elections 
        ADD COLUMN election_subtype VARCHAR(50) NULL AFTER election_type
      `);
      console.log('✓ Added election_subtype column');
    } else {
      console.log('⚠ election_subtype column already exists');
    }

    // Add indexes for better performance
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_election_type ON elections(election_type)
    `);
    await connection.query(`
      CREATE INDEX IF NOT EXISTS idx_election_subtype ON elections(election_subtype)
    `);
    console.log('✓ Added indexes for election types');

    await connection.end();
    console.log('\n✓ Election types migration completed successfully!\n');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
};

addElectionTypes();
