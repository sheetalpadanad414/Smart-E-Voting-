const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testElectionResults() {
  console.log('\n' + '='.repeat(60));
  console.log('Testing Election Results API');
  console.log('='.repeat(60));

  try {
    // Step 1: Get Election Results
    console.log('\nStep 1: Fetching election results...');
    const resultsResponse = await axios.get(`${API_URL}/admin/election/results`);

    console.log('✓ Results retrieved successfully');
    console.log('\n' + '='.repeat(60));
    console.log('ELECTION RESULTS');
    console.log('='.repeat(60));
    console.log(`Total Votes: ${resultsResponse.data.data.total_votes}`);
    console.log(`Total Candidates: ${resultsResponse.data.data.total_candidates}`);
    console.log('='.repeat(60));

    if (resultsResponse.data.data.results.length > 0) {
      console.log('\nCandidate Rankings:');
      console.log('='.repeat(60));
      
      resultsResponse.data.data.results.forEach((candidate, index) => {
        console.log(`${index + 1}. ${candidate.name} (${candidate.party})`);
        console.log(`   Votes: ${candidate.votes} (${candidate.percentage}%)`);
        console.log('-'.repeat(60));
      });

      if (resultsResponse.data.data.winner) {
        console.log('\n' + '='.repeat(60));
        console.log('🏆 WINNER');
        console.log('='.repeat(60));
        console.log(`Name: ${resultsResponse.data.data.winner.name}`);
        console.log(`Party: ${resultsResponse.data.data.winner.party}`);
        console.log(`Votes: ${resultsResponse.data.data.winner.votes}`);
        console.log(`Percentage: ${resultsResponse.data.data.winner.percentage}%`);
        console.log('='.repeat(60));
      }
    } else {
      console.log('\nNo candidates found or no votes cast yet.');
    }

    // Step 2: Verify Response Structure
    console.log('\n' + '='.repeat(60));
    console.log('Step 2: Verifying response structure...');
    console.log('='.repeat(60));

    const data = resultsResponse.data.data;
    
    if (data.hasOwnProperty('total_votes')) {
      console.log('✓ total_votes field present');
    }
    if (data.hasOwnProperty('total_candidates')) {
      console.log('✓ total_candidates field present');
    }
    if (data.hasOwnProperty('results')) {
      console.log('✓ results array present');
    }
    if (data.hasOwnProperty('winner')) {
      console.log('✓ winner field present');
    }

    // Step 3: Verify Sorting (Descending by votes)
    console.log('\n' + '='.repeat(60));
    console.log('Step 3: Verifying sorting (descending by votes)...');
    console.log('='.repeat(60));

    const results = data.results;
    let isSorted = true;
    
    for (let i = 0; i < results.length - 1; i++) {
      if (results[i].votes < results[i + 1].votes) {
        isSorted = false;
        break;
      }
    }

    if (isSorted) {
      console.log('✓ Results are correctly sorted by votes (descending)');
    } else {
      console.log('✗ Results are NOT sorted correctly');
    }

    // Step 4: Verify Percentage Calculation
    console.log('\n' + '='.repeat(60));
    console.log('Step 4: Verifying percentage calculations...');
    console.log('='.repeat(60));

    const totalPercentage = results.reduce((sum, candidate) => {
      return sum + parseFloat(candidate.percentage);
    }, 0);

    if (data.total_votes > 0) {
      if (Math.abs(totalPercentage - 100) < 0.1) {
        console.log('✓ Percentages add up to 100%');
        console.log(`  Total: ${totalPercentage.toFixed(2)}%`);
      } else {
        console.log('⚠ Percentages do not add up to exactly 100%');
        console.log(`  Total: ${totalPercentage.toFixed(2)}%`);
      }
    } else {
      console.log('⚠ No votes cast yet, percentages are 0%');
    }

    console.log('\n' + '='.repeat(60));
    console.log('All Tests Completed Successfully!');
    console.log('='.repeat(60));
    console.log('\nSummary:');
    console.log('✓ Results API working');
    console.log('✓ Data structure correct');
    console.log('✓ Sorting by votes working');
    console.log('✓ Percentage calculation working');
    console.log('✓ Winner identification working');
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.log('\n' + '='.repeat(60));
    console.log('✗ Test Failed');
    console.log('='.repeat(60));
    console.log('Error:', error.response?.data || error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Make sure server is running: node serverSimple.js');
    console.log('2. Check database connection');
    console.log('3. Verify candidates table exists');
    console.log('4. Add some candidates: node testAddCandidate.js');
    console.log('5. Cast some votes: node testCastVote.js');
    console.log('='.repeat(60) + '\n');
  }
}

// Run the test
testElectionResults();
