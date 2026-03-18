const mysql = require('mysql2/promise');
require('dotenv').config();

async function testDatabaseConnection() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING DATABASE CONNECTION');
    console.log('='.repeat(60) + '\n');

    console.log('Configuration:');
    console.log('  Host:', process.env.DB_HOST || 'localhost');
    console.log('  Port:', process.env.DB_PORT || 3306);
    console.log('  User:', process.env.DB_USER || 'root');
    console.log('  Database:', process.env.DB_NAME || 'smart_e_voting');
    console.log('');

    // Test connection WITHOUT database first
    console.log('Step 1: Testing MySQL server connection...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    console.log('✓ MySQL server connection successful\n');

    // Check if database exists
    console.log('Step 2: Checking if database exists...');
    const [databases] = await connection.query('SHOW DATABASES');
    const dbList = databases.map(db => Object.values(db)[0]);
    console.log('Available databases:', dbList.join(', '));
    
    const targetDb = process.env.DB_NAME || 'smart_e_voting';
    if (dbList.includes(targetDb)) {
      console.log(`✓ Database '${targetDb}' exists\n`);
    } else {
      console.log(`⚠️  Database '${targetDb}' does NOT exist\n`);
      console.log('Creating database...');
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${targetDb}\``);
      console.log(`✓ Database '${targetDb}' created\n`);
    }

    await connection.end();

    // Test connection WITH database
    console.log('Step 3: Testing connection to database...');
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: targetDb,
      port: process.env.DB_PORT || 3306
    });
    console.log('✓ Database connection successful\n');

    // Check tables
    console.log('Step 4: Checking tables...');
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length > 0) {
      console.log('Existing tables:');
      tables.forEach(table => {
        console.log('  -', Object.values(table)[0]);
      });
    } else {
      console.log('⚠️  No tables found in database');
      console.log('   Run: node create-missing-tables.js');
    }

    console.log('\n' + '='.repeat(60));
    console.log('DATABASE CONNECTION TEST SUCCESSFUL');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Database connection failed:', error.message);
    console.error('\nPossible solutions:');
    console.error('1. Make sure MySQL is running');
    console.error('2. Check your .env file has correct credentials');
    console.error('3. Verify database name is correct');
    console.error('4. Check MySQL user has proper permissions\n');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

testDatabaseConnection();
