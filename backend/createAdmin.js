const bcrypt = require('bcryptjs');
const db = require('./config/databaseSimple');

// Admin credentials
const ADMIN_NAME = 'admin';
const ADMIN_EMAIL = 'admin@evoting.com';
const ADMIN_PASSWORD = 'admin123';

async function createAdmin() {
  console.log('\n' + '='.repeat(50));
  console.log('Creating Admin Account');
  console.log('='.repeat(50));

  try {
    // Check if admin already exists
    const checkQuery = 'SELECT id FROM users WHERE email = ?';
    const [existing] = await db.query(checkQuery, [ADMIN_EMAIL]);

    if (existing.length > 0) {
      console.log('✗ Admin already exists with this email');
      console.log('Email:', ADMIN_EMAIL);
      console.log('\nTo update existing user to admin:');
      console.log(`UPDATE users SET role = 'admin' WHERE email = '${ADMIN_EMAIL}';`);
      process.exit(1);
    }

    // Hash password
    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // Insert admin user
    console.log('Creating admin account...');
    const insertQuery = `
      INSERT INTO users (name, email, password, role, is_verified, verified_at)
      VALUES (?, ?, ?, 'admin', 1, CURRENT_TIMESTAMP)
    `;

    const [result] = await db.query(insertQuery, [
      ADMIN_NAME,
      ADMIN_EMAIL,
      hashedPassword
    ]);

    console.log('\n' + '='.repeat(50));
    console.log('✓ Admin Account Created Successfully!');
    console.log('='.repeat(50));
    console.log('Admin ID:', result.insertId);
    console.log('Name:', ADMIN_NAME);
    console.log('Email:', ADMIN_EMAIL);
    console.log('Password:', ADMIN_PASSWORD);
    console.log('Role: admin');
    console.log('='.repeat(50));
    console.log('\nYou can now login at:');
    console.log('POST http://localhost:5000/api/auth/admin/login');
    console.log('\nWith credentials:');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n✗ Failed to create admin account');
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Run the script
createAdmin();
