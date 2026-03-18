const { pool } = require('./config/database');

async function checkCongressLogo() {
  const connection = await pool.getConnection();
  
  const [parties] = await connection.query(
    'SELECT id, name, logo FROM parties WHERE name = ?',
    ['congress']
  );
  
  connection.release();
  
  if (parties.length > 0) {
    console.log('Congress party in database:');
    console.log('ID:', parties[0].id);
    console.log('Name:', parties[0].name);
    console.log('Logo:', parties[0].logo);
    
    if (parties[0].logo) {
      console.log('\n✓ Logo is stored in database');
      console.log('Full URL should be: http://localhost:5000' + parties[0].logo);
    } else {
      console.log('\n✗ No logo stored');
    }
  } else {
    console.log('Congress party not found');
  }
  
  process.exit(0);
}

checkCongressLogo();
