const { pool } = require('./config/database');
const { generateUUID } = require('./utils/auth');

/**
 * Create sample parties with local logo filenames
 * Make sure the corresponding image files exist in backend/uploads/
 */
async function createSampleParties() {
  console.log('\n=== Creating Sample Parties with Local Logos ===\n');
  
  const connection = await pool.getConnection();
  
  const parties = [
    {
      name: 'Aam Aadmi Party',
      logo: 'aap.png',
      description: 'Indian political party focused on anti-corruption'
    },
    {
      name: 'Bharatiya Janata Party',
      logo: 'bjp.png',
      description: 'Indian right-wing political party'
    },
    {
      name: 'Indian National Congress',
      logo: 'congress.png',
      description: 'Indian political party, one of the oldest in the world'
    },
    {
      name: 'Democratic Party',
      logo: 'democratic.png',
      description: 'American center-left political party'
    },
    {
      name: 'Republican Party',
      logo: 'republican.png',
      description: 'American center-right political party'
    },
    {
      name: 'Green Party',
      logo: 'green.png',
      description: 'Environmental and social justice political party'
    },
    {
      name: 'Independent',
      logo: 'independent.png',
      description: 'Independent candidates without party affiliation'
    }
  ];
  
  try {
    for (const party of parties) {
      const id = generateUUID();
      
      try {
        await connection.query(
          'INSERT INTO parties (id, name, logo, description) VALUES (?, ?, ?, ?)',
          [id, party.name, party.logo, party.description]
        );
        console.log(`✓ Created: ${party.name} (${party.logo})`);
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`  Skipped: ${party.name} (already exists)`);
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n=== Sample Parties Created ===');
    console.log('\nIMPORTANT: Make sure these image files exist in backend/uploads/:');
    parties.forEach(p => console.log(`  - ${p.logo}`));
    console.log('\nView at: http://localhost:3001/admin/parties\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createSampleParties();
