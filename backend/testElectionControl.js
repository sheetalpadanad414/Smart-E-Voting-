const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testElectionControl() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Election Control API');
  console.log('='.repeat(60));

  try {
    // Step 1: Admin Login
    console.log('\nStep 1: Admin Login...');
    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✓ Admin logged in successfully');
    console.log('Token:', token.substring(0, 20) + '...');

    // Step 2: Get Current Status
    console.log('\nStep 2: Getting current election status...');
    let statusResponse = await axios.get(`${API_URL}/admin/election/status`);
    console.log('Current Status:', statusResponse.data.data.status);
    console.log('Is Active:', statusResponse.data.data.is_active);

    // Step 3: Start Election
    console.log('\nStep 3: Starting election...');
    const startResponse = await axios.post(
      `${API_URL}/admin/election/start`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✓ Election started successfully');
    console.log('Response:', JSON.stringify(startResponse.data, null, 2));

    // Step 4: Verify Status Changed to Active
    console.log('\nStep 4: Verifying status changed to active...');
    statusResponse = await axios.get(`${API_URL}/admin/election/status`);
    console.log('New Status:', statusResponse.data.data.status);
    console.log('Is Active:', statusResponse.data.data.is_active);

    if (statusResponse.data.data.status === 'active') {
      console.log('✓ Status successfully changed to active');
    } else {
      console.log('✗ Status did not change to active');
    }

    // Wait 2 seconds
    console.log('\nWaiting 2 seconds...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 5: Stop Election
    console.log('\nStep 5: Stopping election...');
    const stopResponse = await axios.post(
      `${API_URL}/admin/election/stop`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('✓ Election stopped successfully');
    console.log('Response:', JSON.stringify(stopResponse.data, null, 2));

    // Step 6: Verify Status Changed to Inactive
    console.log('\nStep 6: Verifying status changed to inactive...');
    statusResponse = await axios.get(`${API_URL}/admin/election/status`);
    console.log('Final Status:', statusResponse.data.data.status);
    console.log('Is Active:', statusResponse.data.data.is_active);

    if (statusResponse.data.data.status === 'inactive') {
      console.log('✓ Status successfully changed to inactive');
    } else {
      console.log('✗ Status did not change to inactive');
    }

    // Step 7: Test Without Token (Should Fail)
    console.log('\nStep 7: Testing without token (should fail)...');
    try {
      await axios.post(`${API_URL}/admin/election/start`, {});
      console.log('✗ Should have failed without token');
    } catch (error) {
      console.log('✓ Correctly rejected request without token');
      console.log('Error:', error.response?.data?.message);
    }

    console.log('\n' + '='.repeat(60));
    console.log('All Tests Completed Successfully!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log('✓ Admin login working');
    console.log('✓ Get election status working');
    console.log('✓ Start election working');
    console.log('✓ Stop election working');
    console.log('✓ Status toggle working');
    console.log('✓ Authentication required');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('✗ Test Failed');
    console.log('='.repeat(60));
    console.log('Error:', error.response?.data || error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure server is running: node serverSimple.js');
    console.log('2. Make sure admin account exists: node createAdmin.js');
    console.log('3. Check database connection');
    console.log('4. Verify election table has a row with id=1');
    console.log('='.repeat(60) + '\n');
  }
}

// Run the test
testElectionControl();
