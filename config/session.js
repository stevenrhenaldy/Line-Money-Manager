const session = require('express-session');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
    path: path.resolve(__dirname, '../.env')
});

const conf = {
	name: process.env.APP_NAME,
	secret: process.env.SESSION_SECRET,
	cookie: {
		maxAge: 86400000
	},
	resave: true,
	saveUninitialized: true
};

module.exports = session(conf);