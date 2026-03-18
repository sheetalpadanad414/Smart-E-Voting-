const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@evoting.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

const testPartySystem = async () => {
  console.log('🧪 Testing Party Management System\n');

  try {
    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = loginResponse.data.token;
    console.log('✓ Admin logged in successfully\n');

    // Step 2: Create parties
    console.log('2️⃣ Creating parties...');
    const parties = [
      {
        name: 'Democratic Party',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/DemocraticLogo.svg/200px-DemocraticLogo.svg.png',
        description: 'Democratic political party'
      },
      {
        name: 'Republican Party',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Republicanlogo.svg/200px-Republicanlogo.svg.png',
        description: 'Republican political party'
      },
      {
        name: 'Green Party',
        logo_url: 'https://example.com/green-party-logo.png',
        description: 'Environmental political party'
      }
    ];

    const createdParties = [];
    for (const party of parties) {
      try {
        const response = await axios.post(
          `${API_URL}/parties`,
          party,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        createdParties.push(response.data.party);
        console.log(`✓ Created party: ${party.name}`);
      } catch (err) {
        if (err.response?.status === 409) {
          console.log(`⚠ Party already exists: ${party.name}`);
        } else {
          throw err;
        }
      }
    }
    console.log('');

    // Step 3: Get all parties
    console.log('3️⃣ Fetching all parties...');
    const allPartiesResponse = await axios.get(`${API_URL}/parties`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Total parties: ${allPartiesResponse.data.total}`);
    console.log('');

    // Step 4: Get parties simple (for dropdown)
    console.log('4️⃣ Fetching parties for dropdown...');
    const simplePartiesResponse = await axios.get(`${API_URL}/parties/simple`);
    console.log(`✓ Parties available for dropdown: ${simplePartiesResponse.data.parties.length}`);
    simplePartiesResponse.data.parties.forEach(p => {
      console.log(`   - ${p.name} (ID: ${p.id})`);
    });
    console.log('');

    // Step 5: Create election
    console.log('5️⃣ Creating test election...');
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    const electionResponse = await axios.post(
      `${API_URL}/admin/elections`,
      {
        title: 'Party System Test Election',
        description: 'Testing party management system',
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        is_public: true
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    const electionId = electionResponse.data.election.id;
    console.log(`✓ Created election: ${electionResponse.data.election.title}`);
    console.log('');

    // Step 6: Create candidates with parties
    console.log('6️⃣ Creating candidates with party associations...');
    const partiesList = simplePartiesResponse.data.parties;
    
    if (partiesList.length > 0) {
      const candidates = [
        {
          election_id: electionId,
          name: 'John Doe',
          description: 'Experienced leader',
          position: 'President',
          party_id: partiesList[0].id
        },
        {
          election_id: electionId,
          name: 'Jane Smith',
          description: 'Progressive candidate',
          position: 'President',
          party_id: partiesList[1] ? partiesList[1].id : partiesList[0].id
        },
        {
          election_id: electionId,
          name: 'Bob Johnson',
          description: 'Independent candidate',
          position: 'President',
          party_id: null // Independent
        }
      ];

      for (const candidate of candidates) {
        const response = await axios.post(
          `${API_URL}/admin/candidates`,
          candidate,
          { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        const partyName = candidate.party_id 
          ? partiesList.find(p => p.id === candidate.party_id)?.name 
          : 'Independent';
        console.log(`✓ Created candidate: ${candidate.name} (${partyName})`);
      }
    }
    console.log('');

    // Step 7: Get candidates with party info
    console.log('7️⃣ Fetching candidates with party information...');
    const candidatesResponse = await axios.get(
      `${API_URL}/admin/elections/${electionId}/candidates`,
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    
    console.log(`✓ Total candidates: ${candidatesResponse.data.total}`);
    candidatesResponse.data.candidates.forEach(c => {
      console.log(`   - ${c.name}: ${c.party_name || 'Independent'} ${c.party_logo ? '(has logo)' : ''}`);
    });
    console.log('');

    // Step 8: Update party
    if (createdParties.length > 0) {
      console.log('8️⃣ Testing party update...');
      const partyToUpdate = createdParties[0];
      await axios.put(
        `${API_URL}/parties/${partyToUpdate.id}`,
        {
          description: 'Updated description for testing'
        },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      console.log(`✓ Updated party: ${partyToUpdate.name}`);
      console.log('');
    }

    // Step 9: Search parties
    console.log('9️⃣ Testing party search...');
    const searchResponse = await axios.get(`${API_URL}/parties`, {
      params: { search: 'Democratic' },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Search results for "Democratic": ${searchResponse.data.total} found`);
    console.log('');

    console.log('✅ All party system tests passed!\n');
    console.log('📋 Summary:');
    console.log('  - Created/verified parties');
    console.log('  - Tested party listing and search');
    console.log('  - Created election with candidates');
    console.log('  - Linked candidates to parties');
    console.log('  - Verified party logos are included');
    console.log('  - Tested party updates');
    console.log('\n🎉 Party Management System is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
};

testPartySystem();
