const mysql = require('mysql2/promise');
require('dotenv').config();

const initDatabase = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT
  });

  try {
    // Create Database
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log('✓ Database Created');

    await connection.query(`USE ${process.env.DB_NAME}`);

    // Users Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'voter', 'election_officer', 'observer') NOT NULL DEFAULT 'voter',
        is_verified BOOLEAN DEFAULT FALSE,
        verified_at TIMESTAMP NULL DEFAULT NULL,
        voter_id VARCHAR(20) UNIQUE,
        department VARCHAR(100),
        designation VARCHAR(100),
        assignment_area VARCHAR(255),
        otp VARCHAR(6),
        otp_expires_at TIMESTAMP NULL DEFAULT NULL,
        failed_login_attempts INT DEFAULT 0,
        locked_until TIMESTAMP NULL DEFAULT NULL,
        last_login TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_voter_id (voter_id)
      )
    `);
    console.log('✓ Users Table Created');

    // Elections Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
        is_public BOOLEAN DEFAULT TRUE,
        created_by VARCHAR(36) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (created_by) REFERENCES users(id),
        INDEX idx_status (status),
        INDEX idx_start_date (start_date),
        INDEX idx_end_date (end_date)
      )
    `);
    console.log('✓ Elections Table Created');

    // Candidates Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        symbol VARCHAR(100),
        image_url VARCHAR(500),
        position VARCHAR(100),
        party_name VARCHAR(100),
        vote_count INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        INDEX idx_election_id (election_id),
        UNIQUE KEY unique_candidate (election_id, name)
      )
    `);
    console.log('✓ Candidates Table Created');

    // Votes Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        voter_id VARCHAR(36) NOT NULL,
        candidate_id VARCHAR(36) NOT NULL,
        voted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ip_address VARCHAR(45),
        device_info VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        UNIQUE KEY unique_vote (election_id, voter_id),
        INDEX idx_election_id (election_id),
        INDEX idx_voter_id (voter_id),
        INDEX idx_candidate_id (candidate_id)
      )
    `);
    console.log('✓ Votes Table Created');

    // OTP Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(100) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose ENUM('registration', 'login', 'password_reset', 'vote') DEFAULT 'registration',
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP NULL DEFAULT NULL,
        INDEX idx_email (email),
        INDEX idx_otp (otp)
      )
    `);
    console.log('✓ OTPs Table Created');

    // Audit Log Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        action VARCHAR(100) NOT NULL,
        entity_type VARCHAR(50),
        entity_id VARCHAR(36),
        changes JSON,
        ip_address VARCHAR(45),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);
    console.log('✓ Audit Logs Table Created');

    // Election Results Cache
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election_results_cache (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL UNIQUE,
        total_voters INT DEFAULT 0,
        total_votes INT DEFAULT 0,
        results JSON,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        INDEX idx_election_id (election_id)
      )
    `);
    console.log('✓ Election Results Cache Table Created');

    await connection.end();
    console.log('\n✓ Database Initialization Completed Successfully!\n');
  } catch (error) {
    console.error('✗ Database Initialization Failed:', error.message);
    process.exit(1);
  }
};

initDatabase();
