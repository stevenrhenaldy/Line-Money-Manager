const connection = require('../config/connection');

module.exports = {
    // createUser(userId) {
    //     return new Promise((resolve, reject) => {
    //         const query = "INSERT INTO `user` (`user_id`) VALUES (?)";
    //         connection.query(query, [userId],
    //             (err, result, fields) => {
    //                 if (err) {
    //                     reject(err);
    //                     throw err;
    //                 }
    //                 resolve(result);
    //             }
    //         );
    //     });
    // },

    // getUser(userId) {
    //     return new Promise((resolve, reject) => {
    //         const query = "SELECT * FROM user WHERE ?";
    //         const data = {
    //             user_id: userId
    //         };
    //         connection.query(query, data,
    //             (err, result, fields) => {
    //                 if (err) {
    //                     reject(err);
    //                     throw err;
    //                 }
    //                 resolve(result);
    //             }
    //         );
    //     });
    // },

    // userEnrolled(userId) {
    //     return new Promise((resolve, reject) => {
    //         const query = "SELECT `step` FROM user WHERE ?";
    //         const data = {
    //             user_id: userId
    //         };
    //         connection.query(query, data,
    //             (err, result, fields) => {
    //                 if (err) {
    //                     reject(err);
    //                     throw err;
    //                 }
    //                 resolve(result[0]);
    //             }
    //         );
    //     });
    // },

    // updateUser(userId, data) {
    //     return new Promise((resolve, reject) => {
    //         const query = "UPDATE user SET ? WHERE ?";
    //         connection.query(query, [data, { user_id: userId }],
    //             (err, result, fields) => {
    //                 if (err) {
    //                     reject(err);
    //                     throw err;
    //                 }
    //                 resolve(result);
    //             }
    //         );
    //     });
    // },

    // deleteUser(userId) {
    //     return new Promise((resolve, reject) => {
    //         const query = "DELETE FROM `user` WHERE ?";
    //         connection.query(query, { user_id: userId },
    //             (err, result, fields) => {
    //                 if (err) {
    //                     reject(err);
    //                     throw err;
    //                 }
    //                 resolve(result);
    //             }
    //         );
    //     });
    // }

    getLanguage(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM language where ?";
            const data = { id: id };
            connection.query(query, data,
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

    getLanguageList() {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM language";
            connection.query(query,
                (err, result, fields) => {
                    if (err) {
                        reject(err);
                        throw err;
                    }
                    resolve(result);
                }
            );
        });
    }

}