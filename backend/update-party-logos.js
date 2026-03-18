const { pool } = require('./config/database');

/**
 * Update existing parties with local logo filenames
 * This script updates parties to use local image files instead of external URLs
 */
async function updatePartyLogos() {
  console.log('\n=== Updating Party Logos to Local Files ===\n');
  
  const connection = await pool.getConnection();
  
  try {
    // Mapping of party names to local logo filenames
    const logoMappings = [
      { name: 'Aam Aadmi Party', logo: 'aap.png' },
      { name: 'Bharatiya Janata Party', logo: 'bjp.png' },
      { name: 'Indian National Congress', logo: 'congress.png' },
      { name: 'Democratic Party', logo: 'democratic.png' },
      { name: 'Republican Party', logo: 'republican.png' },
      { name: 'Green Party', logo: 'green.png' },
      { name: 'Independent', logo: 'independent.png' }
    ];
    
    for (const mapping of logoMappings) {
      const [result] = await connection.query(
        'UPDATE parties SET logo = ? WHERE name = ?',
        [mapping.logo, mapping.name]
      );
      
      if (result.affectedRows > 0) {
        console.log(`✓ Updated: ${mapping.name} → ${mapping.logo}`);
      } else {
        console.log(`  Skipped: ${mapping.name} (not found)`);
      }
    }
    
    // Clear logos for parties without local files
    await connection.query(
      'UPDATE parties SET logo = NULL WHERE logo LIKE "http%"'
    );
    
    console.log('\n=== Update Complete ===');
    console.log('\nVerify by running: node test-local-logos.js\n');
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    connection.release();
    process.exit(0);
  }
}

updatePartyLogos();
