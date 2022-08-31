const line = require('@line/bot-sdk');
const config = require('../config/lineConfig');

module.exports = {
    lineClient: new line.Client(config),
    lineMiddleware: line.middleware(config)
};