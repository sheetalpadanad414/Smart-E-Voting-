require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testOTPFlow() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING OTP EMAIL FLOW');
    console.log('='.repeat(60) + '\n');

    // Test email for registration
    const testEmail = 'test.voter@example.com';
    const testPassword = 'Test123!';

    console.log('Step 1: Attempting login to trigger OTP email...');
    console.log(`Email: ${testEmail}\n`);

    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword
    });

    console.log('✓ Login request successful!');
    console.log('Response:', loginResponse.data);
    console.log('\n📧 Check your email or server console for the OTP code');
    console.log('   (For Ethereal email, check the preview URL in console)\n');

  } catch (error) {
    if (error.response) {
      console.error('✗ Request failed:', error.response.data);
    } else {
      console.error('✗ Error:', error.message);
    }
  }
}

// Check if server is running first
axios.get('http://localhost:5000/health')
  .then(() => {
    console.log('✓ Server is running\n');
    testOTPFlow();
  })
  .catch(() => {
    console.error('✗ Server is not running!');
    console.error('Please start the server first with: node serverSimple.js\n');
  });
