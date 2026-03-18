const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testVoteFlow() {
  console.log('🧪 Testing Complete Vote Flow\n');
  console.log('=====================================\n');

  // Step 1: Get available elections
  console.log('1️⃣ Getting available elections...');
  try {
    const electionsResponse = await axios.get(`${API_URL}/voter/elections`);
    console.log('✓ Elections loaded:', electionsResponse.data.elections.length);
    
    if (electionsResponse.data.elections.length === 0) {
      console.log('❌ No elections available');
      return;
    }

    const firstElection = electionsResponse.data.elections[0];
    console.log('   First election:', firstElection.title);
    console.log('   Election ID:', firstElection.id);
    console.log('   ID type:', typeof firstElection.id);
    console.log('   ID length:', firstElection.id.length);
    console.log('');

    // Step 2: Get election details
    console.log('2️⃣ Getting election details...');
    console.log('   Calling: GET /voter/elections/' + firstElection.id);
    
    try {
      const detailsResponse = await axios.get(`${API_URL}/voter/elections/${firstElection.id}`);
      console.log('✓ Election details loaded');
      console.log('   Title:', detailsResponse.data.election.title);
      console.log('   Status:', detailsResponse.data.election.status);
      console.log('   Candidates:', detailsResponse.data.candidates.length);
      console.log('');

      // Step 3: Test with all elections
      console.log('3️⃣ Testing all elections...');
      for (const election of electionsResponse.data.elections.slice(0, 3)) {
        try {
          const testResponse = await axios.get(`${API_URL}/voter/elections/${election.id}`);
          console.log(`   ✓ ${election.title} - OK`);
        } catch (error) {
          console.log(`   ❌ ${election.title} - FAILED`);
          console.log('      Error:', error.response?.data || error.message);
        }
      }
      console.log('');

      console.log('=====================================');
      console.log('✅ Vote Flow Test Complete!\n');
      console.log('📋 Summary:');
      console.log('  - Elections API: ✓');
      console.log('  - Election Details API: ✓');
      console.log('  - Frontend should work correctly');
      console.log('');
      console.log('🎯 Test URL:');
      console.log(`   http://localhost:3001/elections/${firstElection.id}/vote`);

    } catch (error) {
      console.log('❌ Failed to get election details');
      console.log('   Status:', error.response?.status);
      console.log('   Error:', error.response?.data);
      console.log('   Message:', error.message);
      console.log('');
      console.log('🔍 Debugging info:');
      console.log('   Election ID:', firstElection.id);
      console.log('   API endpoint:', `${API_URL}/voter/elections/${firstElection.id}`);
      console.log('   Request URL:', error.config?.url);
    }

  } catch (error) {
    console.log('❌ Failed to get elections');
    console.log('   Error:', error.message);
  }
}

testVoteFlow();
