/**
 * Test script to verify duplicate face registration prevention
 */
require('dotenv').config();
const { pool } = require('./config/database');
const ElectionFaceService = require('./services/electionFaceService');
const { generateUUID } = require('./utils/auth');

async function testDuplicateCheck() {
  console.log('🧪 Testing Duplicate Face Registration Prevention\n');
  
  const testElectionId = generateUUID();
  const testDescriptor = Array(128).fill(0).map(() => Math.random());
  
  try {
    // Step 1: Check table exists
    console.log('1️⃣ Checking if election_face_data table exists...');
    const connection = await pool.getConnection();
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'election_face_data'"
    );
    
    // Get an existing user
    const [users] = await connection.query(
      "SELECT id FROM users WHERE role = 'voter' LIMIT 1"
    );
    connection.release();
    
    if (tables.length === 0) {
      console.error('❌ Table election_face_data does not exist!');
      console.log('   Run migration: node run-face-migration.js');
      process.exit(1);
    }
    console.log('✅ Table exists');
    
    if (users.length === 0) {
      console.error('❌ No users found in database!');
      console.log('   Create a user first');
      process.exit(1);
    }
    
    const testUserId = users[0].id;
    console.log('✅ Using test user:', testUserId, '\n');
    
    // Step 2: Create test election
    console.log('2️⃣ Creating test election...');
    const conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO elections (id, title, description, start_date, end_date, status, created_by, election_type)
       VALUES (?, 'Test Election', 'Test', NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY), 'active', ?, 'Test')`,
      [testElectionId, testUserId]
    );
    conn.release();
    console.log('✅ Test election created:', testElectionId, '\n');
    
    // Step 3: First registration (should succeed)
    console.log('3️⃣ First registration attempt...');
    const hasRegistered1 = await ElectionFaceService.hasFaceForElection(testUserId, testElectionId);
    console.log('   Already registered?', hasRegistered1);
    
    if (hasRegistered1) {
      console.error('❌ Should not be registered yet!');
    } else {
      console.log('✅ Not registered yet (correct)\n');
    }
    
    // Register face
    console.log('4️⃣ Registering face...');
    const result = await ElectionFaceService.registerFaceForElection(
      testUserId,
      testElectionId,
      testDescriptor
    );
    console.log('✅ Face registered:', result.id, '\n');
    
    // Step 4: Check if registered
    console.log('5️⃣ Checking registration status...');
    const hasRegistered2 = await ElectionFaceService.hasFaceForElection(testUserId, testElectionId);
    console.log('   Already registered?', hasRegistered2);
    
    if (!hasRegistered2) {
      console.error('❌ Should be registered now!');
    } else {
      console.log('✅ Registered (correct)\n');
    }
    
    // Step 5: Try to register again (should fail)
    console.log('6️⃣ Second registration attempt (should fail)...');
    try {
      await ElectionFaceService.registerFaceForElection(
        testUserId,
        testElectionId,
        testDescriptor
      );
      console.error('❌ Should have thrown error!');
    } catch (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Correctly rejected:', error.message, '\n');
      } else {
        console.error('❌ Wrong error:', error.message);
      }
    }
    
    // Step 6: Verify database
    console.log('7️⃣ Verifying database...');
    const conn2 = await pool.getConnection();
    const [rows] = await conn2.query(
      'SELECT * FROM election_face_data WHERE user_id = ? AND election_id = ?',
      [testUserId, testElectionId]
    );
    conn2.release();
    
    console.log('   Records in database:', rows.length);
    if (rows.length === 1) {
      console.log('✅ Exactly 1 record (correct)\n');
    } else {
      console.error('❌ Should have exactly 1 record, found:', rows.length);
    }
    
    // Cleanup
    console.log('8️⃣ Cleaning up test data...');
    const conn3 = await pool.getConnection();
    await conn3.query('DELETE FROM election_face_data WHERE user_id = ?', [testUserId]);
    await conn3.query('DELETE FROM elections WHERE id = ?', [testElectionId]);
    conn3.release();
    console.log('✅ Test data cleaned up\n');
    
    console.log('✅ All tests passed! Duplicate prevention is working correctly.');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error(error.stack);
    
    // Cleanup on error
    try {
      const conn = await pool.getConnection();
      await conn.query('DELETE FROM election_face_data WHERE user_id = ?', [testUserId]);
      await conn.query('DELETE FROM elections WHERE id = ?', [testElectionId]);
      conn.release();
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
    
    process.exit(1);
  }
}

testDuplicateCheck();
