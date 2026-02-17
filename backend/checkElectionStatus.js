const { pool } = require('./config/database');
require('dotenv').config();

async function checkElectionStatus() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n=== Election Status Check ===\n');

    const [elections] = await connection.query(`
      SELECT 
        id, 
        title, 
        status, 
        start_date, 
        end_date,
        (SELECT COUNT(*) FROM votes WHERE election_id = elections.id) as vote_count,
        (SELECT COUNT(*) FROM candidates WHERE election_id = elections.id) as candidate_count
      FROM elections 
      ORDER BY created_at DESC
    `);

    if (elections.length === 0) {
      console.log('No elections found.');
      console.log('Run: node createTestElection.js');
    } else {
      console.log(`Found ${elections.length} election(s):\n`);
      
      elections.forEach((election, index) => {
        console.log(`${index + 1}. ${election.title}`);
        console.log(`   ID: ${election.id}`);
        console.log(`   Status: ${election.status}`);
        console.log(`   Start: ${new Date(election.start_date).toLocaleString()}`);
        console.log(`   End: ${new Date(election.end_date).toLocaleString()}`);
        console.log(`   Candidates: ${election.candidate_count}`);
        console.log(`   Votes Cast: ${election.vote_count}`);
        console.log('');
      });

      console.log('To view results:');
      console.log('1. Make sure backend is running: npm run dev');
      console.log('2. Go to: http://localhost:3000/results');
      console.log('3. Select an election from dropdown');
      
      const completedCount = elections.filter(e => e.status === 'completed').length;
      if (completedCount === 0) {
        console.log('\n⚠ No completed elections found.');
        console.log('In development mode, you can view results for active elections too!');
        console.log('Or run: node completeElection.js');
      }
    }

    console.log('\n');

  } catch (error) {
    console.error('Error checking election status:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

checkElectionStatus();
