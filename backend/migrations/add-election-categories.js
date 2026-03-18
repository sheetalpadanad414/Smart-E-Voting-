const { pool } = require('../config/database');

/**
 * Migration: Add Election Categories System
 * Creates tables for election categories and types
 */

async function addElectionCategories() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🚀 Starting Election Categories Migration...\n');

    // Create election_categories table
    console.log('1️⃣  Creating election_categories table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election_categories (
        id INT PRIMARY KEY AUTO_INCREMENT,
        category_name VARCHAR(100) NOT NULL UNIQUE,
        description TEXT,
        icon VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✓ election_categories table created\n');

    // Create election_types table
    console.log('2️⃣  Creating election_types table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS election_types (
        id INT PRIMARY KEY AUTO_INCREMENT,
        type_name VARCHAR(100) NOT NULL,
        category_id INT NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES election_categories(id) ON DELETE CASCADE,
        UNIQUE KEY unique_type_category (type_name, category_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('   ✓ election_types table created\n');

    // Check if category_id column exists in elections table
    console.log('3️⃣  Checking elections table structure...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM elections LIKE 'category_id'
    `);

    if (columns.length === 0) {
      console.log('   Adding category_id and type_id columns to elections table...');
      await connection.query(`
        ALTER TABLE elections
        ADD COLUMN category_id INT NULL AFTER election_subtype,
        ADD COLUMN type_id INT NULL AFTER category_id,
        ADD FOREIGN KEY (category_id) REFERENCES election_categories(id) ON DELETE SET NULL,
        ADD FOREIGN KEY (type_id) REFERENCES election_types(id) ON DELETE SET NULL
      `);
      console.log('   ✓ Columns added to elections table\n');
    } else {
      console.log('   ✓ Columns already exist\n');
    }

    // Insert default categories
    console.log('4️⃣  Inserting default election categories...');
    await connection.query(`
      INSERT IGNORE INTO election_categories (id, category_name, description, icon) VALUES
      (1, 'National Elections', 'Lok Sabha, Rajya Sabha elections', '🏛️'),
      (2, 'State Elections', 'Vidhan Sabha, Vidhan Parishad elections', '🏢'),
      (3, 'Local Government Elections', 'Gram Panchayat, Taluk Panchayat, Zilla Panchayat, Municipal Council, Nagar Panchayat', '🏘️'),
      (4, 'Institutional Elections', 'College, University, Company Board, Society Association', '🎓')
    `);
    console.log('   ✓ Categories inserted\n');

    // Insert default election types
    console.log('5️⃣  Inserting default election types...');
    await connection.query(`
      INSERT IGNORE INTO election_types (type_name, category_id, description) VALUES
      -- National Elections
      ('Lok Sabha', 1, 'Lower house of Parliament'),
      ('Rajya Sabha', 1, 'Upper house of Parliament'),
      
      -- State Elections
      ('Vidhan Sabha', 2, 'State Legislative Assembly'),
      ('Vidhan Parishad', 2, 'State Legislative Council'),
      
      -- Local Government Elections
      ('Gram Panchayat', 3, 'Village level local government'),
      ('Taluk Panchayat', 3, 'Taluk level local government'),
      ('Zilla Panchayat', 3, 'District level local government'),
      ('Municipal Corporation', 3, 'City municipal corporation'),
      ('Municipal Council', 3, 'Town municipal council'),
      ('Nagar Panchayat', 3, 'Small town local government'),
      
      -- Institutional Elections
      ('College Election', 4, 'College student union election'),
      ('University Election', 4, 'University student union election'),
      ('Company Board Voting', 4, 'Corporate board member election'),
      ('Society Election', 4, 'Housing society/apartment association election')
    `);
    console.log('   ✓ Election types inserted\n');

    console.log('='.repeat(60));
    console.log('✅ Migration completed successfully!\n');
    console.log('📊 Summary:');
    console.log('   - election_categories table created');
    console.log('   - election_types table created');
    console.log('   - elections table updated with category_id and type_id');
    console.log('   - 4 categories inserted');
    console.log('   - 14 election types inserted\n');

    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
    connection.release();
    process.exit(1);
  }
}

// Run migration
addElectionCategories();
