const mysql = require('mysql2/promise');
require('dotenv').config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'smart_evoting',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test database connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✓ Database Connected Successfully');
    connection.release();
  } catch (error) {
    console.error('✗ Database Connection Failed:', error.message);
    process.exit(1);
  }
};

// Export pool and test function
module.exports = pool;
module.exports.testConnection = testConnection;
