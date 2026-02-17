const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  try {
    console.log('Creating database...');
    
    // Connect without specifying database
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('✓ Connected to MySQL');

    // Create database
    const dbName = process.env.DB_NAME || 'smart_e_voting';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✓ Database '${dbName}' created successfully!`);

    await connection.end();
    
    console.log('\n✓ Setup complete! You can now run: npm run dev\n');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    console.log('\nMake sure:');
    console.log('1. MySQL is running');
    console.log('2. Credentials in .env are correct');
    console.log('3. User has permission to create databases\n');
    process.exit(1);
  }
}

createDatabase();
