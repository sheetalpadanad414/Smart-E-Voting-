const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

// Test User Registration
async function testRegister() {
  console.log('\n' + '='.repeat(50));
  console.log('Testing User Registration');
  console.log('='.repeat(50));

  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      name: 'Test User',
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('✓ Registration Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data.userId;
  } catch (error) {
    console.log('✗ Registration Failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test User Login
async function testLogin() {
  console.log('\n' + '='.repeat(50));
  console.log('Testing User Login');
  console.log('='.repeat(50));

  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('✓ Login Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data.token;
  } catch (error) {
    console.log('✗ Login Failed');
    console.log('Error:', error.response?.data || error.message);
    return null;
  }
}

// Test Admin Login
async function testAdminLogin() {
  console.log('\n' + '='.repeat(50));
  console.log('Testing Admin Login');
  console.log('='.repeat(50));

  try {
    const response = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });

    console.log('✓ Admin Login Successful');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return response.data.data.token;
  } catch (error) {
    console.log('✗ Admin Login Failed');
    console.log('Error:', error.response?.data || error.message);
    console.log('\nNote: Create admin account first using:');
    console.log('node createAdmin.js');
    return null;
  }
}

// Test Health Check
async function testHealth() {
  console.log('\n' + '='.repeat(50));
  console.log('Testing Health Check');
  console.log('='.repeat(50));

  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✓ Server is running');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('✗ Server is not running');
    console.log('Error:', error.message);
  }
}

// Run all tests
async function runTests() {
  console.log('\n' + '='.repeat(50));
  console.log('Smart E-Voting API Tests');
  console.log('='.repeat(50));

  // Test 1: Health Check
  await testHealth();

  // Test 2: Register User
  const userId = await testRegister();

  // Test 3: Login User
  if (userId) {
    await testLogin();
  }

  // Test 4: Admin Login
  await testAdminLogin();

  console.log('\n' + '='.repeat(50));
  console.log('Tests Completed');
  console.log('='.repeat(50) + '\n');
}

// Run tests
runTests();
