const moment = require('moment');
const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const { validationResult } = require('express-validator');


module.exports = {
    show_daily: (req, res) => {
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }

        const userId = req.session.user.id;
        const date = new Date();
        Transaction.getTotal(userId, 1, date.getYear(), date.getMonth() + 1).then((income) => {
            if(income.length == 0){
                req.session.destroy();
            }
            Transaction.getTotal(userId, 2, date.getYear(), date.getMonth() + 1).then((expense) => {
                let common = {
                    income: parseInt(!isNaN(income[0].total) ? income[0].total : 0).commaSeparator(),
                    expense: parseInt(!isNaN(expense[0].total) ? expense[0].total : 0).commaSeparator(),
                    balance: parseInt(!isNaN(income[0].total - expense[0].total) != null ? income[0].total - expense[0].total : 0).commaSeparator(),
                    currency_symbol: income[0].currency_symbol,
                }

                Transaction.getTransactions(userId, date.getYear(), date.getMonth() + 1).then((trans) => {
                    Transaction.getDistinctDate(userId, date.getYear(), date.getMonth() + 1).then((distinctDates) => {
                        const allData = [];
                        distinctDates.forEach(date => {
                            let temp = {
                                date: date.date,
                                data: [],
                                income: 0,
                                expense: 0,
                                currency_symbol: income[0].currency_symbol,
                            }
                            allData.push(temp);
                        });

                        trans.forEach(d => {
                            const index = allData.findIndex(p => new Date(p.date).valueOf() == new Date(d.date).valueOf());
                            if (d.type == 1) {
                                allData[index].income += d.amount;
                            } else if (d.type == 2) {
                                allData[index].expense += d.amount;
                            }
                            allData[index].data.push(d);
                        });

                        res.render('index', {
                            authenticated: req.session.authenticated,
                            user: {
                                name: req.session.user.name,
                                photo: req.session.user.photo,
                            },
                            data: {
                                distinctDate: allData,
                                common: common,
                            },
                            csrfToken: req.csrfToken(),
                            moment: moment
                        });

                    });
                });
            });
        });
    },

    edit_page: (req, res) => {
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }

        const userId = req.session.user.id;
        const transId = parseInt(req.params.transId);
        Transaction.getTransaction(transId).then((result) => {
            const d = result[0];

            if(d.user_id != userId){
                return res.status(404).send('Error 404');
            }
            Category.getCategoryList(d.type).then((categories)=>{
                res.render('edit', {
                    authenticated: req.session.authenticated,
                    user: {
                        name: req.session.user.name,
                        photo: req.session.user.photo,
                    },
                    data: d,
                    categories: categories,
                    csrfToken: req.csrfToken(),
                    moment: moment
                });
            });

        });

    },

    edit_store: (req, res) => {
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }
        const userId = req.session.user.id;
        const transId = parseInt(req.params.transId);

        const errors = validationResult(req).array();
        // console.log(errors);
        if(errors.length>0){
            req.session.error = errors;
            return res.redirect(`/transaction/${transId}`);
        }
        const body = req.body;
        Transaction.getTransaction(transId).then((result) => {
            const d = result[0];

            if(d.user_id != userId){
                return res.redirect(404, `/`);
            }
            
            Transaction.updateSavedTransaction(transId, {
                type: body.type,
                date: body.date,
                category_id: body.category,
                amount: body.amount,
                note: body.note,
            }).then((result) => {
                // console.log(result);
                return res.redirect('/');
            });
        });
    },
    delete_record: (req, res) =>{
        if (!req.session.authenticated) {
            return res.redirect('/auth');
        }
        const userId = req.session.user.id;
        const transId = parseInt(req.params.transId);

        Transaction.getTransaction(transId).then((result) => {
            const d = result[0];

            if(d.user_id != userId){
                return res.redirect(404, `/`);
            }
            
            Transaction.deleteTransaction(transId).then((result) => {
                if(result.affectedRows > 0){
                    return res.status(200).json({
                        status: "success", 
                        redirectUrl: "/"
                    });
                }else{
                    return res.status(200).json({
                        status: "error",
                    });
                }
            });
        });
    }

};
