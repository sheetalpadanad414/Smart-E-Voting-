const { pool } = require('./config/database');

async function checkParties() {
  const connection = await pool.getConnection();
  
  try {
    const [parties] = await connection.query(
      'SELECT id, name, logo FROM parties WHERE name LIKE ? OR name LIKE ? OR name LIKE ?',
      ['%Congress%', '%BJP%', '%Aam%']
    );
    
    console.log('\n=== Indian Political Parties ===\n');
    
    if (parties.length === 0) {
      console.log('No Indian parties found. Run: node add-parties-with-urls.js');
    } else {
      parties.forEach(party => {
        console.log(`Name: ${party.name}`);
        console.log(`Logo: ${party.logo || 'No logo'}`);
        console.log('---');
      });
    }
    
    connection.release();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    connection.release();
    process.exit(1);
  }
}

checkParties();
