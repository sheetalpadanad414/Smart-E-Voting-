const db = require('./config/databaseSimple');

async function deleteAdmin() {
  try {
    const [result] = await db.query('DELETE FROM users WHERE email = ?', ['admin@evoting.com']);
    console.log('✓ Old admin deleted');
    process.exit(0);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  }
}

deleteAdmin();
