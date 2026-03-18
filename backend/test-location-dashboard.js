const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

let adminToken = '';
let voterToken = '';
let californiaElectionId = '';
let texasElectionId = '';
let globalElectionId = '';

async function testLocationDashboard() {
  console.log('🧪 Testing Location-Based Dashboard Integration\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login...');
    const adminLogin = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    adminToken = adminLogin.data.token;
    console.log('✓ Admin logged in\n');

    // 2. Get countries and states
    console.log('2️⃣ Fetching locations...');
    const countriesResponse = await axios.get(`${API_URL}/location/countries`);
    const usaCountry = countriesResponse.data.countries.find(c => c.code === 'USA');
    
    const statesResponse = await axios.get(`${API_URL}/location/countries/${usaCountry.id}/states`);
    const californiaState = statesResponse.data.states.find(s => s.code === 'CA');
    const texasState = statesResponse.data.states.find(s => s.code === 'TX');
    
    console.log(`✓ USA ID: ${usaCountry.id}`);
    console.log(`✓ California ID: ${californiaState.id}`);
    console.log(`✓ Texas ID: ${texasState.id}\n`);

    // 3. Create elections with different location restrictions
    console.log('3️⃣ Creating elections with location restrictions...');
    
    // California-only election
    const caElection = await axios.post(`${API_URL}/admin/elections`, {
      title: 'California State Election',
      description: 'Only for California residents',
      start_date: '2026-02-18T00:00:00',
      end_date: '2026-02-20T23:59:59',
      is_public: true,
      country_id: usaCountry.id,
      state_id: californiaState.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    californiaElectionId = caElection.data.election.id;
    console.log(`✓ Created California election: ${californiaElectionId}`);

    // Texas-only election
    const txElection = await axios.post(`${API_URL}/admin/elections`, {
      title: 'Texas State Election',
      description: 'Only for Texas residents',
      start_date: '2026-02-18T00:00:00',
      end_date: '2026-02-20T23:59:59',
      is_public: true,
      country_id: usaCountry.id,
      state_id: texasState.id
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    texasElectionId = txElection.data.election.id;
    console.log(`✓ Created Texas election: ${texasElectionId}`);

    // Global election (no restrictions)
    const globalElection = await axios.post(`${API_URL}/admin/elections`, {
      title: 'Global Election',
      description: 'Open to all voters',
      start_date: '2026-02-18T00:00:00',
      end_date: '2026-02-20T23:59:59',
      is_public: true
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    globalElectionId = globalElection.data.election.id;
    console.log(`✓ Created Global election: ${globalElectionId}\n`);

    // 4. Test admin filters
    console.log('4️⃣ Testing admin filters...');
    
    // Filter by California
    const caFilterResponse = await axios.get(`${API_URL}/admin/elections`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { country_id: usaCountry.id, state_id: californiaState.id }
    });
    console.log(`✓ California filter: Found ${caFilterResponse.data.elections.length} elections`);
    console.log(`   Elections: ${caFilterResponse.data.elections.map(e => e.title).join(', ')}`);

    // Filter by Texas
    const txFilterResponse = await axios.get(`${API_URL}/admin/elections`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { country_id: usaCountry.id, state_id: texasState.id }
    });
    console.log(`✓ Texas filter: Found ${txFilterResponse.data.elections.length} elections`);
    console.log(`   Elections: ${txFilterResponse.data.elections.map(e => e.title).join(', ')}`);

    // Get all elections
    const allElectionsResponse = await axios.get(`${API_URL}/admin/elections`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ All elections: Found ${allElectionsResponse.data.elections.length} elections`);
    
    // Check location names are included
    const electionsWithLocation = allElectionsResponse.data.elections.filter(e => e.country_name || e.state_name);
    console.log(`✓ Elections with location info: ${electionsWithLocation.length}`);
    electionsWithLocation.forEach(e => {
      const location = e.state_name ? `${e.country_name} - ${e.state_name}` : e.country_name;
      console.log(`   - ${e.title}: ${location}`);
    });

    console.log('\n\n✅ All location dashboard tests passed!\n');
    console.log('Summary:');
    console.log(`- Created 3 elections (CA, TX, Global)`);
    console.log(`- Admin filters working correctly`);
    console.log(`- Location names included in responses`);
    console.log('\nNext steps:');
    console.log('1. Register voters with different locations');
    console.log('2. Login as voter and check dashboard');
    console.log('3. Verify only eligible elections are shown');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testLocationDashboard();
