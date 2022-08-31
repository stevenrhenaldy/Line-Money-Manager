const connection = require('../config/connection');
const User = require('./User');

module.exports = {
    createTransaction(userId, type, withStep, more = null) {
        return new Promise((resolve, reject) => {
            User.getUser(userId).then((res) => {
                const id = res[0].id;
                if (withStep) {
                    const query = "INSERT INTO `transaction` (`user_id`, `type`, `step`) VALUES (?, ?, ?)";
                    connection.query(query, [id, type, 0],
                        (err, result, fields) => {
                            if (err) {
                                reject(err);
                                throw err;
                            }
                            resolve(result);
                        }
                    );
                } else {
                    
                    const query = "INSERT INTO `transaction` (`user_id`, `type`, `category_id`, `amount`, `date`, `note`, `step`) VALUES (?, ?, ?, ?, ?, ?, ?)";
                    connection.query(query, [id, type, more.category_id, more.amount, more.date, more.note, 6],
                        (err, result, fields) => {
                            if (err) {
                                reject(err);
                                throw err;
                            }
                            resolve(result);
                        }
                    );
                }
            });
        });
    },

    getTransactions(id, day = null, month = null, year = null) {
        return new Promise((resolve, reject) => {

            let query = "SELECT * FROM `transaction_view` WHERE user_id = ?";
            const d = [id];
            if (day != null) {
                query.concat(" AND day = ?");
                d.push(day);
            }
            if (month != null) {
                query.concat(" AND month = ?");
                d.push(month);
            }
            if (year != null) {
                query.concat(" AND year = ?");
                d.push(year);
            }
            connection.query(query, d,
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });

    },

    exportTransactions(id, day = null, month = null, year = null) {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM `transaction_view` WHERE user_id = ? ORDER BY `transaction_view`.`id` ASC";
            const d = [id];
            // if (day != null) {
            //     query.concat(" AND day = ?");
            //     d.push(day);
            // }
            // if (month != null) {
            //     query.concat(" AND month = ?");
            //     d.push(month);
            // }
            // if (year != null) {
            //     query.concat(" AND year = ?");
            //     d.push(year);
            // }

            // query.concat(" ORDER BY `id` ASC");
            connection.query(query, d,
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });

    },

    getTransaction(transactionId) {
        return new Promise((resolve, reject) => {

            let query = "SELECT * FROM `transaction_view` WHERE ?";
            // const d = [id];
            const d = {
                id: transactionId,
            }

            connection.query(query, d,
                (err, result, d) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });

    },

    getDistinctDate(id, year = null, month = null, day = null) {
        return new Promise((resolve, reject) => {
            let query = "SELECT DISTINCT date AS date FROM `transaction_view` WHERE user_id = ? ORDER BY date DESC";
            const d = [id];
            if (day != null) {
                query.concat(" AND day = ?");
                d.push(day);
            }
            if (month != null) {
                query.concat(" AND month = ?");
                d.push(month);
            }
            if (year != null) {
                query.concat(" AND year = ?");
                d.push(year);
            }
            connection.query(query, d,
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });

    },

    getTotal(id, type, year = null, month = null, day = null) {
        return new Promise((resolve, reject) => {

            let query = "SELECT SUM(`amount`) AS total, `currency_symbol` FROM `transaction_view` WHERE `type` = ? AND user_id = ?";
            const d = [type, id];
            if (day != null) {
                query.concat(" AND day = ?");
                d.push(day);
            }
            if (month != null) {
                query.concat(" AND month = ?");
                d.push(month);
            }
            if (year != null) {
                query.concat(" AND year = ?");
                d.push(year);
            }
            connection.query(query, d,
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });

    },

    getRunningTransactionStep(userId) {
        return new Promise((resolve, reject) => {
            User.getUser(userId).then((res) => {
                id = res[0].id;
                const query = "SELECT * FROM `transaction` WHERE ? AND `step` < 5 ORDER BY id DESC LIMIT 1";
                connection.query(query, {
                    user_id: id,
                },
                    (err, result, fields) => {
                        if (err) {
                            reject(err);
                            throw err;
                        }
                        resolve(result);
                    }
                );
            });
        });
    },

    getLastCompleteTransaction(userId) {
        return new Promise((resolve, reject) => {
            User.getUser(userId).then((res) => {
                id = res[0].id;
                const query =
                    'SELECT transaction.*, category.name AS category, user_view.currency_symbol FROM transaction INNER JOIN category ON transaction.category_id = category.id INNER JOIN user_view ON transaction.user_id = user_view.id WHERE transaction.user_id = ? AND transaction.step >= 5 ORDER BY id DESC LIMIT 1;';
                connection.query(query, [id],
                    (err, result, fields) => {
                        if (err) {
                            reject(err);
                            throw err;
                        }
                        resolve(result);
                    }
                );
            });
        });
    },

    updateTransaction(userId, data) {
        return new Promise((resolve, reject) => {
            User.getUser(userId).then((res) => {
                id = res[0].id;
                const query = "UPDATE `transaction` SET ? WHERE ? AND `step` < 5 ORDER BY id DESC LIMIT 1";
                connection.query(query, [data, { user_id: id }],
                    (err, result, fields) => {
                        if (err) {
                            reject(err);
                            throw err;
                        }
                        resolve(result);
                    }
                );
            });
        });
    },

    updateSavedTransaction(id, data) {
        return new Promise((resolve, reject) => {
            const query = "UPDATE `transaction` SET ? WHERE ?";
            connection.query(query, [data, { id: id }],
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });
    },

    deleteRunningTransaction(userId) {
        return new Promise((resolve, reject) => {
            User.getUser(userId).then((res) => {
                const query = "DELETE FROM `transaction` WHERE ? AND `step` < 5";
                connection.query(query, { user_id: res[0].id },
                    (err, result, fields) => {
                        if (err) {
                            reject(err);
                            throw err;
                        }
                        resolve(result);
                    }
                );
            });
        });
    },

    deleteTransaction(id) {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM `transaction` WHERE ?";
            connection.query(query, { id: id },
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });
    },

}
