const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testAddCandidate() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Add Candidate API');
  console.log('='.repeat(60));

  try {
    // Step 1: Admin Login
    console.log('\nStep 1: Admin Login...');
    console.log('Email: admin@evoting.com');
    console.log('Password: admin123');

    const loginResponse = await axios.post(`${API_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });

    const token = loginResponse.data.data.token;
    console.log('✓ Admin logged in successfully');
    console.log('Token:', token.substring(0, 30) + '...');

    // Step 2: Add Multiple Candidates
    console.log('\n' + '='.repeat(60));
    console.log('Step 2: Adding Candidates...');
    console.log('='.repeat(60));

    const candidates = [
      { name: 'John Doe', party: 'Party A' },
      { name: 'Jane Smith', party: 'Party B' },
      { name: 'Bob Johnson', party: 'Party C' }
    ];

    for (const candidate of candidates) {
      try {
        console.log(`\nAdding: ${candidate.name} (${candidate.party})`);
        
        const addResponse = await axios.post(
          `${API_URL}/admin/candidates`,
          candidate,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        console.log('✓ Candidate added successfully');
        console.log('ID:', addResponse.data.data.id);
        console.log('Name:', addResponse.data.data.name);
        console.log('Party:', addResponse.data.data.party);
        console.log('Votes:', addResponse.data.data.votes);

      } catch (error) {
        if (error.response?.status === 400) {
          console.log('⚠ Candidate already exists');
        } else {
          console.log('✗ Failed to add candidate');
          console.log('Error:', error.response?.data?.message);
        }
      }
    }

    // Step 3: Get All Candidates
    console.log('\n' + '='.repeat(60));
    console.log('Step 3: Getting All Candidates...');
    console.log('='.repeat(60));

    const getResponse = await axios.get(`${API_URL}/admin/candidates`);

    console.log('\n✓ Candidates retrieved successfully');
    console.log('Total Candidates:', getResponse.data.data.count);
    console.log('\nCandidate List:');
    console.log('='.repeat(60));

    getResponse.data.data.candidates.forEach((candidate, index) => {
      console.log(`${index + 1}. ${candidate.name} (${candidate.party}) - Votes: ${candidate.votes}`);
    });

    console.log('='.repeat(60));

    // Step 4: Test Duplicate Prevention
    console.log('\n' + '='.repeat(60));
    console.log('Step 4: Testing Duplicate Prevention...');
    console.log('='.repeat(60));

    try {
      console.log('\nTrying to add duplicate candidate...');
      await axios.post(
        `${API_URL}/admin/candidates`,
        { name: 'John Doe', party: 'Party A' },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      console.log('✗ Duplicate check failed - candidate was added');
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✓ Duplicate prevention working');
        console.log('Message:', error.response.data.message);
      }
    }

    // Step 5: Test Without Token
    console.log('\n' + '='.repeat(60));
    console.log('Step 5: Testing Authorization...');
    console.log('='.repeat(60));

    try {
      console.log('\nTrying to add candidate without token...');
      await axios.post(
        `${API_URL}/admin/candidates`,
        { name: 'Test User', party: 'Test Party' }
      );
      console.log('✗ Authorization check failed - candidate was added');
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✓ Authorization working');
        console.log('Message:', error.response.data.message);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('All Tests Completed Successfully!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('\n✗ Test failed');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nNote: Create admin account first:');
      console.log('node createAdmin.js');
    }
  }
}

testAddCandidate();
