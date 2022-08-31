const moment = require('moment');
const excelJS = require('exceljs');
const path = require('path');
const ejs = require('ejs');
const [email, email_user] = require('../config/email');
const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const { validationResult } = require('express-validator');

const folder = "../exports";  // Path to download excel
const viewFileLoc = path.resolve(__dirname, `../views/mail/export.ejs`);

module.exports = {
    index: (req, res) => {
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }
        res.render('export', {
            authenticated: req.session.authenticated,
            message: req.session.message,
            user: {
                name: req.session.user.name,
                photo: req.session.user.photo,
            },
            csrfToken: req.csrfToken(),
            moment: moment
        });
        req.session.message = null;
    },

    export: (req, res) => {
        const date = new Date();
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }
        const userId = req.session.user.id;

        const errors = validationResult(req).array();
        if (errors.length > 0) {
            req.session.error = errors;
            return res.redirect(`/export`);
        }
        const body = req.body;


        const workbook = new excelJS.Workbook();  // Create a new workbook
        const worksheet = workbook.addWorksheet("Transactions"); // New Worksheet

        // Column for data in excel. key must match data key
        worksheet.columns = [
            { header: "No.", key: "no", width: 5 },
            { header: "Date", key: "date", width: 10 },
            { header: "Category", key: "category", width: 10 },
            { header: "Note", key: "note", width: 50 },
            { header: "Income/Expense", key: "type", width: 20 },
            { header: "Currency", key: "currency", width: 10 },
            { header: "Income", key: "income", width: 25 },
            { header: "Expense", key: "expense", width: 25 },
            { header: "Account", key: "account", width: 25 },
        ];

        Transaction.exportTransactions(userId, date.getYear(), date.getMonth() + 1).then((trans) => {
            let acc = 0;
            trans.forEach((d, key) => {
                acc += d.type == 1 ? d.amount : 0;
                acc -= d.type == 2 ? d.amount : 0;
                let exportData = {
                    no: key + 1,
                    date: d.date,
                    category: d.category,
                    note: d.note,
                    type: d.type == 1 ? "Income" : "Expense",
                    currency: d.currency_abbreviation,
                    income: d.type == 1 ? d.amount : "",
                    expense: d.type == 2 ? d.amount : "",
                    account: acc,
                };

                // console.log(exportData)
                worksheet.addRow(exportData); // Add data in worksheet
            });

            worksheet.getRow(1).eachCell((cell) => {
                cell.font = { bold: true };
            });
            
            
            
            try {
                
                const filename = path.resolve(__dirname, `${folder}/${Date.now()}_${userId}.xlsx`);
                const data = workbook.xlsx.writeFile(filename)
                    .then(() => {
                        ejs.renderFile(viewFileLoc, {
                            name: req.session.user.name,
                            year: new Date().getFullYear(),
                        }).then(result => {
                            const mailOptions = {
                                from: email_user,
                                to: body.email,
                                subject: `Money Manager ${req.session.user.name}`,
                                html: result,
                                text: `Hi ${req.session.user.name}, thank you for using Money Manger by atRest.\n Attached is your transaction log.`,
    
                                attachments: [
                                    {   // file on disk as an attachment
                                        filename: 'transaction.xlsx',
                                        path: filename // stream this file
                                    },
                                ]
                            }
                            email.sendMail(mailOptions, function (error, info) {
                                console.log(`Sending mail to ${body.email}`);
                                if (error) {
                                    console.log(error);
    
                                    req.session.message = {
                                        status: "error",
                                        message: "Something went wrong",
                                    };
                                    return res.redirect(`/export`);
                                } else {
                                    console.log('Email sent: ' + info.response);
    
                                    req.session.message = {
                                        status: "success",
                                        message: `File has been sent to ${body.email}`,
                                    };
                                    return res.redirect(`/export`);
                                }
                            });
                        }).catch(err => {
                            console.log("Error", err);
                            req.session.message = {
                                status: "error",
                                message: "Something went wrong",
                            };
                            return res.redirect(`/export`);
                        });
                        


                    });
            } catch (err) {
                console.log(err);

                req.session.message = {
                    status: "error",
                    message: "Something went wrong",
                };
                return res.redirect(`/export`);
            }
        });

    },


};
