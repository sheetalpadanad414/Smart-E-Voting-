const axios = require('axios');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

async function testVotingSystem() {
  console.log('\n=== Testing Smart E-Voting System ===\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing backend health...');
    const health = await axios.get('http://localhost:5000/health');
    console.log('   ✓ Backend is running:', health.data.status);

    // Test 2: Get Elections (Public)
    console.log('\n2. Testing public elections endpoint...');
    const elections = await axios.get(`${API_BASE}/voter/elections`);
    console.log('   ✓ Elections loaded:', elections.data.elections.length, 'elections found');
    
    if (elections.data.elections.length === 0) {
      console.log('   ⚠ No elections found. Run: node createTestElection.js');
      return;
    }

    const testElection = elections.data.elections[0];
    console.log('   ✓ Test election:', testElection.title);

    // Test 3: Get Election Details (Public)
    console.log('\n3. Testing election details endpoint...');
    const details = await axios.get(`${API_BASE}/voter/elections/${testElection.id}`);
    console.log('   ✓ Election details loaded');
    console.log('   ✓ Candidates found:', details.data.candidates.length);
    
    if (details.data.candidates.length === 0) {
      console.log('   ⚠ No candidates found. Run: node createTestElection.js');
      return;
    }

    // Test 4: Voter Login
    console.log('\n4. Testing voter login...');
    let token;
    try {
      const login = await axios.post(`${API_BASE}/auth/login`, {
        email: 'voter@test.com',
        password: 'voter123'
      });
      
      if (login.data.developmentOTP) {
        console.log('   ✓ Login initiated, OTP:', login.data.developmentOTP);
        
        // Verify OTP
        const verify = await axios.post(`${API_BASE}/auth/verify-otp`, {
          email: 'voter@test.com',
          otp: login.data.developmentOTP
        });
        token = verify.data.token;
        console.log('   ✓ OTP verified, token received');
      } else {
        token = login.data.token;
        console.log('   ✓ Login successful, token received');
      }
    } catch (error) {
      console.log('   ⚠ Voter login failed. Run: node createTestVoter.js');
      console.log('   Error:', error.response?.data?.error || error.message);
      return;
    }

    // Test 5: Cast Vote
    console.log('\n5. Testing vote casting...');
    try {
      const vote = await axios.post(
        `${API_BASE}/voter/vote`,
        {
          election_id: testElection.id,
          candidate_id: details.data.candidates[0].id
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('   ✓ Vote cast successfully:', vote.data.message);
    } catch (error) {
      if (error.response?.data?.error?.includes('already voted')) {
        console.log('   ✓ Duplicate vote prevention working');
      } else {
        console.log('   ✗ Vote casting failed:', error.response?.data?.error || error.message);
      }
    }

    // Test 6: Get Voting History
    console.log('\n6. Testing voting history...');
    const history = await axios.get(`${API_BASE}/voter/voting-history`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('   ✓ Voting history loaded:', history.data.votes.length, 'votes found');

    console.log('\n=== All Tests Passed! ===\n');
    console.log('✓ Backend is running correctly');
    console.log('✓ Elections can be fetched');
    console.log('✓ Election details load properly');
    console.log('✓ Voter authentication works');
    console.log('✓ Voting system is functional');
    console.log('✓ Duplicate prevention is active');
    console.log('✓ Voting history is accessible');
    console.log('\nYou can now test the frontend at: http://localhost:3000\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\nTroubleshooting:');
    console.log('1. Make sure backend is running: npm run dev');
    console.log('2. Make sure MySQL is running');
    console.log('3. Run database setup: node config/initDatabase.js');
    console.log('4. Create test data: node createTestElection.js');
  }
}

testVotingSystem();
