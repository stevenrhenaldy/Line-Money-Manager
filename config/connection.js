const path = require('path');
const dotenv = require('dotenv');
const mysql = require('mysql2');

dotenv.config({
    path: path.resolve(__dirname, '../.env') 
});

module.exports = mysql.createConnection({
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_DATABASE
});
