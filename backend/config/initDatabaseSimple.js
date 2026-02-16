const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  console.log('\n' + '='.repeat(50));
  console.log('Smart E-Voting System - Database Initialization');
  console.log('='.repeat(50) + '\n');

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  });

  try {
    // Create Database
    console.log('Creating database...');
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'smart_evoting'}`);
    console.log('✓ Database created: ' + (process.env.DB_NAME || 'smart_evoting'));

    await connection.query(`USE ${process.env.DB_NAME || 'smart_evoting'}`);

    // 1. Users Table
    console.log('\nCreating users table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'voter') NOT NULL DEFAULT 'voter',
        has_voted BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Users table created');

    // 2. Candidates Table
    console.log('Creating candidates table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        party VARCHAR(100) NOT NULL,
        votes INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Candidates table created');

    // 3. Votes Table
    console.log('Creating votes table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        candidate_id INT NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        UNIQUE KEY unique_vote (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Votes table created');

    // 4. Election Table
    console.log('Creating election table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election (
        id INT PRIMARY KEY AUTO_INCREMENT,
        status ENUM('active', 'inactive') DEFAULT 'inactive',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Election table created');

    // 5. OTP Table
    console.log('Creating otps table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id INT PRIMARY KEY AUTO_INCREMENT,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_verified BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ OTPs table created');

    // Insert default election status
    console.log('\nInitializing election status...');
    await connection.query(`
      INSERT INTO election (id, status) VALUES (1, 'inactive')
      ON DUPLICATE KEY UPDATE status = status
    `);
    console.log('✓ Election status initialized');

    // Create indexes
    console.log('\nCreating indexes...');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_email ON users(email)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_role ON users(role)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_user_vote ON votes(user_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_candidate_vote ON votes(candidate_id)');
    await connection.query('CREATE INDEX IF NOT EXISTS idx_otp_email ON otps(email)');
    console.log('✓ Indexes created');

    // Display tables
    console.log('\n' + '='.repeat(50));
    console.log('Database Tables Created:');
    console.log('='.repeat(50));
    const [tables] = await connection.query('SHOW TABLES');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${Object.values(table)[0]}`);
    });

    console.log('\n' + '='.repeat(50));
    console.log('✓ Database Initialization Completed Successfully!');
    console.log('='.repeat(50) + '\n');

    console.log('Next Steps:');
    console.log('1. Start backend: cd backend && npm start');
    console.log('2. Start frontend: cd frontend && npm start');
    console.log('3. Register a user and update role to admin in database\n');

    await connection.end();
  } catch (error) {
    console.error('\n✗ Database Initialization Failed:', error.message);
    console.error('Error Details:', error);
    process.exit(1);
  }
};

// Run initialization
initDatabase();
