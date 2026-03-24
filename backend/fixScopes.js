require('dotenv').config();
const mysql = require('mysql2/promise');

async function run() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  const [r1] = await conn.query(
    "UPDATE elections SET scope='institutional' WHERE LOWER(title) REGEXP 'college|university|society|company board'"
  );
  console.log('Marked institutional:', r1.affectedRows);

  const [r2] = await conn.query(
    "UPDATE elections SET scope='political' WHERE scope IS NULL OR scope=''"
  );
  console.log('Marked political:', r2.affectedRows);

  const [rows] = await conn.query('SELECT title, election_type, scope FROM elections ORDER BY title');
  rows.forEach(r => console.log(String(r.scope).padEnd(15), r.title));

  await conn.end();
}

run();
