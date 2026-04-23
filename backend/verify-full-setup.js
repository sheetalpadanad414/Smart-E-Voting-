const { pool } = require('./config/database');
const fs = require('fs');
const path = require('path');

async function verifyFullSetup() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 COMPREHENSIVE SYSTEM VERIFICATION\n');
    console.log('=' .repeat(60));

    // 1. Database Connection
    console.log('\n1. DATABASE CONNECTION');
    console.log('-'.repeat(60));
    const [dbInfo] = await connection.query('SELECT DATABASE() as db, VERSION() as version');
    console.log(`   ✓ Database: ${dbInfo[0].db}`);
    console.log(`   ✓ MySQL Version: ${dbInfo[0].version}`);

    // 2. Check all tables
    console.log('\n2. DATABASE TABLES');
    console.log('-'.repeat(60));
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`   Total tables: ${tables.length}`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // 3. Users table details
    console.log('\n3. USERS TABLE');
    console.log('-'.repeat(60));
    const [userStats] = await connection.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'voter' THEN 1 ELSE 0 END) as voters,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'election_officer' THEN 1 ELSE 0 END) as officers,
        SUM(CASE WHEN otp_verified = 1 THEN 1 ELSE 0 END) as otp_verified,
        SUM(CASE WHEN face_verified = 1 THEN 1 ELSE 0 END) as face_verified,
        SUM(CASE WHEN has_voted = 1 THEN 1 ELSE 0 END) as has_voted
      FROM users
    `);
    console.log(`   Total users: ${userStats[0].total}`);
    console.log(`   - Voters: ${userStats[0].voters}`);
    console.log(`   - Admins: ${userStats[0].admins}`);
    console.log(`   - Officers: ${userStats[0].officers}`);
    console.log(`   - OTP Verified: ${userStats[0].otp_verified}`);
    console.log(`   - Face Verified: ${userStats[0].face_verified}`);
    console.log(`   - Has Voted: ${userStats[0].has_voted}`);

    // 4. Face data details
    console.log('\n4. FACE RECOGNITION DATA');
    console.log('-'.repeat(60));
    const [faceUsers] = await connection.query(`
      SELECT id, name, email, face_verified, face_registered_at, 
             LENGTH(face_descriptor) as descriptor_length,
             face_image_path
      FROM users 
      WHERE face_verified = 1
      LIMIT 5
    `);
    console.log(`   Users with face data: ${faceUsers.length}`);
    faceUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email})`);
      console.log(`     Descriptor size: ${user.descriptor_length} bytes`);
      console.log(`     Image path: ${user.face_image_path || 'NULL'}`);
      console.log(`     Registered: ${user.face_registered_at}`);
    });

    // 5. Face verification logs
    console.log('\n5. FACE VERIFICATION LOGS');
    console.log('-'.repeat(60));
    const [logs] = await connection.query(`
      SELECT 
        verification_type,
        COUNT(*) as count,
        AVG(similarity_score) as avg_score,
        SUM(CASE WHEN verified = 1 THEN 1 ELSE 0 END) as verified_count
      FROM face_verification_logs
      GROUP BY verification_type
    `);
    if (logs.length > 0) {
      logs.forEach(log => {
        console.log(`   ${log.verification_type}:`);
        console.log(`     Total: ${log.count}`);
        console.log(`     Verified: ${log.verified_count}`);
        console.log(`     Avg Score: ${log.avg_score ? log.avg_score.toFixed(4) : 'N/A'}`);
      });
    } else {
      console.log('   No logs found');
    }

    // 6. Elections
    console.log('\n6. ELECTIONS');
    console.log('-'.repeat(60));
    const [elections] = await connection.query(`
      SELECT 
        election_type,
        COUNT(*) as count,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'upcoming' THEN 1 ELSE 0 END) as upcoming,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed
      FROM elections
      GROUP BY election_type
    `);
    if (elections.length > 0) {
      elections.forEach(e => {
        console.log(`   ${e.election_type}: ${e.count} total (Active: ${e.active}, Upcoming: ${e.upcoming}, Completed: ${e.completed})`);
      });
    } else {
      console.log('   No elections found');
    }

    // 7. Candidates
    console.log('\n7. CANDIDATES');
    console.log('-'.repeat(60));
    const [candidates] = await connection.query('SELECT COUNT(*) as total FROM candidates');
    console.log(`   Total candidates: ${candidates[0].total}`);

    // 8. Parties
    console.log('\n8. PARTIES');
    console.log('-'.repeat(60));
    const [parties] = await connection.query('SELECT COUNT(*) as total FROM parties');
    console.log(`   Total parties: ${parties[0].total}`);

    // 9. Votes
    console.log('\n9. VOTES');
    console.log('-'.repeat(60));
    const [votes] = await connection.query('SELECT COUNT(*) as total FROM votes');
    console.log(`   Total votes cast: ${votes[0].total}`);

    // 10. File system check
    console.log('\n10. FILE SYSTEM');
    console.log('-'.repeat(60));
    const uploadsPath = path.join(__dirname, 'uploads');
    const facesPath = path.join(uploadsPath, 'faces');
    const candidatesPath = path.join(uploadsPath, 'candidates');
    const partiesPath = path.join(uploadsPath, 'party-logos');
    
    console.log(`   Uploads directory: ${fs.existsSync(uploadsPath) ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   Faces directory: ${fs.existsSync(facesPath) ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   Candidates directory: ${fs.existsSync(candidatesPath) ? '✓ EXISTS' : '✗ MISSING'}`);
    console.log(`   Party logos directory: ${fs.existsSync(partiesPath) ? '✓ EXISTS' : '✗ MISSING'}`);

    if (fs.existsSync(facesPath)) {
      const faceFiles = fs.readdirSync(facesPath);
      console.log(`   Face images: ${faceFiles.length} files`);
    }

    // 11. Environment variables
    console.log('\n11. ENVIRONMENT CONFIGURATION');
    console.log('-'.repeat(60));
    console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
    console.log(`   PORT: ${process.env.PORT}`);
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_USER: ${process.env.DB_USER}`);
    console.log(`   DB_PASSWORD: ${process.env.DB_PASSWORD ? '***SET***' : 'EMPTY'}`);
    console.log(`   API_BASE_URL: ${process.env.API_BASE_URL}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}`);
    console.log(`   EMAIL_ENABLED: ${process.env.EMAIL_ENABLED}`);
    console.log(`   JWT_SECRET: ${process.env.JWT_SECRET ? '***SET***' : 'NOT SET'}`);

    // 12. Check for NULL values in critical fields
    console.log('\n12. DATA INTEGRITY CHECK');
    console.log('-'.repeat(60));
    
    const [nullChecks] = await connection.query(`
      SELECT 
        'face_verification_logs' as table_name,
        SUM(CASE WHEN similarity_score IS NULL THEN 1 ELSE 0 END) as null_similarity,
        SUM(CASE WHEN image_path IS NULL THEN 1 ELSE 0 END) as null_image_path,
        COUNT(*) as total
      FROM face_verification_logs
    `);
    
    if (nullChecks[0].total > 0) {
      console.log(`   face_verification_logs:`);
      console.log(`     Total records: ${nullChecks[0].total}`);
      console.log(`     NULL similarity_score: ${nullChecks[0].null_similarity}`);
      console.log(`     NULL image_path: ${nullChecks[0].null_image_path}`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ VERIFICATION COMPLETE');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('\n❌ VERIFICATION FAILED:', error.message);
    console.error(error);
  } finally {
    connection.release();
    process.exit(0);
  }
}

verifyFullSetup().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
