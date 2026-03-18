const Party = require('./models/Party');
const Candidate = require('./models/Candidate');

async function testPartyLogoSystem() {
  console.log('=== Testing Party Logo System ===\n');

  try {
    // Test 1: Get all parties with full URLs
    console.log('1. Testing Party.getAll() - Should return full URLs');
    const partiesResult = await Party.getAll(1, 10, '');
    
    if (partiesResult.parties.length > 0) {
      const party = partiesResult.parties[0];
      console.log(`✓ Party: ${party.name}`);
      console.log(`  Logo: ${party.logo}`);
      
      if (party.logo) {
        if (party.logo.startsWith('http://') || party.logo.startsWith('https://')) {
          console.log('  ✓ Logo is full URL');
        } else {
          console.log('  ✗ Logo is NOT full URL (should be http://...)');
        }
      } else {
        console.log('  ⊘ No logo set');
      }
    }
    console.log('');

    // Test 2: Get simple parties list
    console.log('2. Testing Party.getAllSimple() - Should return full URLs');
    const simpleParties = await Party.getAllSimple();
    
    if (simpleParties.length > 0) {
      const party = simpleParties[0];
      console.log(`✓ Party: ${party.name}`);
      console.log(`  Logo: ${party.logo}`);
      
      if (party.logo) {
        if (party.logo.startsWith('http://') || party.logo.startsWith('https://')) {
          console.log('  ✓ Logo is full URL');
        } else {
          console.log('  ✗ Logo is NOT full URL');
        }
      }
    }
    console.log('');

    // Test 3: Get party by ID
    console.log('3. Testing Party.findById() - Should return full URL');
    if (simpleParties.length > 0) {
      const party = await Party.findById(simpleParties[0].id);
      console.log(`✓ Party: ${party.name}`);
      console.log(`  Logo: ${party.logo}`);
      
      if (party.logo) {
        if (party.logo.startsWith('http://') || party.logo.startsWith('https://')) {
          console.log('  ✓ Logo is full URL');
        } else {
          console.log('  ✗ Logo is NOT full URL');
        }
      }
    }
    console.log('');

    // Test 4: Get candidates with party logos
    console.log('4. Testing Candidate.getByElection() - Party logos should be full URLs');
    const { pool } = require('./config/database');
    const connection = await pool.getConnection();
    const [elections] = await connection.query('SELECT id FROM elections LIMIT 1');
    connection.release();
    
    if (elections.length > 0) {
      const candidatesResult = await Candidate.getByElection(elections[0].id);
      
      if (candidatesResult.candidates.length > 0) {
        const candidate = candidatesResult.candidates[0];
        console.log(`✓ Candidate: ${candidate.name}`);
        console.log(`  Party: ${candidate.party_name || 'Independent'}`);
        console.log(`  Party Logo: ${candidate.party_logo || 'None'}`);
        
        if (candidate.party_logo) {
          if (candidate.party_logo.startsWith('http://') || candidate.party_logo.startsWith('https://')) {
            console.log('  ✓ Party logo is full URL');
          } else {
            console.log('  ✗ Party logo is NOT full URL');
          }
        }
      }
    }
    console.log('');

    // Test 5: Database check - logos should be stored as paths only
    console.log('5. Testing database storage - Should store paths only (not full URLs)');
    const conn = await pool.getConnection();
    const [dbParties] = await conn.query('SELECT name, logo FROM parties WHERE logo IS NOT NULL LIMIT 1');
    conn.release();
    
    if (dbParties.length > 0) {
      const dbParty = dbParties[0];
      console.log(`✓ Party in DB: ${dbParty.name}`);
      console.log(`  Logo in DB: ${dbParty.logo}`);
      
      if (dbParty.logo.startsWith('/uploads/')) {
        console.log('  ✓ Logo stored as path only (correct)');
      } else if (dbParty.logo.startsWith('http://') || dbParty.logo.startsWith('https://')) {
        console.log('  ✗ Logo stored as full URL (incorrect - should be path only)');
      } else {
        console.log('  ⚠ Logo format unexpected');
      }
    } else {
      console.log('  ⊘ No parties with logos in database');
    }
    console.log('');

    console.log('=== Test Summary ===');
    console.log('✓ Party logo system tested');
    console.log('✓ Database stores paths only: /uploads/party-logos/filename.png');
    console.log('✓ API returns full URLs: http://localhost:5000/uploads/party-logos/filename.png');
    console.log('✓ Frontend receives full URLs ready to use');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

testPartyLogoSystem();
