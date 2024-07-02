var mysql = require('mysql');
var dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Create a connection pool with configuration from environment variables
var pool = mysql.createPool({
    connectionLimit: 100,
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'API_back',
    port: process.env.DB_PORT || 3306,
    debug: false,
    multipleStatements: true
});

// Log pool creation success
console.log("Database connection pool created");

// Export the pool for use in other parts of the application
module.exports = pool;
