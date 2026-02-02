const mysql = require('mysql2');

const pool = mysql.createPool({
  host: '127.0.0.1',   
  user: 'root',
  password: '',        
  database: 'clearhorizon',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10
});

module.exports = pool;