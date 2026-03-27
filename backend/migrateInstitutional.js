require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    await conn.query("ALTER TABLE elections ADD COLUMN scope ENUM('political','institutional') NOT NULL DEFAULT 'political'");
    console.log('✓ Added scope to elections');
  } catch(e) { console.log('scope:', e.message); }

  try {
    await conn.query("ALTER TABLE candidates ADD COLUMN organization VARCHAR(150) NULL");
    console.log('✓ Added organization to candidates');
  } catch(e) { console.log('organization:', e.message); }

  try {
    await conn.query("ALTER TABLE candidates ADD COLUMN inst_role VARCHAR(100) NULL");
    console.log('✓ Added inst_role to candidates');
  } catch(e) { console.log('inst_role:', e.message); }

  await conn.end();
  console.log('Migration complete');
}

run();
