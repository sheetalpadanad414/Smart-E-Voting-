require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAdminLogin() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING ADMIN LOGIN');
    console.log('='.repeat(60) + '\n');

    const credentials = {
      email: 'admin@evoting.com',
      password: 'admin123'
    };

    console.log('Attempting admin login...');
    console.log('Email:', credentials.email);
    console.log('Password:', '***' + credentials.password.slice(-3));
    console.log();

    const response = await axios.post(`${BASE_URL}/auth/admin/login`, credentials);

    console.log('✓ Admin login successful!');
    console.log('\nResponse:');
    console.log('- User:', response.data.data.user.name);
    console.log('- Email:', response.data.data.user.email);
    console.log('- Role:', response.data.data.user.role);
    console.log('- Token:', response.data.data.token.substring(0, 20) + '...');
    console.log();

  } catch (error) {
    console.error('✗ Admin login failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Message:', error.response.data.message);
      console.error('Full response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error:', error.message);
    }
    console.log();
  }
}

// Check if server is running first
axios.get('http://localhost:5000/health')
  .then(() => {
    console.log('✓ Server is running\n');
    testAdminLogin();
  })
  .catch(() => {
    console.error('✗ Server is not running!');
    console.error('Please start the server first with: node serverSimple.js\n');
  });
