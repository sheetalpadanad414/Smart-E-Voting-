const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const checkTable = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
  });

  try {
    console.log('📋 Checking candidates table structure...\n');
    
    const [columns] = await connection.query('DESCRIBE candidates');
    console.log('Columns:');
    console.table(columns);
    
    console.log('\n📋 Checking parties table...\n');
    const [partiesExist] = await connection.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.tables 
      WHERE table_schema = ? AND table_name = 'parties'
    `, [process.env.DB_NAME]);
    
    if (partiesExist[0].count > 0) {
      const [partiesDesc] = await connection.query('DESCRIBE parties');
      console.log('Parties table structure:');
      console.table(partiesDesc);
    } else {
      console.log('⚠ Parties table does not exist');
    }
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await connection.end();
    process.exit(1);
  }
};

checkTable();
