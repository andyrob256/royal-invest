const mysql = require("mysql2/promise");
require("dotenv").config();

// Log the connection details (without password) for debugging
console.log("DB_HOST:", process.env.MYSQLHOST);
console.log("DB_USER:", process.env.MYSQL_USER);
console.log("DB_DATABASE:", process.env.MYSQL_DATABASE);
console.log("DB_PORT:", process.env.MYSQL_PORT);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'mysql.railway.internal',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_ROOT_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'railway',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test the connection
pool.getConnection()
  .then(connection => {
    console.log("✅ Database connected successfully!");
    connection.release();
  })
  .catch(err => {
    console.error("❌ Database connection failed:", err.message);
  });

module.exports = pool;