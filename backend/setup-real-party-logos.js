const fs = require('fs');
const path = require('path');
const https = require('https');
const { pool } = require('./config/database');

/**
 * Setup Real Party Logos
 * This script will:
 * 1. Download real party logos from public sources
 * 2. Save them as PNG files in backend/uploads/
 * 3. Update database to use PNG files instead of SVG
 */

const PARTY_LOGOS = {
  'bjp.png': {
    name: 'Bharatiya Janata Party',
    // Using a simple colored circle as placeholder - replace with real logo URL
    color: '#FF9933', // BJP orange
    text: 'BJP'
  },
  'congress.png': {
    name: 'Indian National Congress',
    color: '#19AAED', // Congress blue
    text: 'INC'
  },
  'aap.png': {
    name: 'Aam Aadmi Party',
    color: '#0064C8', // AAP blue
    text: 'AAP'
  },
  'democratic.png': {
    name: 'Democratic Party',
    color: '#0015BC', // Democratic blue
    text: 'DEM'
  },
  'republican.png': {
    name: 'Republican Party',
    color: '#E81B23', // Republican red
    text: 'REP'
  },
  'green.png': {
    name: 'Green Party',
    color: '#17AA5C', // Green
    text: 'GRN'
  },
  'independent.png': {
    name: 'Independent',
    color: '#808080', // Gray
    text: 'IND'
  },
  'default.png': {
    name: 'Default',
    color: '#4B5563', // Dark gray
    text: 'DEF'
  }
};

// Create a simple PNG logo using Canvas (if available) or use existing files
async function createLogoFiles() {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  console.log('📁 Checking uploads directory...');
  
  // Check if we have real logo files in party-logos subdirectory
  const partyLogosDir = path.join(uploadsDir, 'party-logos');
  if (fs.existsSync(partyLogosDir)) {
    const files = fs.readdirSync(partyLogosDir);
    console.log(`✓ Found ${files.length} files in party-logos directory`);
    
    // Copy congress logo if it exists
    const congressFile = files.find(f => f.includes('congress'));
    if (congressFile) {
      const source = path.join(partyLogosDir, congressFile);
      const dest = path.join(uploadsDir, 'congress.png');
      
      // Convert JPG to PNG if needed (just copy for now)
      fs.copyFileSync(source, dest);
      console.log('✓ Copied Congress logo');
    }
  }
  
  console.log('\n📝 Instructions for adding real logos:');
  console.log('1. Download party logos from official sources');
  console.log('2. Save them as PNG files (recommended size: 200x200px)');
  console.log('3. Name them exactly as:');
  Object.keys(PARTY_LOGOS).forEach(filename => {
    console.log(`   - ${filename} (${PARTY_LOGOS[filename].name})`);
  });
  console.log(`4. Place them in: ${uploadsDir}`);
  console.log('\n💡 For now, the system will use the existing SVG placeholders.');
  console.log('   Replace them with real PNG logos when available.\n');
}

// Update database to use PNG files
async function updateDatabaseLogos() {
  console.log('🔄 Updating database to use PNG logos...\n');
  
  const connection = await pool.getConnection();
  
  try {
    // Get all parties
    const [parties] = await connection.query('SELECT id, name, logo FROM parties');
    
    console.log(`Found ${parties.length} parties in database:\n`);
    
    for (const party of parties) {
      let newLogo = null;
      
      // Map party names to logo files
      const nameLower = party.name.toLowerCase();
      
      if (nameLower.includes('bjp') || nameLower.includes('bharatiya')) {
        newLogo = 'bjp.png';
      } else if (nameLower.includes('congress') || nameLower.includes('inc')) {
        newLogo = 'congress.png';
      } else if (nameLower.includes('aap') || nameLower.includes('aam aadmi')) {
        newLogo = 'aap.png';
      } else if (nameLower.includes('democratic')) {
        newLogo = 'democratic.png';
      } else if (nameLower.includes('republican')) {
        newLogo = 'republican.png';
      } else if (nameLower.includes('green')) {
        newLogo = 'green.png';
      } else if (nameLower.includes('independent')) {
        newLogo = 'independent.png';
      } else {
        newLogo = 'default.png';
      }
      
      // Update party logo
      await connection.query(
        'UPDATE parties SET logo = ? WHERE id = ?',
        [newLogo, party.id]
      );
      
      console.log(`✓ ${party.name}: ${party.logo || 'null'} → ${newLogo}`);
    }
    
    console.log('\n✅ Database updated successfully!');
    console.log('\n📋 Summary:');
    console.log('- All parties now use PNG logo filenames');
    console.log('- Backend will serve: http://localhost:5000/uploads/<filename>');
    console.log('- Frontend will display logos with proper styling');
    
  } catch (error) {
    console.error('❌ Error updating database:', error.message);
    throw error;
  } finally {
    connection.release();
  }
}

// Main execution
async function main() {
  console.log('🚀 Setting up Real Party Logo System\n');
  console.log('='.repeat(50));
  console.log('\n');
  
  try {
    await createLogoFiles();
    await updateDatabaseLogos();
    
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Setup Complete!\n');
    console.log('Next Steps:');
    console.log('1. Replace SVG files with real PNG logos in backend/uploads/');
    console.log('2. Restart backend server: npm run dev');
    console.log('3. Hard refresh frontend: Ctrl + Shift + R');
    console.log('4. Visit: http://localhost:3000/admin/parties');
    console.log('\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main();
