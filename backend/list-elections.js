const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const listElections = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('📋 Listing all elections in database...\n');
    
    const [elections] = await connection.query(`
      SELECT 
        id, 
        title, 
        status, 
        start_date, 
        end_date,
        is_public,
        created_at
      FROM elections 
      ORDER BY created_at DESC
    `);

    if (elections.length === 0) {
      console.log('⚠ No elections found in database');
      await connection.end();
      return;
    }

    console.log(`Found ${elections.length} elections:\n`);
    
    elections.forEach((election, index) => {
      console.log(`${index + 1}. ${election.title}`);
      console.log(`   ID: ${election.id}`);
      console.log(`   Status: ${election.status}`);
      console.log(`   Public: ${election.is_public ? 'Yes' : 'No'}`);
      console.log(`   Start: ${new Date(election.start_date).toLocaleDateString()}`);
      console.log(`   End: ${new Date(election.end_date).toLocaleDateString()}`);
      console.log(`   Vote URL: http://localhost:3001/elections/${election.id}/vote`);
      console.log('');
    });

    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
};

listElections();
