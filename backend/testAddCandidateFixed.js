require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testAddCandidate() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('TESTING ADD CANDIDATE FUNCTIONALITY');
    console.log('='.repeat(60) + '\n');

    // Step 1: Admin Login
    console.log('Step 1: Admin Login...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/admin/login`, {
      email: 'admin@evoting.com',
      password: 'admin123'
    });

    const token = loginResponse.data.token;
    console.log('✓ Admin logged in successfully\n');

    // Step 2: Get Elections
    console.log('Step 2: Fetching elections...');
    const electionsResponse = await axios.get(`${BASE_URL}/admin/elections`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const elections = electionsResponse.data.elections;
    console.log(`✓ Found ${elections.length} elections\n`);

    if (elections.length === 0) {
      console.log('⚠ No elections found. Creating a test election...');
      const newElection = await axios.post(`${BASE_URL}/admin/elections`, {
        title: 'Test Election for Candidates',
        description: 'Test election to add candidates',
        start_date: new Date(Date.now() + 86400000).toISOString(),
        end_date: new Date(Date.now() + 172800000).toISOString(),
        is_public: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      elections.push(newElection.data.election);
      console.log('✓ Test election created\n');
    }

    const electionId = elections[0].id;
    console.log(`Using election: ${elections[0].title} (ID: ${electionId})\n`);

    // Step 3: Add Candidate
    console.log('Step 3: Adding candidate...');
    const candidateData = {
      election_id: electionId,
      name: 'John Doe',
      description: 'Experienced leader with vision for change',
      symbol: '🦁',
      position: 'President',
      party_name: 'Progressive Party',
      image_url: 'https://example.com/john-doe.jpg'
    };

    const candidateResponse = await axios.post(`${BASE_URL}/admin/candidates`, candidateData, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✓ Candidate added successfully!');
    console.log('\nCandidate Details:');
    console.log('- Name:', candidateResponse.data.candidate.name);
    console.log('- ID:', candidateResponse.data.candidate.id);
    console.log('- Message:', candidateResponse.data.message);

    // Step 4: Verify candidate was added
    console.log('\nStep 4: Verifying candidate...');
    const candidatesResponse = await axios.get(`${BASE_URL}/admin/elections/${electionId}/candidates`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`✓ Found ${candidatesResponse.data.total} candidate(s) for this election`);
    console.log('\nAll Candidates:');
    candidatesResponse.data.candidates.forEach((c, i) => {
      console.log(`  ${i + 1}. ${c.name} (${c.party_name || 'No party'}) - ${c.position || 'No position'}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✓ ALL TESTS PASSED!');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n✗ Test failed!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Error:', error.response.data.error || error.response.data.message);
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
    console.log('✓ Server is running');
    testAddCandidate();
  })
  .catch(() => {
    console.error('✗ Server is not running!');
    console.error('Please start the server first\n');
  });
