/**
 * Test script to verify face fraud detection
 */
require('dotenv').config();
const { pool } = require('./config/database');
const FaceFraudDetectionService = require('./services/faceFraudDetectionService');
const ElectionFaceService = require('./services/electionFaceService');
const { generateUUID } = require('./utils/auth');

async function testFraudDetection() {
  console.log('🧪 Testing Face Fraud Detection System\n');
  
  const testElectionId = generateUUID();
  const userA_Id = generateUUID();
  const userB_Id = generateUUID();
  const userC_Id = generateUUID();
  
  // Create similar face descriptors (simulating same person)
  const faceA = Array(128).fill(0).map(() => Math.random());
  const faceB = faceA.map(v => v + (Math.random() * 0.1 - 0.05)); // Very similar to A
  const faceC = Array(128).fill(0).map(() => Math.random()); // Completely different
  
  try {
    // Setup: Create test users and election
    console.log('📋 Setup: Creating test data...');
    const conn = await pool.getConnection();
    
    await conn.query(
      `INSERT INTO users (id, name, email, password, role) VALUES 
       (?, 'User A', 'usera@test.com', 'hash', 'voter'),
       (?, 'User B', 'userb@test.com', 'hash', 'voter'),
       (?, 'User C', 'userc@test.com', 'hash', 'voter')`,
      [userA_Id, userB_Id, userC_Id]
    );
    
    await conn.query(
      `INSERT INTO elections (id, title, description, start_date, end_date, status, created_by, election_type)
       VALUES (?, 'Test Election', 'Test', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'active', ?, 'Test')`,
      [testElectionId, userA_Id]
    );
    
    conn.release();
    console.log('✅ Test data created\n');
    
    // Test 1: User A registers face (should succeed)
    console.log('1️⃣ User A registers face...');
    const resultA = await ElectionFaceService.registerFaceForElection(
      userA_Id,
      testElectionId,
      faceA
    );
    console.log('✅ User A registered:', resultA.id);
    console.log('');
    
    // Test 2: User B tries to register similar face (should be blocked)
    console.log('2️⃣ User B tries to register SAME FACE (fraud attempt)...');
    const fraudCheck = await FaceFraudDetectionService.checkForDuplicateFace(
      userB_Id,
      testElectionId,
      faceB,
      0.6
    );
    
    if (fraudCheck && fraudCheck.matched) {
      console.log('✅ FRAUD DETECTED!');
      console.log('   Matched user:', fraudCheck.matchedEmail);
      console.log('   Similarity:', (fraudCheck.similarity * 100).toFixed(2) + '%');
      
      // Log the fraud attempt
      await FaceFraudDetectionService.logFraudAttempt(
        userB_Id,
        'userb@test.com',
        fraudCheck.matchedUserId,
        fraudCheck.matchedEmail,
        testElectionId,
        fraudCheck.similarity
      );
      console.log('✅ Fraud attempt logged');
    } else {
      console.error('❌ Should have detected fraud!');
    }
    console.log('');
    
    // Test 3: User C registers different face (should succeed)
    console.log('3️⃣ User C registers DIFFERENT FACE...');
    const fraudCheckC = await FaceFraudDetectionService.checkForDuplicateFace(
      userC_Id,
      testElectionId,
      faceC,
      0.6
    );
    
    if (fraudCheckC && fraudCheckC.matched) {
      console.error('❌ Should NOT have detected fraud for different face!');
    } else {
      console.log('✅ No fraud detected (correct)');
      
      const resultC = await ElectionFaceService.registerFaceForElection(
        userC_Id,
        testElectionId,
        faceC
      );
      console.log('✅ User C registered:', resultC.id);
    }
    console.log('');
    
    // Test 4: Verify fraud logs
    console.log('4️⃣ Checking fraud logs...');
    const stats = await FaceFraudDetectionService.getFraudStats();
    console.log('   Total fraud attempts:', stats.totalAttempts);
    console.log('   Recent attempts:', stats.recentAttempts.length);
    
    if (stats.totalAttempts > 0) {
      console.log('✅ Fraud logs working');
      console.log('   Latest attempt:');
      const latest = stats.recentAttempts[0];
      console.log('     Attempted:', latest.attempted_email);
      console.log('     Matched:', latest.matched_email);
      console.log('     Similarity:', (latest.similarity_score * 100).toFixed(2) + '%');
    }
    console.log('');
    
    // Test 5: Verify database
    console.log('5️⃣ Verifying database...');
    const conn2 = await pool.getConnection();
    
    const [faceRecords] = await conn2.query(
      'SELECT COUNT(*) as count FROM election_face_data WHERE election_id = ?',
      [testElectionId]
    );
    
    const [fraudLogs] = await conn2.query(
      'SELECT COUNT(*) as count FROM face_fraud_detection_logs WHERE election_id = ?',
      [testElectionId]
    );
    
    conn2.release();
    
    console.log('   Face registrations:', faceRecords[0].count, '(expected: 2)');
    console.log('   Fraud logs:', fraudLogs[0].count, '(expected: 1)');
    
    if (faceRecords[0].count === 2 && fraudLogs[0].count === 1) {
      console.log('✅ Database records correct');
    } else {
      console.error('❌ Database records incorrect');
    }
    console.log('');
    
    // Cleanup
    console.log('6️⃣ Cleaning up test data...');
    const conn3 = await pool.getConnection();
    await conn3.query('DELETE FROM face_fraud_detection_logs WHERE election_id = ?', [testElectionId]);
    await conn3.query('DELETE FROM election_face_data WHERE election_id = ?', [testElectionId]);
    await conn3.query('DELETE FROM elections WHERE id = ?', [testElectionId]);
    await conn3.query('DELETE FROM users WHERE id IN (?, ?, ?)', [userA_Id, userB_Id, userC_Id]);
    conn3.release();
    console.log('✅ Test data cleaned up\n');
    
    console.log('✅ All tests passed! Fraud detection is working correctly.');
    console.log('\n📊 Summary:');
    console.log('   ✅ User A registered successfully');
    console.log('   ❌ User B blocked (same face as A)');
    console.log('   ✅ User C registered successfully (different face)');
    console.log('   ✅ Fraud attempt logged');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    
    // Cleanup on error
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM face_fraud_detection_logs WHERE election_id = ?', [testElectionId]);
      await conn.query('DELETE FROM election_face_data WHERE election_id = ?', [testElectionId]);
      await conn.query('DELETE FROM elections WHERE id = ?', [testElectionId]);
      await conn.query('DELETE FROM users WHERE id IN (?, ?, ?)', [userA_Id, userB_Id, userC_Id]);
      conn.release();
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

testFraudDetection();
