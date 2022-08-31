const connection = require('../config/connection');

module.exports = {

    getCategory(id) {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM category WHERE ?";
            const where = {
                'id': id
            }
            connection.query(query, [where],
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
    
    getCategoryList(type, limit = null, offset = null) {
        return new Promise((resolve, reject) => {
            let query = "SELECT * FROM category WHERE ?";
            const where = {
                'type': type
            }
            let d = [where];
            if(limit != null){
                query += " LIMIT ?";
                d.push(limit);
            }
            if(offset != null){
                query += " OFFSET ?";
                d.push(offset);
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

    getNearestCategory(word){
        return new Promise((resolve, reject) => {
            let query = "SELECT category.* FROM category WHERE JSON_EXTRACT(alias, '$') LIKE ? OR NAME LIKE ? LIMIT 1";
            let d = [`%${word}%`, `%${word}%`];

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
    }
    
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

}