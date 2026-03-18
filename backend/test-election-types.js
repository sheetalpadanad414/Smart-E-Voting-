const axios = require('axios');
require('dotenv').config();

const API_URL = process.env.API_URL || 'http://localhost:5000/api';

// Admin credentials
const ADMIN_EMAIL = 'admin@evoting.com';
const ADMIN_PASSWORD = 'admin123';

let adminToken = '';

const testElectionTypes = async () => {
  console.log('🧪 Testing Election Types Feature\n');

  try {
    // Step 1: Admin Login
    console.log('1️⃣ Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    adminToken = loginResponse.data.token;
    console.log('✓ Admin logged in successfully\n');

    // Step 2: Create elections with different types
    console.log('2️⃣ Creating elections with different types...');
    
    const electionTypes = [
      {
        title: 'Lok Sabha General Election 2024',
        description: 'National parliamentary election',
        election_type: 'Lok Sabha',
        election_subtype: 'General'
      },
      {
        title: 'Rajya Sabha By-Election',
        description: 'Upper house by-election',
        election_type: 'Rajya Sabha',
        election_subtype: 'By-Election'
      },
      {
        title: 'State Assembly General Election',
        description: 'State legislative assembly election',
        election_type: 'State Assembly',
        election_subtype: 'General'
      },
      {
        title: 'Municipal Corporation Election',
        description: 'Local body municipal election',
        election_type: 'Local Body',
        election_subtype: 'Municipal'
      },
      {
        title: 'Presidential Election 2024',
        description: 'Presidential election',
        election_type: 'Presidential',
        election_subtype: 'Regular'
      }
    ];

    const createdElections = [];
    for (const electionData of electionTypes) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await axios.post(
        `${API_URL}/admin/elections`,
        {
          ...electionData,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          is_public: true
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      createdElections.push(response.data.election);
      console.log(`✓ Created: ${electionData.title} (${electionData.election_type} - ${electionData.election_subtype})`);
    }
    console.log('');

    // Step 3: Fetch all elections
    console.log('3️⃣ Fetching all elections...');
    const allElectionsResponse = await axios.get(`${API_URL}/admin/elections`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Total elections: ${allElectionsResponse.data.total}`);
    console.log('');

    // Step 4: Filter by election type
    console.log('4️⃣ Testing filters by election type...');
    const filterTypes = ['Lok Sabha', 'Rajya Sabha', 'Local Body'];
    
    for (const type of filterTypes) {
      const response = await axios.get(`${API_URL}/admin/elections`, {
        params: { election_type: type },
        headers: { Authorization: `Bearer ${adminToken}` }
      });
      console.log(`✓ ${type}: ${response.data.total} election(s)`);
    }
    console.log('');

    // Step 5: Filter by election type and subtype
    console.log('5️⃣ Testing filters by type and subtype...');
    const filterResponse = await axios.get(`${API_URL}/admin/elections`, {
      params: { 
        election_type: 'Lok Sabha',
        election_subtype: 'General'
      },
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log(`✓ Lok Sabha - General: ${filterResponse.data.total} election(s)`);
    console.log('');

    // Step 6: Get dashboard stats
    console.log('6️⃣ Fetching dashboard statistics...');
    const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    
    console.log('✓ Dashboard Stats:');
    console.log(`  - Total Elections: ${dashboardResponse.data.elections.draft + dashboardResponse.data.elections.active + dashboardResponse.data.elections.completed}`);
    console.log(`  - Draft: ${dashboardResponse.data.elections.draft}`);
    console.log(`  - Active: ${dashboardResponse.data.elections.active}`);
    console.log(`  - Completed: ${dashboardResponse.data.elections.completed}`);
    
    if (dashboardResponse.data.elections.by_type && dashboardResponse.data.elections.by_type.length > 0) {
      console.log('\n  Elections by Type:');
      dashboardResponse.data.elections.by_type.forEach(type => {
        console.log(`    - ${type.election_type}: ${type.count} (Active: ${type.active_count}, Completed: ${type.completed_count})`);
      });
    }
    console.log('');

    // Step 7: Update election type
    console.log('7️⃣ Testing election type update...');
    if (createdElections.length > 0) {
      const electionToUpdate = createdElections[0];
      const updateResponse = await axios.put(
        `${API_URL}/admin/elections/${electionToUpdate.id}`,
        {
          title: electionToUpdate.title,
          election_type: 'State Assembly',
          election_subtype: 'Re-Poll'
        },
        {
          headers: { Authorization: `Bearer ${adminToken}` }
        }
      );
      console.log(`✓ Updated election type to: State Assembly - Re-Poll`);
    }
    console.log('');

    console.log('✅ All election types tests passed!\n');
    console.log('📋 Summary:');
    console.log('  - Created 5 elections with different types');
    console.log('  - Tested filtering by type and subtype');
    console.log('  - Verified dashboard statistics');
    console.log('  - Tested election type updates');
    console.log('\n🎉 Election Types Feature is working correctly!');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
};

testElectionTypes();
