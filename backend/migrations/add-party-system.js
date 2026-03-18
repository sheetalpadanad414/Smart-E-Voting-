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
    console.log('🎉 Adding Party Management System...\n');

    // Step 1: Create parties table
    console.log('1️⃣ Creating parties table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS parties (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        logo_url VARCHAR(500),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_party_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✓ Parties table created\n');

    // Step 2: Check if party_id column already exists in candidates table
    console.log('2️⃣ Checking candidates table structure...');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'candidates'
    `, [process.env.DB_NAME]);

    const existingColumns = columns.map(col => col.COLUMN_NAME);
    const hasPartyId = existingColumns.includes('party_id');
    const hasPartyName = existingColumns.includes('party_name');

    // Step 3: Migrate existing party_name data to parties table
    if (hasPartyName && !hasPartyId) {
      console.log('3️⃣ Migrating existing party names to parties table...');
      
      // Get unique party names from candidates
      const [existingParties] = await connection.query(`
        SELECT DISTINCT party_name 
        FROM candidates 
        WHERE party_name IS NOT NULL AND party_name != ''
      `);

      if (existingParties.length > 0) {
        console.log(`   Found ${existingParties.length} unique parties to migrate`);
        
        // Insert unique parties
        for (const party of existingParties) {
          const partyId = require('crypto').randomUUID();
          try {
            await connection.query(`
              INSERT INTO parties (id, name, description) 
              VALUES (?, ?, ?)
            `, [partyId, party.party_name, `Migrated from existing data`]);
            console.log(`   ✓ Migrated party: ${party.party_name}`);
          } catch (err) {
            if (err.code !== 'ER_DUP_ENTRY') {
              console.log(`   ⚠ Warning: Could not migrate ${party.party_name}: ${err.message}`);
            }
          }
        }
      } else {
        console.log('   No existing parties to migrate');
      }
      console.log('');
    }

    // Step 4: Add party_id column to candidates table
    if (!hasPartyId) {
      console.log('4️⃣ Adding party_id column to candidates table...');
      await connection.query(`
        ALTER TABLE candidates 
        ADD COLUMN party_id VARCHAR(36) NULL AFTER party_name
      `);
      console.log('✓ Added party_id column\n');

      // Step 5: Populate party_id based on party_name
      if (hasPartyName) {
        console.log('5️⃣ Linking candidates to parties...');
        await connection.query(`
          UPDATE candidates c
          INNER JOIN parties p ON c.party_name = p.name
          SET c.party_id = p.id
          WHERE c.party_name IS NOT NULL AND c.party_name != ''
        `);
        console.log('✓ Candidates linked to parties\n');
      }

      // Step 6: Add foreign key constraint
      console.log('6️⃣ Adding foreign key constraint...');
      await connection.query(`
        ALTER TABLE candidates 
        ADD CONSTRAINT fk_candidate_party 
        FOREIGN KEY (party_id) REFERENCES parties(id) 
        ON DELETE SET NULL
      `);
      console.log('✓ Foreign key constraint added\n');

      // Step 7: Add index for better performance
      console.log('7️⃣ Adding index for party_id...');
      await connection.query(`
        CREATE INDEX idx_candidate_party ON candidates(party_id)
      `);
      console.log('✓ Index added\n');
    } else {
      console.log('⚠ party_id column already exists, skipping migration\n');
    }

    // Step 8: Insert some default parties (optional)
    console.log('8️⃣ Adding default parties...');
    const defaultParties = [
      { name: 'Independent', description: 'Independent candidate without party affiliation' },
      { name: 'Democratic Party', description: 'Democratic political party' },
      { name: 'Republican Party', description: 'Republican political party' }
    ];

    for (const party of defaultParties) {
      const partyId = require('crypto').randomUUID();
      try {
        await connection.query(`
          INSERT INTO parties (id, name, description) 
          VALUES (?, ?, ?)
        `, [partyId, party.name, party.description]);
        console.log(`✓ Added default party: ${party.name}`);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`⚠ Party already exists: ${party.name}`);
        } else {
          console.log(`⚠ Warning: Could not add ${party.name}: ${err.message}`);
        }
      }
    }
    console.log('');

    await connection.end();
    console.log('✅ Party Management System migration completed successfully!\n');
    console.log('📋 Summary:');
    console.log('  - Created parties table');
    console.log('  - Added party_id to candidates table');
    console.log('  - Migrated existing party names');
    console.log('  - Added foreign key constraints');
    console.log('  - Added default parties');
    console.log('\n⚠️  Note: party_name column is kept for backward compatibility');
    console.log('   You can remove it later after verifying everything works.\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Error details:', error);
    await connection.end();
    process.exit(1);
  }
};

addPartySystem();
