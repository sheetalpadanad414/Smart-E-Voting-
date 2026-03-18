const axios = require('axios');
require('dotenv').config();

const API_URL = 'http://localhost:5000/api';

let adminToken = '';

async function testVoterTracking() {
  console.log('🧪 Testing Voter Verification Status Tracking\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    adminToken = loginResponse.data.token;
    console.log('✓ Admin logged in successfully\n');

    // 2. Get voters with status
    console.log('2️⃣ Fetching voters with verification status...');
    const votersResponse = await axios.get(`${API_URL}/admin/voters`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { page: 1, limit: 10 }
    });
    
    console.log(`✓ Found ${votersResponse.data.total} voters`);
    console.log('\nVoter Status Summary:');
    votersResponse.data.voters.forEach((voter, index) => {
      console.log(`\n${index + 1}. ${voter.name} (${voter.email})`);
      console.log(`   - Verified: ${voter.is_verified ? '✓' : '✗'}`);
      console.log(`   - OTP Verified: ${voter.otp_verified ? '✓' : '✗'}`);
      console.log(`   - Has Voted: ${voter.has_voted ? '✓' : '✗'}`);
      console.log(`   - Last Login: ${voter.last_login ? new Date(voter.last_login).toLocaleString() : 'Never'}`);
    });

    // 3. Test filters
    console.log('\n\n3️⃣ Testing filters...');
    
    // Get only verified voters
    const verifiedResponse = await axios.get(`${API_URL}/admin/voters`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { verified: 'true' }
    });
    console.log(`✓ Verified voters: ${verifiedResponse.data.total}`);

    // Get voters who have voted
    const votedResponse = await axios.get(`${API_URL}/admin/voters`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { has_voted: 'true' }
    });
    console.log(`✓ Voters who have voted: ${votedResponse.data.total}`);

    // Get OTP verified voters
    const otpVerifiedResponse = await axios.get(`${API_URL}/admin/voters`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      params: { otp_verified: 'true' }
    });
    console.log(`✓ OTP verified voters: ${otpVerifiedResponse.data.total}`);

    // 4. Test CSV export
    console.log('\n4️⃣ Testing CSV export...');
    const csvResponse = await axios.get(`${API_URL}/admin/voters/export`, {
      headers: { Authorization: `Bearer ${adminToken}` },
      responseType: 'text'
    });
    
    const lines = csvResponse.data.split('\n');
    console.log(`✓ CSV exported successfully with ${lines.length - 1} rows`);
    console.log('\nCSV Header:');
    console.log(lines[0]);
    if (lines.length > 1) {
      console.log('\nFirst voter row:');
      console.log(lines[1]);
    }

    console.log('\n\n✅ All voter tracking tests passed!\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Error details:', JSON.stringify(error.response.data, null, 2));
    }
    process.exit(1);
  }
}

testVoterTracking();
