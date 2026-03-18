const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const addPartySystem = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('🚀 Adding Party System to database...\n');

    // Step 1: Create parties table
    console.log('1️⃣ Creating parties table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parties (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        logo VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_party_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Parties table created\n');

    // Step 2: Check if party_id column exists in candidates table
    console.log('2️⃣ Checking candidates table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'candidates'
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);

    // Step 3: Add party_id column if it doesn't exist
    if (!existingColumns.includes('party_id')) {
      console.log('3️⃣ Adding party_id column to candidates table...');
      await connection.query(`
        ALTER TABLE candidates 
        ADD COLUMN party_id VARCHAR(36) NULL AFTER election_id,
        ADD INDEX idx_party_id (party_id)
      `);
      console.log('✓ party_id column added\n');
    } else {
      console.log('⚠ party_id column already exists\n');
    }

    // Step 4: Add foreign key constraint
    console.log('4️⃣ Adding foreign key constraint...');
    
    // Check if foreign key already exists
    const [fks] = await connection.query(`
      SELECT CONSTRAINT_NAME 
      FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'candidates' 
      AND CONSTRAINT_NAME = 'fk_candidates_party'
    `, [process.env.DB_NAME]);

    if (fks.length === 0) {
      await connection.query(`
        ALTER TABLE candidates
        ADD CONSTRAINT fk_candidates_party
        FOREIGN KEY (party_id) REFERENCES parties(id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
      `);
      console.log('✓ Foreign key constraint added\n');
    } else {
      console.log('⚠ Foreign key constraint already exists\n');
    }

    // Step 5: Migrate existing party_name data (if column exists)
    if (existingColumns.includes('party_name')) {
      console.log('5️⃣ Migrating existing party data...');
      
      // Get unique party names from candidates
      const [existingParties] = await connection.query(`
        SELECT DISTINCT party_name 
        FROM candidates 
        WHERE party_name IS NOT NULL AND party_name != ''
      `);

      if (existingParties.length > 0) {
        console.log(`Found ${existingParties.length} unique parties to migrate`);
        
        for (const party of existingParties) {
          const partyId = require('crypto').randomUUID();
          
          // Insert party
          await connection.query(`
            INSERT IGNORE INTO parties (id, name, description)
            VALUES (?, ?, ?)
          `, [partyId, party.party_name, `Migrated from existing data`]);
          
          // Update candidates with party_id
          await connection.query(`
            UPDATE candidates 
            SET party_id = (SELECT id FROM parties WHERE name = ? LIMIT 1)
            WHERE party_name = ?
          `, [party.party_name, party.party_name]);
        }
        
        console.log('✓ Party data migrated\n');
      } else {
        console.log('⚠ No existing party data to migrate\n');
      }
    }

    // Step 6: Insert sample parties
    console.log('6️⃣ Inserting sample parties...');
    const sampleParties = [
      { id: require('crypto').randomUUID(), name: 'Independent', description: 'Independent candidates without party affiliation' },
      { id: require('crypto').randomUUID(), name: 'Democratic Party', description: 'Democratic political party' },
      { id: require('crypto').randomUUID(), name: 'Republican Party', description: 'Republican political party' },
      { id: require('crypto').randomUUID(), name: 'Green Party', description: 'Environmental and social justice party' },
      { id: require('crypto').randomUUID(), name: 'Libertarian Party', description: 'Libertarian political party' }
    ];

    for (const party of sampleParties) {
      await connection.query(`
        INSERT IGNORE INTO parties (id, name, description)
        VALUES (?, ?, ?)
      `, [party.id, party.name, party.description]);
    }
    console.log('✓ Sample parties inserted\n');

    await connection.end();
    console.log('✅ Party system migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - Parties table created');
    console.log('  - party_id column added to candidates');
    console.log('  - Foreign key constraint added');
    console.log('  - Sample parties inserted');
    console.log('\n🎉 You can now manage parties in the admin panel!');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    await connection.end();
    process.exit(1);
  }
};

addPartySystem();
