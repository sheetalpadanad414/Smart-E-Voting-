const axios = require('axios');

const API_URL = 'http://localhost:5000/api/admin';

async function testGetCandidates() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Get All Candidates API');
  console.log('='.repeat(60));

  try {
    console.log('\nFetching all candidates from:');
    console.log(`GET ${API_URL}/candidates`);
    
    const response = await axios.get(`${API_URL}/candidates`);

    console.log('\n✓ Candidates retrieved successfully');
    console.log('='.repeat(60));
    console.log('Status Code:', response.status);
    console.log('Total Candidates:', response.data.data.count);
    console.log('='.repeat(60));

    if (response.data.data.count === 0) {
      console.log('\n⚠ No candidates found in database');
      console.log('\nTo add candidates, run:');
      console.log('node testAddCandidate.js');
      console.log('\nOr add manually:');
      console.log('curl -X POST http://localhost:5000/api/admin/candidates \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -H "Authorization: Bearer YOUR_TOKEN" \\');
      console.log('  -d \'{"name":"John Doe","party":"Party A"}\'');
    } else {
      console.log('\nCandidate List:');
      console.log('='.repeat(60));
      
      response.data.data.candidates.forEach((candidate, index) => {
        console.log(`\n${index + 1}. ${candidate.name}`);
        console.log(`   ID: ${candidate.id}`);
        console.log(`   Party: ${candidate.party}`);
        console.log(`   Votes: ${candidate.votes}`);
      });
      
      console.log('\n' + '='.repeat(60));
      
      // Show top candidate
      const topCandidate = response.data.data.candidates[0];
      console.log('\n🏆 Leading Candidate:');
      console.log(`   ${topCandidate.name} (${topCandidate.party})`);
      console.log(`   Votes: ${topCandidate.votes}`);
      console.log('='.repeat(60));
    }

    console.log('\nFull API Response:');
    console.log('='.repeat(60));
    console.log(JSON.stringify(response.data, null, 2));
    console.log('='.repeat(60));

    console.log('\nSQL Query Used:');
    console.log('SELECT * FROM candidates ORDER BY votes DESC;');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('\n✗ Failed to retrieve candidates');
    console.log('='.repeat(60));
    
    if (error.code === 'ECONNREFUSED') {
      console.log('Error: Cannot connect to server');
      console.log('\nSolution: Start the server first');
      console.log('cd backend && node serverSimple.js');
    } else {
      console.log('Error:', error.response?.data || error.message);
    }
    
    console.log('='.repeat(60) + '\n');
  }
}

testGetCandidates();
