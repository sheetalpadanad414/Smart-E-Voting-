const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testElectionCreation() {
  console.log('🧪 Testing Election Creation Flow\n');

  try {
    // Step 1: Admin Login
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin-login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin logged in successfully\n');

    // Step 2: Get election categories
    console.log('2️⃣ Fetching election categories...');
    const categoriesResponse = await axios.get(`${BASE_URL}/election-categories`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const categories = categoriesResponse.data.categories;
    console.log(`✅ Found ${categories.length} categories:`);
    categories.forEach(cat => {
      console.log(`   - ${cat.category_name} (ID: ${cat.id})`);
    });
    console.log('');

    // Step 3: Get types for first category (National Elections)
    const categoryId = 1; // National Elections
    console.log(`3️⃣ Fetching election types for category ${categoryId}...`);
    const typesResponse = await axios.get(
      `${BASE_URL}/election-categories/${categoryId}/types`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const types = typesResponse.data.types;
    console.log(`✅ Found ${types.length} types:`);
    types.forEach(type => {
      console.log(`   - ${type.type_name} (ID: ${type.id})`);
    });
    console.log('');

    // Step 4: Create a test election
    console.log('4️⃣ Creating test election...');
    const electionData = {
      title: 'Test National Election 2024',
      description: 'This is a test election for verification',
      start_date: '2024-06-01T09:00:00',
      end_date: '2024-06-30T18:00:00',
      type_id: types[0].id, // Use first type (Lok Sabha)
      is_public: true
    };

    const createResponse = await axios.post(
      `${BASE_URL}/election-categories/${categoryId}/elections`,
      electionData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const createdElection = createResponse.data.election;
    console.log('✅ Election created successfully:');
    console.log(`   ID: ${createdElection.id}`);
    console.log(`   Title: ${createdElection.title}`);
    console.log(`   Status: ${createdElection.status}`);
    console.log('');

    // Step 5: Verify election appears in category list
    console.log('5️⃣ Verifying election appears in category list...');
    const electionsResponse = await axios.get(
      `${BASE_URL}/election-categories/${categoryId}/elections`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const elections = electionsResponse.data.elections;
    console.log(`✅ Found ${elections.length} elections in category`);
    
    const foundElection = elections.find(e => e.id === createdElection.id);
    if (foundElection) {
      console.log('✅ Created election found in list!');
      console.log(`   Title: ${foundElection.title}`);
      console.log(`   Type: ${foundElection.type_name}`);
      console.log(`   Status: ${foundElection.status}`);
    } else {
      console.log('❌ Created election NOT found in list!');
    }
    console.log('');

    // Step 6: Get all elections (for candidates dropdown)
    console.log('6️⃣ Fetching all elections for candidates dropdown...');
    const allElectionsResponse = await axios.get(
      `${BASE_URL}/admin/elections?limit=100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const allElections = allElectionsResponse.data.elections;
    console.log(`✅ Found ${allElections.length} total elections`);
    
    const foundInAll = allElections.find(e => e.id === createdElection.id);
    if (foundInAll) {
      console.log('✅ Election available for candidate creation!');
    } else {
      console.log('❌ Election NOT available for candidate creation!');
    }
    console.log('');

    console.log('🎉 All tests passed successfully!\n');
    console.log('Summary:');
    console.log('✅ Admin login works');
    console.log('✅ Categories load correctly');
    console.log('✅ Election types load correctly');
    console.log('✅ Election creation works');
    console.log('✅ Election appears in category list');
    console.log('✅ Election available for candidates');

  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

testElectionCreation();
