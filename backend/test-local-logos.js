const { pool } = require('./config/database');
const Party = require('./models/Party');
const fs = require('fs');
const path = require('path');

async function testLocalLogos() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Local Logo System');
  console.log('='.repeat(60) + '\n');
  
  try {
    // Test 1: Check uploads folder
    console.log('1. Checking uploads folder...');
    const uploadsPath = path.join(__dirname, 'uploads');
    
    if (fs.existsSync(uploadsPath)) {
      const files = fs.readdirSync(uploadsPath).filter(f => f.endsWith('.png') || f.endsWith('.jpg'));
      console.log('   ✓ Uploads folder exists');
      console.log('   ✓ Found', files.length, 'image files:');
      files.forEach(file => console.log('     -', file));
    } else {
      console.log('   ✗ Uploads folder not found!');
      console.log('   → Create it: mkdir backend/uploads');
    }
    
    // Test 2: Check Express static middleware
    console.log('\n2. Checking Express configuration...');
    console.log('   ✓ Static middleware should be configured in server.js');
    console.log('   → app.use(\'/uploads\', express.static(path.join(__dirname, \'uploads\')))');
    
    // Test 3: Check database
    console.log('\n3. Checking database parties...');
    const result = await Party.getAll(1, 10);
    console.log(`   ✓ Found ${result.total} parties in database`);
    
    // Test 4: Check logo URLs
    console.log('\n4. Checking party logos...');
    if (result.parties.length === 0) {
      console.log('   → No parties found. Create some parties first.');
    } else {
      result.parties.forEach(party => {
        console.log(`\n   Party: ${party.name}`);
        console.log(`   Logo URL: ${party.logo || 'No logo'}`);
        if (party.logo) {
          const filename = party.logo.split('/uploads/')[1];
          const filePath = path.join(uploadsPath, filename);
          const exists = fs.existsSync(filePath);
          console.log(`   File exists: ${exists ? '✓ Yes' : '✗ No'}`);
        }
      });
    }
    
    // Test 5: Test URL generation
    console.log('\n5. Testing URL generation...');
    const testUrl = Party.generateLogoUrl('aap.png');
    console.log(`   Input: 'aap.png'`);
    console.log(`   Output: ${testUrl}`);
    console.log(`   Expected: http://localhost:5000/uploads/aap.png`);
    
    // Test 6: Instructions
    console.log('\n' + '='.repeat(60));
    console.log('Next Steps:');
    console.log('='.repeat(60));
    console.log('1. Ensure images exist in backend/uploads/');
    console.log('2. Test direct access: http://localhost:5000/uploads/aap.png');
    console.log('3. Create/update parties with logo filenames');
    console.log('4. View in frontend: http://localhost:3001/admin/parties');
    console.log('='.repeat(60) + '\n');
    
  } catch (error) {
    console.error('\n✗ Error:', error.message);
  }
  
  process.exit(0);
}

testLocalLogos();
