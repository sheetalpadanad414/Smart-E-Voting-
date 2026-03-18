const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createActiveElection() {
  console.log('🗳️  Creating Active National Election\n');

  try {
    // Step 1: Admin Login
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin-login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Admin logged in\n');

    // Step 2: Create an active election (starts today, ends in 30 days)
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const electionData = {
      title: 'Active Lok Sabha Election 2026',
      description: 'This is an active election for testing Vote Now button',
      start_date: today.toISOString().slice(0, 16), // Format: YYYY-MM-DDTHH:MM
      end_date: futureDate.toISOString().slice(0, 16),
      election_type: 'Lok Sabha',
      election_subtype: 'General',
      is_public: true
    };

    console.log('2️⃣ Creating active election...');
    console.log(`   Start: ${electionData.start_date}`);
    console.log(`   End: ${electionData.end_date}`);
    
    const createResponse = await axios.post(
      `${BASE_URL}/admin/elections`,
      electionData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const election = createResponse.data.election;
    console.log('✅ Election created successfully!');
    console.log(`   ID: ${election.id}`);
    console.log(`   Title: ${election.title}`);
    console.log(`   Status: ${election.status}`);
    console.log('');

    // Step 3: Update status to active (if it's draft)
    if (election.status === 'draft') {
      console.log('3️⃣ Activating election...');
      await axios.put(
        `${BASE_URL}/admin/elections/${election.id}`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Election activated!\n');
    }

    console.log('🎉 Success! Now you can:');
    console.log('   1. Go to http://localhost:3000/user/elections?category=National');
    console.log('   2. You should see the "Vote Now" button on the active election');
    console.log('');
    console.log('Note: Make sure to add candidates to this election before voting!');

  } catch (error) {
    console.error('\n❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data);
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

createActiveElection();
