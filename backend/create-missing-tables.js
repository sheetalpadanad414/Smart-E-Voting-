const mysql = require('mysql2/promise');
require('dotenv').config();

async function createMissingTables() {
  let connection;
  
  try {
    console.log('\n' + '='.repeat(60));
    console.log('CREATING MISSING DATABASE TABLES');
    console.log('='.repeat(60) + '\n');

    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'smart_e_voting',
      port: process.env.DB_PORT || 3306
    });

    console.log('✓ Connected to database\n');

    // Create elections table
    console.log('Creating elections table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS elections (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        status ENUM('draft', 'active', 'completed') DEFAULT 'draft',
        created_by VARCHAR(36),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_dates (start_date, end_date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Elections table created');

    // Create candidates table
    console.log('Creating candidates table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS candidates (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        party VARCHAR(255),
        description TEXT,
        photo_url VARCHAR(500),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        INDEX idx_election (election_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Candidates table created');

    // Create votes table
    console.log('Creating votes table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id VARCHAR(36) PRIMARY KEY,
        election_id VARCHAR(36) NOT NULL,
        candidate_id VARCHAR(36) NOT NULL,
        voter_id VARCHAR(36) NOT NULL,
        vote_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_vote (election_id, voter_id),
        FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
        FOREIGN KEY (candidate_id) REFERENCES candidates(id) ON DELETE CASCADE,
        FOREIGN KEY (voter_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_election (election_id),
        INDEX idx_candidate (candidate_id),
        INDEX idx_voter (voter_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Votes table created');

    // Create audit_logs table (without foreign key to avoid constraint issues)
    console.log('Creating audit_logs table...');
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
        INDEX idx_user (user_id),
        INDEX idx_action (action),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ Audit logs table created');

    // Create otps table
    console.log('Creating otps table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS otps (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        otp VARCHAR(6) NOT NULL,
        purpose ENUM('login', 'registration', 'vote') NOT NULL,
        expires_at DATETIME NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_expires (expires_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log('✓ OTPs table created');

    console.log('\n' + '='.repeat(60));
    console.log('ALL TABLES CREATED SUCCESSFULLY');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Table creation failed:', error.message);
    console.error('Error details:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createMissingTables();
