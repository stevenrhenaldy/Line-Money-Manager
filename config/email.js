const path = require('path');
const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

dotenv.config({
    path: path.resolve(__dirname, '../.env') 
});

module.exports = [nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
}), process.env.EMAIL_USER];
