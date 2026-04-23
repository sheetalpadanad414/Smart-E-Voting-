const { pool } = require('./config/database');

async function verifySetup() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔍 Verifying Face Recognition Setup...\n');

    // 1. Check database connection
    console.log('1. Database Connection:');
    const [dbInfo] = await connection.query('SELECT DATABASE() as db');
    console.log(`   ✓ Connected to: ${dbInfo[0].db}\n`);

    // 2. Check users table for face columns
    console.log('2. Users Table Face Columns:');
    const [columns] = await connection.query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'smart_e_voting' 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME LIKE 'face%'
    `);
    
    if (columns.length > 0) {
      columns.forEach(col => {
        console.log(`   ✓ ${col.COLUMN_NAME} (${col.DATA_TYPE})`);
      });
    } else {
      console.log('   ✗ No face columns found!');
    }
    console.log('');

    // 3. Check face_verification_logs table
    console.log('3. Face Verification Logs Table:');
    const [tables] = await connection.query(`
      SHOW TABLES LIKE 'face_verification_logs'
    `);
    
    if (tables.length > 0) {
      console.log('   ✓ Table exists');
      const [logColumns] = await connection.query(`
        DESCRIBE face_verification_logs
      `);
      logColumns.forEach(col => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    } else {
      console.log('   ✗ Table does not exist!');
    }
    console.log('');

    // 4. Check for users with face data
    console.log('4. Users with Face Data:');
    const [faceUsers] = await connection.query(`
      SELECT COUNT(*) as total,
             SUM(CASE WHEN face_verified = 1 THEN 1 ELSE 0 END) as verified,
             SUM(CASE WHEN face_descriptor IS NOT NULL THEN 1 ELSE 0 END) as has_descriptor
      FROM users
    `);
    console.log(`   Total users: ${faceUsers[0].total}`);
    console.log(`   Face verified: ${faceUsers[0].verified}`);
    console.log(`   Has descriptor: ${faceUsers[0].has_descriptor}\n`);

    // 5. Check verification logs
    console.log('5. Verification Logs:');
    const [logs] = await connection.query(`
      SELECT COUNT(*) as total,
             verification_type,
             AVG(similarity_score) as avg_similarity
      FROM face_verification_logs
      GROUP BY verification_type
    `);
    
    if (logs.length > 0) {
      logs.forEach(log => {
        console.log(`   ${log.verification_type}: ${log.total} logs (avg similarity: ${log.avg_similarity ? log.avg_similarity.toFixed(4) : 'N/A'})`);
      });
    } else {
      console.log('   No logs yet');
    }
    console.log('');

    // 6. Check environment configuration
    console.log('6. Environment Configuration:');
    console.log(`   DB_HOST: ${process.env.DB_HOST}`);
    console.log(`   DB_NAME: ${process.env.DB_NAME}`);
    console.log(`   DB_PORT: ${process.env.DB_PORT}`);
    console.log(`   API_BASE_URL: ${process.env.API_BASE_URL}`);
    console.log(`   FRONTEND_URL: ${process.env.FRONTEND_URL}\n`);

    console.log('✅ Setup verification complete!');
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  } finally {
    connection.release();
    process.exit(0);
  }
}

verifySetup().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
