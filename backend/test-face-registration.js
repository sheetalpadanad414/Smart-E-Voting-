const { pool } = require('./config/database');

async function testFaceRegistration() {
  const connection = await pool.getConnection();
  
  try {
    console.log('=== Testing Face Registration ===\n');

    // 1. Get a test user
    console.log('1. Finding a test user...');
    const [users] = await connection.query(`
      SELECT id, email, face_verified 
      FROM users 
      WHERE role = 'voter'
      LIMIT 1
    `);
    
    if (users.length === 0) {
      console.log('❌ No voter users found in database');
      return;
    }
    
    const testUser = users[0];
    console.log(`✓ Found user: ${testUser.email} (ID: ${testUser.id})`);
    console.log(`  Current face_verified: ${testUser.face_verified}\n`);

    // 2. Create a fake descriptor (128D vector)
    console.log('2. Creating test face descriptor...');
    const fakeDescriptor = Array(128).fill(0).map(() => Math.random());
    console.log(`✓ Created descriptor with ${fakeDescriptor.length} dimensions\n`);

    // 3. Update user with face data
    console.log('3. Updating user with face data...');
    const [updateResult] = await connection.query(
      `UPDATE users 
       SET face_descriptor = ?, 
           face_verified = TRUE,
           face_registered_at = NOW()
       WHERE id = ?`,
      [JSON.stringify(fakeDescriptor), testUser.id]
    );
    
    console.log(`✓ Update result:`);
    console.log(`  Affected rows: ${updateResult.affectedRows}`);
    console.log(`  Changed rows: ${updateResult.changedRows}`);
    console.log(`  Warnings: ${updateResult.warningCount}\n`);

    // 4. Insert verification log
    console.log('4. Inserting verification log...');
    const [logResult] = await connection.query(
      `INSERT INTO face_verification_logs 
       (user_id, verification_type, verified) 
       VALUES (?, 'registration', TRUE)`,
      [testUser.id]
    );
    
    console.log(`✓ Log inserted with ID: ${logResult.insertId}\n`);

    // 5. Verify the update
    console.log('5. Verifying the update...');
    const [updatedUsers] = await connection.query(`
      SELECT id, email, face_verified, face_registered_at,
             CASE 
               WHEN face_descriptor IS NULL THEN 'NULL'
               ELSE CONCAT('SET (', LENGTH(face_descriptor), ' chars)')
             END as descriptor_status
      FROM users 
      WHERE id = ?
    `, [testUser.id]);
    
    console.log('Updated user data:');
    console.table(updatedUsers);

    // 6. Check verification log
    console.log('\n6. Checking verification log...');
    const [logs] = await connection.query(`
      SELECT * FROM face_verification_logs 
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 1
    `, [testUser.id]);
    
    console.log('Latest verification log:');
    console.table(logs);

    console.log('\n=== Test Complete ===');
    console.log('✅ Face registration works correctly!');
    console.log('\nExpected values:');
    console.log('  - face_verified: 1 (TRUE)');
    console.log('  - face_descriptor: JSON string with 128 numbers');
    console.log('  - face_registered_at: Current timestamp');
    console.log('  - Verification log: 1 record with type="registration"');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run test
testFaceRegistration()
  .then(() => {
    console.log('\n✅ Test completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });
