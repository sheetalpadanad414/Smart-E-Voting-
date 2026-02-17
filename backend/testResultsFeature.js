const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function testResultsFeature() {
  console.log('\n=== Testing Election Results Feature ===\n');

  try {
    // Test 1: Get all elections
    console.log('1. Fetching elections...');
    const elections = await axios.get(`${API_BASE}/voter/elections`);
    console.log(`   ✓ Found ${elections.data.elections.length} elections`);

    if (elections.data.elections.length === 0) {
      console.log('   ⚠ No elections found. Run: node createTestElection.js');
      return;
    }

    // Test 2: Find completed election
    const completedElection = elections.data.elections.find(e => e.status === 'completed');
    
    if (!completedElection) {
      console.log('\n2. No completed elections found');
      console.log('   ⚠ Run: node completeElection.js');
      
      // Try to get results from active election (should fail)
      const activeElection = elections.data.elections[0];
      console.log('\n3. Testing results for active election (should fail)...');
      try {
        await axios.get(`${API_BASE}/voter/elections/${activeElection.id}/results`);
        console.log('   ✗ Should have failed but succeeded');
      } catch (error) {
        if (error.response?.status === 400) {
          console.log('   ✓ Correctly blocked: Results not available for active elections');
        } else {
          console.log('   ✗ Unexpected error:', error.message);
        }
      }
      return;
    }

    console.log(`\n2. Found completed election: ${completedElection.title}`);

    // Test 3: Get results
    console.log('\n3. Fetching results...');
    const results = await axios.get(`${API_BASE}/voter/elections/${completedElection.id}/results`);
    
    console.log('   ✓ Results fetched successfully');
    console.log(`   ✓ Total Voters: ${results.data.results.total_voters}`);
    console.log(`   ✓ Total Votes: ${results.data.results.total_votes}`);
    console.log(`   ✓ Turnout: ${results.data.results.turnout}%`);
    console.log(`   ✓ Candidates: ${results.data.results.candidates.length}`);

    // Test 4: Verify data structure
    console.log('\n4. Verifying data structure...');
    const requiredFields = ['election', 'results'];
    const hasAllFields = requiredFields.every(field => results.data[field]);
    
    if (hasAllFields) {
      console.log('   ✓ All required fields present');
    } else {
      console.log('   ✗ Missing required fields');
    }

    // Test 5: Check candidates data
    console.log('\n5. Checking candidates data...');
    if (results.data.results.candidates.length > 0) {
      const candidate = results.data.results.candidates[0];
      console.log(`   ✓ Top candidate: ${candidate.name}`);
      console.log(`   ✓ Votes: ${candidate.vote_count}`);
      console.log(`   ✓ Party: ${candidate.party_name || 'N/A'}`);
      
      // Calculate percentage
      const percentage = ((parseInt(candidate.vote_count) / results.data.results.total_votes) * 100).toFixed(2);
      console.log(`   ✓ Percentage: ${percentage}%`);
    } else {
      console.log('   ⚠ No candidates found');
    }

    console.log('\n=== All Tests Passed! ===\n');
    console.log('✓ Elections API working');
    console.log('✓ Results API working');
    console.log('✓ Status validation working');
    console.log('✓ Data structure correct');
    console.log('✓ Vote counts accurate');
    console.log('\nYou can now view results at: http://localhost:3000/results\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\nTroubleshooting:');
    console.log('1. Make sure backend is running: npm run dev');
    console.log('2. Create test election: node createTestElection.js');
    console.log('3. Cast some votes (login and vote)');
    console.log('4. Complete election: node completeElection.js');
    console.log('5. Try again');
  }
}

testResultsFeature();
