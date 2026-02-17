const mysql = require('mysql2/promise');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function setupDatabase() {
  console.log('\n=== Smart E-Voting Database Setup ===\n');

  try {
    // Get MySQL credentials
    const host = await question('MySQL Host (default: 127.0.0.1): ') || '127.0.0.1';
    const port = await question('MySQL Port (default: 3306): ') || '3306';
    const user = await question('MySQL Username (default: root): ') || 'root';
    const password = await question('MySQL Password (leave empty if none): ');
    const database = await question('Database Name (default: smart_e_voting): ') || 'smart_e_voting';

    console.log('\nTesting connection...');

    // Create connection without database
    const connection = await mysql.createConnection({
      host,
      port: parseInt(port),
      user,
      password
    });

    console.log('✓ Connected to MySQL successfully!');

    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${database}`);
    console.log(`✓ Database '${database}' created/verified`);

    await connection.end();

    // Create .env file
    const envContent = `# Backend environment variables
DB_HOST=${host}
DB_PORT=${port}
DB_USER=${user}
DB_PASSWORD=${password}
DB_NAME=${database}

JWT_SECRET=${generateRandomString(64)}
JWT_EXPIRE=7d

BCRYPT_ROUNDS=10

# OTP expire time in minutes
OTP_EXPIRE=5

# Email (configure with SMTP server or Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="Smart E-Voting" <no-reply@example.com>
`;

    const fs = require('fs');
    fs.writeFileSync('.env', envContent);
    console.log('✓ .env file created successfully!');

    console.log('\n=== Setup Complete! ===');
    console.log('\nNext steps:');
    console.log('1. Update EMAIL settings in .env file');
    console.log('2. Run: npm run dev');
    console.log('3. Create admin user: node createAdmin.js\n');

  } catch (error) {
    console.error('\n✗ Setup failed:', error.message);
    console.log('\nCommon issues:');
    console.log('- Wrong password');
    console.log('- MySQL not running');
    console.log('- Incorrect host/port\n');
  } finally {
    rl.close();
  }
}

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setupDatabase();
