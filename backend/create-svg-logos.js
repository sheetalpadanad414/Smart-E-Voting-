const fs = require('fs');
const path = require('path');

// Create SVG images (simpler and always work)
const createSVG = (color, label) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="50" height="50" xmlns="http://www.w3.org/2000/svg">
  <rect width="50" height="50" fill="${color}"/>
  <text x="25" y="30" font-family="Arial" font-size="8" fill="white" text-anchor="middle">${label}</text>
</svg>`;
};

const logos = {
  'aap.svg': { color: '#0064C8', label: 'AAP' },
  'bjp.svg': { color: '#FF9933', label: 'BJP' },
  'congress.svg': { color: '#0096FF', label: 'INC' },
  'democratic.svg': { color: '#0064C8', label: 'DEM' },
  'republican.svg': { color: '#C80000', label: 'REP' },
  'green.svg': { color: '#009600', label: 'GRN' },
  'independent.svg': { color: '#808080', label: 'IND' },
  'default.svg': { color: '#646464', label: 'DEF' }
};

console.log('\n=== Creating SVG Logo Images ===\n');

const uploadsDir = path.join(__dirname, 'uploads');

for (const [filename, { color, label }] of Object.entries(logos)) {
  try {
    const svg = createSVG(color, label);
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, svg, 'utf8');
    console.log(`✓ Created: ${filename}`);
  } catch (error) {
    console.error(`✗ Failed: ${filename} - ${error.message}`);
  }
}

// Update database to use SVG files
console.log('\n=== Updating Database ===\n');

const { pool } = require('./config/database');

async function updateDatabase() {
  const connection = await pool.getConnection();
  
  try {
    await connection.query("UPDATE parties SET logo = 'aap.svg' WHERE name = 'Aam Aadmi Party'");
    await connection.query("UPDATE parties SET logo = 'bjp.svg' WHERE name = 'Bharatiya Janata Party'");
    await connection.query("UPDATE parties SET logo = 'congress.svg' WHERE name LIKE '%Congress%'");
    await connection.query("UPDATE parties SET logo = 'democratic.svg' WHERE name = 'Democratic Party'");
    await connection.query("UPDATE parties SET logo = 'republican.svg' WHERE name = 'Republican Party'");
    await connection.query("UPDATE parties SET logo = 'green.svg' WHERE name = 'Green Party'");
    await connection.query("UPDATE parties SET logo = 'independent.svg' WHERE name = 'Independent'");
    
    console.log('✓ Database updated with SVG filenames');
  } catch (error) {
    console.error('✗ Database update failed:', error.message);
  } finally {
    connection.release();
  }
}

updateDatabase().then(() => {
  console.log('\n=== Complete ===');
  console.log('\nTest: http://localhost:5000/uploads/aap.svg');
  console.log('View: http://localhost:3000/admin/parties');
  console.log('\nRefresh your browser (F5) to see logos!\n');
  process.exit(0);
});
