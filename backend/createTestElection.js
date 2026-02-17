const { pool } = require('./config/database');
const { generateUUID } = require('./utils/auth');
require('dotenv').config();

async function createTestElection() {
  const connection = await pool.getConnection();
  
  try {
    console.log('\n=== Creating Test Election ===\n');

    // Get admin user
    const [admins] = await connection.query('SELECT id FROM users WHERE role = "admin" LIMIT 1');
    if (admins.length === 0) {
      console.error('No admin user found. Please create an admin first.');
      process.exit(1);
    }
    const adminId = admins[0].id;

    // Create election
    const electionId = generateUUID();
    const now = new Date();
    const startDate = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000); // Started yesterday
    const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // Ends in 7 days

    await connection.query(`
      INSERT INTO elections (id, title, description, start_date, end_date, status, is_public, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      electionId,
      'Student Council Election 2024',
      'Vote for your student council representatives',
      startDate,
      endDate,
      'active',
      true,
      adminId
    ]);

    console.log('✓ Election created:', electionId);
    console.log('  Title: Student Council Election 2024');
    console.log('  Status: active');

    // Create candidates
    const candidates = [
      {
        name: 'John Smith',
        description: 'Experienced leader with vision for positive change',
        position: 'President',
        party_name: 'Progressive Party',
        symbol: '🌟'
      },
      {
        name: 'Sarah Johnson',
        description: 'Dedicated to student welfare and campus improvement',
        position: 'President',
        party_name: 'Unity Party',
        symbol: '🎯'
      },
      {
        name: 'Michael Chen',
        description: 'Innovative thinker focused on technology and education',
        position: 'President',
        party_name: 'Innovation Party',
        symbol: '🚀'
      },
      {
        name: 'Emily Davis',
        description: 'Passionate about environmental sustainability',
        position: 'Vice President',
        party_name: 'Green Party',
        symbol: '🌱'
      },
      {
        name: 'David Wilson',
        description: 'Strong advocate for student rights and representation',
        position: 'Vice President',
        party_name: 'Student Voice',
        symbol: '📢'
      }
    ];

    console.log('\n✓ Creating candidates...');
    for (const candidate of candidates) {
      const candidateId = generateUUID();
      await connection.query(`
        INSERT INTO candidates (id, election_id, name, description, position, party_name, symbol)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        candidateId,
        electionId,
        candidate.name,
        candidate.description,
        candidate.position,
        candidate.party_name,
        candidate.symbol
      ]);
      console.log(`  ✓ ${candidate.name} - ${candidate.position}`);
    }

    console.log('\n=== Test Election Created Successfully! ===\n');
    console.log('Election ID:', electionId);
    console.log('You can now vote at: http://localhost:3000/elections/' + electionId + '/vote');
    console.log('\n');

  } catch (error) {
    console.error('Error creating test election:', error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

createTestElection();
