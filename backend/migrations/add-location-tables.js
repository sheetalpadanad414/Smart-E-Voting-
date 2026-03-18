const mysql = require('mysql2/promise');
require('dotenv').config();

const addLocationTables = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('Creating location tables...\n');

    // Create countries table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        code VARCHAR(3) NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_code (code)
      )
    `);
    console.log('✓ Countries table created');

    // Create states table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        country_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        code VARCHAR(10),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE CASCADE,
        UNIQUE KEY unique_state (country_id, name),
        INDEX idx_country_id (country_id)
      )
    `);
    console.log('✓ States table created');

    // Check if columns already exist in users table
    const [userColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);

    const existingUserColumns = userColumns.map(col => col.COLUMN_NAME);

    // Add country_id to users table
    if (!existingUserColumns.includes('country_id')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN country_id INT NULL AFTER assignment_area,
        ADD FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
      `);
      console.log('✓ Added country_id to users table');
    } else {
      console.log('⚠ country_id already exists in users table');
    }

    // Add state_id to users table
    if (!existingUserColumns.includes('state_id')) {
      await connection.query(`
        ALTER TABLE users 
        ADD COLUMN state_id INT NULL AFTER country_id,
        ADD FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL
      `);
      console.log('✓ Added state_id to users table');
    } else {
      console.log('⚠ state_id already exists in users table');
    }

    // Check if columns already exist in elections table
    const [electionColumns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'elections'
    `, [process.env.DB_NAME]);

    const existingElectionColumns = electionColumns.map(col => col.COLUMN_NAME);

    // Add country_id to elections table
    if (!existingElectionColumns.includes('country_id')) {
      await connection.query(`
        ALTER TABLE elections 
        ADD COLUMN country_id INT NULL AFTER is_public,
        ADD FOREIGN KEY (country_id) REFERENCES countries(id) ON DELETE SET NULL
      `);
      console.log('✓ Added country_id to elections table');
    } else {
      console.log('⚠ country_id already exists in elections table');
    }

    // Add state_id to elections table
    if (!existingElectionColumns.includes('state_id')) {
      await connection.query(`
        ALTER TABLE elections 
        ADD COLUMN state_id INT NULL AFTER country_id,
        ADD FOREIGN KEY (state_id) REFERENCES states(id) ON DELETE SET NULL
      `);
      console.log('✓ Added state_id to elections table');
    } else {
      console.log('⚠ state_id already exists in elections table');
    }

    // Insert sample countries
    console.log('\nInserting sample countries...');
    await connection.query(`
      INSERT IGNORE INTO countries (name, code) VALUES
      ('United States', 'USA'),
      ('India', 'IND'),
      ('United Kingdom', 'GBR'),
      ('Canada', 'CAN'),
      ('Australia', 'AUS')
    `);
    console.log('✓ Sample countries inserted');

    // Insert sample states for USA
    console.log('Inserting sample states for USA...');
    await connection.query(`
      INSERT IGNORE INTO states (country_id, name, code) 
      SELECT id, 'California', 'CA' FROM countries WHERE code = 'USA'
      UNION ALL
      SELECT id, 'Texas', 'TX' FROM countries WHERE code = 'USA'
      UNION ALL
      SELECT id, 'New York', 'NY' FROM countries WHERE code = 'USA'
      UNION ALL
      SELECT id, 'Florida', 'FL' FROM countries WHERE code = 'USA'
      UNION ALL
      SELECT id, 'Illinois', 'IL' FROM countries WHERE code = 'USA'
    `);

    // Insert sample states for India
    console.log('Inserting sample states for India...');
    await connection.query(`
      INSERT IGNORE INTO states (country_id, name, code) 
      SELECT id, 'Maharashtra', 'MH' FROM countries WHERE code = 'IND'
      UNION ALL
      SELECT id, 'Karnataka', 'KA' FROM countries WHERE code = 'IND'
      UNION ALL
      SELECT id, 'Tamil Nadu', 'TN' FROM countries WHERE code = 'IND'
      UNION ALL
      SELECT id, 'Delhi', 'DL' FROM countries WHERE code = 'IND'
      UNION ALL
      SELECT id, 'Gujarat', 'GJ' FROM countries WHERE code = 'IND'
    `);
    console.log('✓ Sample states inserted');

    await connection.end();
    console.log('\n✓ Location tables migration completed successfully!\n');
  } catch (error) {
    console.error('✗ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
};

addLocationTables();
