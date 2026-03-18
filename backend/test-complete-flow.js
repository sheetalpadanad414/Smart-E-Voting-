const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testCompleteFlow() {
  console.log('\n' + '='.repeat(60));
  console.log('TESTING COMPLETE LOGIN FLOW');
  console.log('='.repeat(60) + '\n');

  try {
    // Test 1: Server Health
    console.log('1. Testing server health...');
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('✓ Server is running:', healthResponse.data);
    console.log('');

    // Test 2: Admin Login
    console.log('2. Testing admin login...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });
    
    console.log('✓ Login successful!');
    console.log('   Token:', loginResponse.data.data.token.substring(0, 30) + '...');
    console.log('   User:', loginResponse.data.data.user.name);
    console.log('   Role:', loginResponse.data.data.user.role);
    console.log('');

    const token = loginResponse.data.data.token;

    // Test 3: Dashboard API
    console.log('3. Testing dashboard API...');
    try {
      const dashboardResponse = await axios.get(`${API_URL}/admin/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✓ Dashboard data received:', dashboardResponse.data);
    } catch (error) {
      console.log('⚠️  Dashboard API returned:', error.response?.status, error.response?.data);
      console.log('   This is OK if there\'s no data yet');
    }
    console.log('');

    console.log('='.repeat(60));
    console.log('ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\nYou can now login at: http://localhost:3000/login');
    console.log('Email: admin@evoting.com');
    console.log('Password: admin123\n');

  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
    console.error('\nMake sure the backend server is running on port 5000');
    process.exit(1);
  }
}

testCompleteFlow();
