require('dotenv').config();
const db = require('./config/databaseSimple');

async function checkUsersTable() {
  try {
    console.log('\n' + '='.repeat(60));
    console.log('CHECKING USERS TABLE STRUCTURE');
    console.log('='.repeat(60) + '\n');

    // Show table structure
    const [structure] = await db.query('DESCRIBE users');
    console.log('Table Structure:');
    console.table(structure);

    // Show AUTO_INCREMENT value
    const [status] = await db.query(`
      SELECT AUTO_INCREMENT 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME || 'smart_evoting']);
    
    console.log('\nAUTO_INCREMENT value:', status[0]?.AUTO_INCREMENT || 'Not set');

    // Count users
    const [count] = await db.query('SELECT COUNT(*) as total FROM users');
    console.log('Total users:', count[0].total);

    // Show last few users
    const [users] = await db.query('SELECT id, name, email, role FROM users ORDER BY id DESC LIMIT 5');
    console.log('\nLast 5 users:');
    console.table(users);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsersTable();
