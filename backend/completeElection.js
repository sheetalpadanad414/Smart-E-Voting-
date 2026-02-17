const { pool } = require('./config/database');
require('dotenv').config();

async function completeElection() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n=== Completing Election for Testing ===\n');

    // Get the first active election
    const [elections] = await connection.query(`
      SELECT id, title, status FROM elections 
      WHERE status = 'active' 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    if (elections.length === 0) {
      console.log('No active elections found.');
      console.log('Run: node createTestElection.js');
      connection.release();
      process.exit(0);
      return;
    }

    const election = elections[0];
    console.log('Found election:', election.title);
    console.log('Current status:', election.status);

    // Update election to completed
    await connection.query(`
      UPDATE elections 
      SET status = 'completed', 
          end_date = NOW() 
      WHERE id = ?
    `, [election.id]);

    console.log('\n✓ Election marked as completed!');
    console.log('Election ID:', election.id);
    console.log('Title:', election.title);
    console.log('\nYou can now view results at:');
    console.log('http://localhost:3000/results');
    console.log('\n');

  } catch (error) {
    console.error('Error completing election:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

completeElection();
