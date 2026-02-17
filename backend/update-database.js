const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });

    console.log('✓ Connected to database');

    // Check if has_voted column exists
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users LIKE 'has_voted'
    `);

    if (columns.length === 0) {
      await connection.query(`
        ALTER TABLE users ADD COLUMN has_voted BOOLEAN DEFAULT FALSE AFTER is_verified
      `);
      console.log('✓ Added has_voted column to users table');
    } else {
      console.log('✓ has_voted column already exists');
    }

    await connection.end();
    console.log('\n✓ Database update completed!\n');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

updateDatabase();
