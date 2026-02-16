const axios = require('axios');
const readline = require('readline');

const API_URL = 'http://localhost:5000/api/auth';

// Test OTP Login Flow
async function testOTPLogin() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing OTP Login Flow');
  console.log('='.repeat(60));

  try {
    // Step 1: Login (get OTP)
    console.log('\nStep 1: Logging in with email and password...');
    console.log('Email: test@example.com');
    console.log('Password: test123');

    const loginResponse = await axios.post(`${API_URL}/login`, {
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('\n✓ Login successful!');
    console.log('Response:', JSON.stringify(loginResponse.data, null, 2));
    console.log('\n' + '='.repeat(60));
    console.log('CHECK BACKEND CONSOLE FOR OTP!');
    console.log('='.repeat(60));

    // Prompt for OTP
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nEnter the 6-digit OTP from backend console: ', async (otp) => {
      try {
        // Step 2: Verify OTP
        console.log('\nStep 2: Verifying OTP...');
        console.log('Email: test@example.com');
        console.log('OTP: ' + otp);

        const verifyResponse = await axios.post(`${API_URL}/verify-otp`, {
          email: 'test@example.com',
          otp: otp.trim()
        });

        console.log('\n' + '='.repeat(60));
        console.log('✓ OTP VERIFIED SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('\nResponse:', JSON.stringify(verifyResponse.data, null, 2));
        console.log('\n' + '='.repeat(60));
        console.log('JWT Token:');
        console.log('='.repeat(60));
        console.log(verifyResponse.data.data.token);
        console.log('='.repeat(60));
        console.log('\nUser Details:');
        console.log(JSON.stringify(verifyResponse.data.data.user, null, 2));
        console.log('='.repeat(60) + '\n');

      } catch (error) {
        console.log('\n✗ OTP Verification Failed');
        console.log('Error:', error.response?.data || error.message);
      }

      rl.close();
    });

  } catch (error) {
    console.log('\n✗ Login Failed');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nNote: Make sure user exists. Register first:');
      console.log('curl -X POST http://localhost:5000/api/auth/register \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"name":"Test User","email":"test@example.com","password":"test123"}\'');
    }
  }
}

// Run the test
testOTPLogin();
