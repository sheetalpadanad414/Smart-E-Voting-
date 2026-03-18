const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const fixCollation = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('🔧 Fixing database collation issues...\n');

    // Fix parties table collation
    console.log('1️⃣ Fixing parties table...');
    await connection.query(`
      ALTER TABLE parties 
      CONVERT TO CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('✓ Parties table fixed\n');

    // Fix candidates table collation
    console.log('2️⃣ Fixing candidates table...');
    await connection.query(`
      ALTER TABLE candidates 
      CONVERT TO CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('✓ Candidates table fixed\n');

    // Fix elections table collation
    console.log('3️⃣ Fixing elections table...');
    await connection.query(`
      ALTER TABLE elections 
      CONVERT TO CHARACTER SET utf8mb4 
      COLLATE utf8mb4_unicode_ci
    `);
    console.log('✓ Elections table fixed\n');

    await connection.end();
    console.log('✅ Collation fix completed successfully!\n');
    console.log('🎉 All tables now use utf8mb4_unicode_ci collation');
    console.log('\n📋 Next steps:');
    console.log('  1. Refresh the candidates page');
    console.log('  2. The "Failed to load candidates" error should be gone');

  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
};

fixCollation();
