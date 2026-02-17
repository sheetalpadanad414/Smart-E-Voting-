const { pool } = require('./config/database');
const { generateUUID, hashPassword } = require('./utils/auth');
require('dotenv').config();

async function createTestVoter() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n=== Creating Test Voter ===\n');

    const voterId = generateUUID();
    const email = 'voter@test.com';
    const password = await hashPassword('voter123');
    const name = 'Test Voter';
    const phone = '1234567890';

    // Check if voter already exists
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      console.log('✓ Test voter already exists');
      console.log('Email:', email);
      console.log('Password: voter123');
      connection.release();
      process.exit(0);
      return;
    }

    await connection.query(`
      INSERT INTO users (id, name, email, phone, password, role, is_verified, verified_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `, [
      voterId,
      name,
      email,
      phone,
      password,
      'voter',
      true
    ]);

    console.log('✓ Test voter created successfully!');
    console.log('\nLogin Credentials:');
    console.log('Email:', email);
    console.log('Password: voter123');
    console.log('\nYou can now login at: http://localhost:3000/login');
    console.log('\n');

  } catch (error) {
    console.error('Error creating test voter:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createTestVoter();
