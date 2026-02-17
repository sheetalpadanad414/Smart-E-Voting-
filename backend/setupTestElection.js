const { pool } = require('./config/database');
const { generateUUID } = require('./utils/auth');
require('dotenv').config();

async function setupTestElection() {
  console.log('\n=== Setting Up Test Election ===\n');

  try {
    const connection = await pool.getConnection();

    // Get admin user
    const [admins] = await connection.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    
    if (admins.length === 0) {
      console.log('✗ No admin user found. Please run: node createAdmin.js');
      connection.release();
      return;
    }

    const adminId = admins[0].id;

    // Create election
    const electionId = generateUUID();
    const now = new Date();
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

    await connection.query(`
      INSERT INTO elections (id, title, description, start_date, end_date, status, is_public, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      electionId,
      'Student Council Election 2024',
      'Annual election for student council representatives',
      now,
      endDate,
      'active',
      true,
      adminId
    ]);

    console.log('✓ Election created: Student Council Election 2024');

    // Create candidates
    const candidates = [
      {
        name: 'John Smith',
        party_name: 'Progressive Party',
        position: 'President',
        symbol: '🌟',
        description: 'Experienced leader with vision for change'
      },
      {
        name: 'Sarah Johnson',
        party_name: 'Unity Alliance',
        position: 'President',
        symbol: '🎯',
        description: 'Dedicated to student welfare and development'
      },
      {
        name: 'Michael Brown',
        party_name: 'Independent',
        position: 'President',
        symbol: '🏆',
        description: 'Fresh perspective and innovative ideas'
      },
      {
        name: 'Emily Davis',
        party_name: 'Student First',
        position: 'President',
        symbol: '⭐',
        description: 'Committed to transparency and accountability'
      }
    ];

    for (const candidate of candidates) {
      const candidateId = generateUUID();
      await connection.query(`
        INSERT INTO candidates (id, election_id, name, party_name, position, symbol, description)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        candidateId,
        electionId,
        candidate.name,
        candidate.party_name,
        candidate.position,
        candidate.symbol,
        candidate.description
      ]);
      console.log(`✓ Candidate added: ${candidate.name} (${candidate.party_name})`);
    }

    connection.release();

    console.log('\n=== Setup Complete! ===');
    console.log('\nElection Details:');
    console.log('- Title: Student Council Election 2024');
    console.log('- Status: Active');
    console.log('- Candidates: 4');
    console.log('\nYou can now:');
    console.log('1. Register a voter at: http://localhost:3000/register');
    console.log('2. Verify OTP');
    console.log('3. Cast vote at: http://localhost:3000/cast-vote\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Setup failed:', error.message);
    process.exit(1);
  }
}

setupTestElection();
