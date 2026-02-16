const axios = require('axios');
const readline = require('readline');

const API_URL = 'http://localhost:5000/api';

async function testCastVote() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Cast Vote API');
  console.log('='.repeat(60));

  try {
    // Step 1: User Login
    console.log('\nStep 1: User Login...');
    console.log('Email: test@example.com');
    console.log('Password: test123');

    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });

    console.log('✓ Login successful');
    console.log('\n' + '='.repeat(60));
    console.log('CHECK BACKEND CONSOLE FOR OTP!');
    console.log('='.repeat(60));

    // Prompt for OTP
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    rl.question('\nEnter the 6-digit OTP: ', async (otp) => {
      try {
        // Step 2: Verify OTP
        console.log('\nStep 2: Verifying OTP...');
        const verifyResponse = await axios.post(`${API_URL}/auth/verify-otp`, {
          email: 'test@example.com',
          otp: otp.trim()
        });

        const token = verifyResponse.data.data.token;
        console.log('✓ OTP verified successfully');
        console.log('Token:', token.substring(0, 30) + '...');

        // Step 3: Check Voting Status
        console.log('\n' + '='.repeat(60));
        console.log('Step 3: Checking voting status...');
        console.log('='.repeat(60));

        const statusResponse = await axios.get(`${API_URL}/voter/status`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        console.log('Voting Status:', JSON.stringify(statusResponse.data.data, null, 2));

        if (statusResponse.data.data.has_voted) {
          console.log('\n⚠ You have already voted!');
          console.log('Vote Details:', statusResponse.data.data.vote_details);
          rl.close();
          return;
        }

        if (!statusResponse.data.data.can_vote) {
          console.log('\n⚠ Voting is not active!');
          console.log('Election Status:', statusResponse.data.data.election_status);
          console.log('\nTo start election, run:');
          console.log('mysql -u root -p smart_evoting -e "UPDATE election SET status = \'active\';"');
          rl.close();
          return;
        }

        // Step 4: Get Candidates
        console.log('\n' + '='.repeat(60));
        console.log('Step 4: Getting candidates...');
        console.log('='.repeat(60));

        const candidatesResponse = await axios.get(`${API_URL}/admin/candidates`);
        const candidates = candidatesResponse.data.data.candidates;

        if (candidates.length === 0) {
          console.log('\n⚠ No candidates available');
          console.log('Add candidates first using: node testAddCandidate.js');
          rl.close();
          return;
        }

        console.log(`\n✓ Found ${candidates.length} candidates:`);
        candidates.forEach((c, i) => {
          console.log(`${i + 1}. ${c.name} (${c.party}) - ID: ${c.id} - Votes: ${c.votes}`);
        });

        // Step 5: Cast Vote
        console.log('\n' + '='.repeat(60));
        console.log('Step 5: Casting vote...');
        console.log('='.repeat(60));

        const candidateId = candidates[0].id;
        console.log(`\nVoting for: ${candidates[0].name} (${candidates[0].party})`);

        const voteResponse = await axios.post(
          `${API_URL}/voter/vote`,
          { candidate_id: candidateId },
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );

        console.log('\n' + '='.repeat(60));
        console.log('✓ VOTE CAST SUCCESSFULLY!');
        console.log('='.repeat(60));
        console.log('Response:', JSON.stringify(voteResponse.data, null, 2));

        // Step 6: Test Duplicate Vote Prevention
        console.log('\n' + '='.repeat(60));
        console.log('Step 6: Testing duplicate vote prevention...');
        console.log('='.repeat(60));

        try {
          await axios.post(
            `${API_URL}/voter/vote`,
            { candidate_id: candidateId },
            {
              headers: { 'Authorization': `Bearer ${token}` }
            }
          );
          console.log('✗ Duplicate prevention FAILED - vote was accepted');
        } catch (error) {
          if (error.response?.status === 403) {
            console.log('✓ Duplicate vote prevented successfully');
            console.log('Message:', error.response.data.message);
          } else {
            console.log('✗ Unexpected error:', error.response?.data);
          }
        }

        // Step 7: Verify in Database
        console.log('\n' + '='.repeat(60));
        console.log('Step 7: Verification');
        console.log('='.repeat(60));
        console.log('\nTo verify in database, run:');
        console.log('mysql -u root -p smart_evoting -e "SELECT * FROM votes;"');
        console.log('mysql -u root -p smart_evoting -e "SELECT * FROM candidates;"');
        console.log('mysql -u root -p smart_evoting -e "SELECT id, name, has_voted FROM users;"');

        console.log('\n' + '='.repeat(60));
        console.log('All Tests Completed Successfully!');
        console.log('='.repeat(60) + '\n');

      } catch (error) {
        console.log('\n✗ Test failed');
        console.log('Error:', error.response?.data || error.message);
      }

      rl.close();
    });

  } catch (error) {
    console.log('\n✗ Login failed');
    console.log('Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\nNote: Register user first:');
      console.log('curl -X POST http://localhost:5000/api/auth/register \\');
      console.log('  -H "Content-Type: application/json" \\');
      console.log('  -d \'{"name":"Test User","email":"test@example.com","password":"test123"}\'');
    }
  }
}

testCastVote();
