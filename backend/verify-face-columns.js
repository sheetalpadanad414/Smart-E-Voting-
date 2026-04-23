const { pool } = require('./config/database');

async function verifyFaceColumns() {
  const connection = await pool.getConnection();
  
  try {
    console.log('=== Verifying Face Recognition Database Schema ===\n');

    // 1. Check users table structure
    console.log('1. Checking users table columns...');
    const [columns] = await connection.query(`
      SHOW COLUMNS FROM users LIKE 'face%'
    `);
    
    console.log('\nFace-related columns in users table:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}`);
      console.log(`    Type: ${col.Type}`);
      console.log(`    Null: ${col.Null}`);
      console.log(`    Default: ${col.Default}`);
      console.log('');
    });

    // 2. Check face_verification_logs table
    console.log('2. Checking face_verification_logs table...');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'face_verification_logs'
    `);
    
    if (tables.length > 0) {
      console.log('✓ face_verification_logs table exists\n');
      
      const [logColumns] = await connection.query(`
        DESCRIBE face_verification_logs
      `);
      
      console.log('Columns in face_verification_logs:');
      logColumns.forEach(col => {
        console.log(`  - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('✗ face_verification_logs table does NOT exist\n');
    }

    // 3. Check sample user data
    console.log('\n3. Checking sample user face data...');
    const [users] = await connection.query(`
      SELECT id, email, face_verified, face_registered_at,
             CASE 
               WHEN face_descriptor IS NULL THEN 'NULL'
               WHEN face_descriptor = '' THEN 'EMPTY'
               ELSE CONCAT('SET (', LENGTH(face_descriptor), ' chars)')
             END as descriptor_status
      FROM users 
      LIMIT 5
    `);
    
    console.log('\nSample users:');
    console.table(users);

    // 4. Check face_verified default value
    console.log('\n4. Checking face_verified column details...');
    const [faceVerifiedCol] = await connection.query(`
      SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT, EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'users'
        AND COLUMN_NAME = 'face_verified'
    `);
    
    if (faceVerifiedCol.length > 0) {
      console.log('face_verified column details:');
      console.log(`  Column Type: ${faceVerifiedCol[0].COLUMN_TYPE}`);
      console.log(`  Nullable: ${faceVerifiedCol[0].IS_NULLABLE}`);
      console.log(`  Default Value: ${faceVerifiedCol[0].COLUMN_DEFAULT}`);
      console.log(`  Extra: ${faceVerifiedCol[0].EXTRA || 'none'}`);
    }

    // 5. Count users with face registered
    console.log('\n5. Statistics...');
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN face_verified = 1 THEN 1 ELSE 0 END) as face_registered,
        SUM(CASE WHEN face_verified = 0 OR face_verified IS NULL THEN 1 ELSE 0 END) as no_face
      FROM users
    `);
    
    console.log('\nUser face registration statistics:');
    console.table(stats);

    // 6. Check verification logs
    console.log('\n6. Checking verification logs...');
    const [logs] = await connection.query(`
      SELECT COUNT(*) as total_logs,
             SUM(CASE WHEN verification_type = 'registration' THEN 1 ELSE 0 END) as registrations,
             SUM(CASE WHEN verification_type = 'voting' THEN 1 ELSE 0 END) as voting_verifications
      FROM face_verification_logs
    `);
    
    console.log('Verification logs statistics:');
    console.table(logs);

    console.log('\n=== Verification Complete ===');
    
  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run verification
verifyFaceColumns()
  .then(() => {
    console.log('\n✅ All checks completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error);
    process.exit(1);
  });
