const mysql = require('mysql2/promise');
require('dotenv').config();

async function resetAdminAccount() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('RESETTING ADMIN ACCOUNT');
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

    // Reset admin account lockout
    await connection.query(`
      UPDATE users 
      SET failed_login_attempts = 0, 
          locked_until = NULL 
      WHERE email = 'admin@evoting.com'
    `);

    console.log('✓ Admin account unlocked');
    console.log('✓ Failed login attempts reset to 0');
    console.log('\n' + '='.repeat(60));
    console.log('ADMIN ACCOUNT RESET SUCCESSFUL');
    console.log('='.repeat(60) + '\n');
    console.log('You can now login with:');
    console.log('Email: admin@evoting.com');
    console.log('Password: admin123\n');

  } catch (error) {
    console.error('\n❌ Reset failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run reset
resetAdminAccount();
