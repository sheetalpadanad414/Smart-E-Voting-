const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testVotingFlow() {
  console.log('\n=== Testing Smart E-Voting Flow ===\n');

  try {
    // Step 1: Register a new user
    console.log('1. Registering new user...');
    const registerData = {
      name: 'Test Voter',
      email: `voter${Date.now()}@test.com`,
      password: 'password123',
      phone: '1234567890',
      role: 'voter'
    };

    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✓ User registered:', registerResponse.data.email);
    const userEmail = registerResponse.data.email;

    // Step 2: Get OTP from database
    console.log('\n2. Fetching OTP from database...');
    const otpResponse = await axios.get(`${API_URL}/otp/${userEmail}`);
    console.log('✓ OTP:', otpResponse.data.otp);
    const otp = otpResponse.data.otp;

    // Step 3: Verify OTP
    console.log('\n3. Verifying OTP...');
    const verifyResponse = await axios.post(`${API_URL}/otp/verify`, {
      email: userEmail,
      otp: otp
    });
    console.log('✓ OTP verified successfully');
    const userId = verifyResponse.data.user.id;

    // Step 4: Get active elections
    console.log('\n4. Fetching active elections...');
    const electionsResponse = await axios.get(`${API_URL}/admin/elections`);
    const activeElections = electionsResponse.data.elections.filter(e => e.status === 'active');
    
    if (activeElections.length === 0) {
      console.log('✗ No active elections found. Please create an election first.');
      return;
    }
    
    const electionId = activeElections[0].id;
    console.log('✓ Found active election:', activeElections[0].title);

    // Step 5: Get candidates
    console.log('\n5. Fetching candidates...');
    const candidatesResponse = await axios.get(`${API_URL}/vote/candidates/${electionId}`);
    const candidates = candidatesResponse.data.candidates;
    
    if (candidates.length === 0) {
      console.log('✗ No candidates found. Please add candidates first.');
      return;
    }
    
    console.log('✓ Found', candidates.length, 'candidates');
    candidates.forEach((c, i) => {
      console.log(`   ${i + 1}. ${c.name} (${c.party_name || 'Independent'})`);
    });

    // Step 6: Cast vote
    console.log('\n6. Casting vote...');
    const voteResponse = await axios.post(`${API_URL}/vote/cast`, {
      electionId: electionId,
      candidateId: candidates[0].id,
      userId: userId
    });
    console.log('✓ Vote cast successfully for:', voteResponse.data.vote.candidate_name);

    // Step 7: Try to vote again (should fail)
    console.log('\n7. Testing duplicate vote prevention...');
    try {
      await axios.post(`${API_URL}/vote/cast`, {
        electionId: electionId,
        candidateId: candidates[0].id,
        userId: userId
      });
      console.log('✗ Duplicate vote was allowed (ERROR!)');
    } catch (error) {
      console.log('✓ Duplicate vote prevented:', error.response.data.error);
    }

    console.log('\n=== All Tests Passed! ===\n');

  } catch (error) {
    console.error('\n✗ Test failed:', error.response?.data || error.message);
  }
}

testVotingFlow();
