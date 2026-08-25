const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool(process.env.MYSQL_URL);

console.log("✅ Database connected!");

module.exports = pool;