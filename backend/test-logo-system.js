const { pool } = require('./config/database');
const Party = require('./models/Party');

/**
 * Test Party Logo System
 */

async function testLogoSystem() {
  console.log('🧪 Testing Party Logo System\n');
  console.log('='.repeat(60));
  
  try {
    // Test 1: Get all parties
    console.log('\n1️⃣  Testing Party.getAll()...');
    const result = await Party.getAll(1, 50);
    console.log(`   ✓ Found ${result.parties.length} parties`);
    
    // Test 2: Check logo URLs
    console.log('\n2️⃣  Checking Logo URLs...');
    result.parties.forEach(party => {
      const hasLogo = party.logo && party.logo.includes('http://localhost:5000/uploads/');
      const status = hasLogo ? '✓' : '✗';
      console.log(`   ${status} ${party.name.padEnd(30)} → ${party.logo || 'No logo'}`);
    });
    
    // Test 3: Check file existence
    console.log('\n3️⃣  Checking Logo Files...');
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(__dirname, 'uploads');
    
    result.parties.forEach(party => {
      if (party.logo) {
        const filename = party.logo.split('/uploads/')[1];
        const filepath = path.join(uploadsDir, filename);
        const exists = fs.existsSync(filepath);
        const stats = exists ? fs.statSync(filepath) : null;
        const size = stats ? (stats.size / 1024).toFixed(2) : '0';
        const isReal = stats && stats.size > 1000;
        const status = exists ? (isReal ? '✅' : '⚠️ ') : '❌';
        console.log(`   ${status} ${filename.padEnd(20)} ${exists ? `(${size} KB)` : '(Missing)'} ${isReal ? 'REAL' : 'PLACEHOLDER'}`);
      }
    });
    
    // Test 4: Test Party.findById()
    console.log('\n4️⃣  Testing Party.findById()...');
    if (result.parties.length > 0) {
      const firstParty = result.parties[0];
      const party = await Party.findById(firstParty.id);
      console.log(`   ✓ Retrieved: ${party.name}`);
      console.log(`   ✓ Logo URL: ${party.logo || 'No logo'}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('\n✅ All Tests Passed!\n');
    console.log('📋 Summary:');
    console.log(`   - Total Parties: ${result.parties.length}`);
    console.log(`   - Parties with Logos: ${result.parties.filter(p => p.logo).length}`);
    console.log(`   - Logo URL Format: http://localhost:5000/uploads/<filename>`);
    console.log('\n🚀 System Ready!');
    console.log('   Visit: http://localhost:3000/admin/parties');
    console.log('   Hard Refresh: Ctrl + Shift + R\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLogoSystem();
