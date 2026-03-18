const { pool } = require('./config/database');

async function fixCongressLogo() {
  console.log('Fixing congress party logo...\n');
  
  const connection = await pool.getConnection();
  
  // Clear the invalid logo path
  await connection.query(
    'UPDATE parties SET logo = NULL WHERE name = ?',
    ['congress']
  );
  
  console.log('✓ Cleared invalid logo path for congress party');
  console.log('✓ You can now upload a new logo from the frontend');
  console.log('\nSteps:');
  console.log('1. Go to http://localhost:3001/admin/parties');
  console.log('2. Click edit (pencil icon) on congress party');
  console.log('3. Upload a new logo');
  console.log('4. Click "Update Party"');
  
  connection.release();
  process.exit(0);
}

fixCongressLogo();
