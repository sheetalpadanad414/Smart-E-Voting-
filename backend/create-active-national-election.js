const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function createActiveElection() {
  console.log('🗳️  Creating Active National Election for Vote Now Button Test\n');

  try {
    // Admin Login
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.data.token;
    console.log('✅ Logged in\n');

    // Create active election
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    // Format dates for datetime-local input (YYYY-MM-DDTHH:MM)
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    const electionData = {
      title: `Active Lok Sabha Election ${today.getFullYear()}`,
      description: 'This is an active election for testing the Vote Now button',
      start_date: formatDate(today),
      end_date: formatDate(futureDate),
      election_type: 'Lok Sabha',
      election_subtype: 'General',
      is_public: true
    };

    console.log('2️⃣ Creating election...');
    console.log(`   Title: ${electionData.title}`);
    console.log(`   Type: ${electionData.election_type}`);
    console.log(`   Start: ${electionData.start_date}`);
    console.log(`   End: ${electionData.end_date}`);
    
    const createResponse = await axios.post(
      `${BASE_URL}/admin/elections`,
      electionData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const election = createResponse.data.election;
    console.log('\n✅ Election created!');
    console.log(`   ID: ${election.id}`);
    console.log(`   Status: ${election.status}`);

    // Activate if draft
    if (election.status === 'draft') {
      console.log('\n3️⃣ Activating election...');
      await axios.put(
        `${BASE_URL}/admin/elections/${election.id}`,
        { status: 'active' },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('✅ Election activated!');
    }

    console.log('\n🎉 Success! Now:');
    console.log('   1. Go to: http://localhost:3000/user/elections?category=National');
    console.log('   2. You should see the green "Vote Now" button');
    console.log('\n⚠️  Note: Add candidates before voting!');

  } catch (error) {
    console.error('\n❌ Error:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

createActiveElection();
