const mysql = require('mysql2/promise');

async function testDatabaseConnection(config) {
    try {
        const connection = await mysql.createConnection({
            host: config.host,
            port: config.port,
            user: config.user,
            password: config.password
        });

        // Test connection
        await connection.ping();

        // Check if database exists
        const [databases] = await connection.query(
            'SHOW DATABASES LIKE ?',
            [config.database]
        );

        let dbExists = databases.length > 0;

        // If database doesn't exist, create it
        if (!dbExists) {
            await connection.query(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
            dbExists = true;
        }

        await connection.end();

        return {
            success: true,
            message: 'Connection successful',
            dbExists: dbExists
        };
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

module.exports = testDatabaseConnection;
