const client = require('./Client').lineClient;

module.exports = {
    getClientProfile(userId) {
        return new Promise((resolve, reject) => {
            client
                .getProfile(userId)
                .then((profile) => {
                    resolve(profile);
                })
                .catch((err) => {
                    reject(err);
                    throw err;
                });
        });
    }

}