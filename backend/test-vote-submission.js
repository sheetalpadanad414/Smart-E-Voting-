const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

async function testVoteSubmission() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING VOTE SUBMISSION');
  console.log('='.repeat(60) + '\n');

  try {
    // Step 1: Login as voter
    console.log('Step 1: Logging in as voter...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'voter@test.com',
      password: 'password123'
    });
    
    console.log('✓ Login initiated, OTP sent');
    console.log('');

    // For testing, you'll need to manually verify OTP
    console.log('⚠️  Manual step required:');
    console.log('   1. Check email for OTP');
    console.log('   2. Verify OTP using: POST /api/auth/verify-otp');
    console.log('   3. Get the token');
    console.log('   4. Use token to test vote submission');
    console.log('');

    // Step 2: Get election details
    console.log('Step 2: Getting election details...');
    const electionId = 'a7a94c4b-c62a-45c8-907e-885273fafa78';
    const electionResponse = await axios.get(`${API_URL}/voter/elections/${electionId}`);
    
    const election = electionResponse.data.election;
    console.log('✓ Election found:', election.title);
    console.log('  Status:', election.status);
    console.log('  Start Date:', election.start_date);
    console.log('  End Date:', election.end_date);
    console.log('');

    // Step 3: Check date validation
    console.log('Step 3: Validating dates...');
    const now = new Date();
    const startDate = new Date(election.start_date);
    const endDate = new Date(election.end_date);
    
    now.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    
    console.log('  Current Date:', now.toISOString());
    console.log('  Start Date:', startDate.toISOString());
    console.log('  End Date:', endDate.toISOString());
    console.log('  Is Before Start:', now < startDate);
    console.log('  Is After End:', now > endDate);
    console.log('  Can Vote:', now >= startDate && now <= endDate);
    console.log('');

    if (now >= startDate && now <= endDate) {
      console.log('✓ Election is active and within voting period');
    } else if (now < startDate) {
      console.log('⚠️  Election has not started yet');
    } else {
      console.log('⚠️  Election has ended');
    }

    console.log('\n' + '='.repeat(60));
    console.log('TEST COMPLETE');
    console.log('='.repeat(60) + '\n');

    console.log('To test actual vote submission:');
    console.log('1. Login as voter and get token');
    console.log('2. Use this curl command:');
    console.log('');
    console.log('curl -X POST http://localhost:5000/api/voter/vote \\');
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
    console.log('  -d \'{"election_id":"' + electionId + '","candidate_id":"CANDIDATE_ID"}\'');
    console.log('');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    process.exit(1);
  }
}

testVoteSubmission();
