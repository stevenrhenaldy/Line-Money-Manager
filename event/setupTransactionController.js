const client = require('../model/Client').lineClient;
const moment = require('moment');

const Transaction = require('../model/Transaction');

const Category = require('../model/Category');

function setupTransaction(event, enteredStep, msgBefore = [], msgAfter = []) {
    const userId = event.source.userId;
    Transaction.getRunningTransactionStep(userId).then((r) => {
        const d = r[0];
        switch(d.step){
            case 0:
                var today = new Date();
                return client.replyMessage(event.replyToken, [
                    ...msgBefore,
                    {
                        type: "template",
                        altText: "Date",
                        template: {
                            type: "buttons",
                            title: "Select Date",
                            text: "Please select your transaction date",
                            actions: [
                                {
                                    type: "postback",
                                    label: `Today ( ${moment(today).format('M/D')} )`,
                                    data: JSON.stringify({
                                        action: "date-select",
                                        date: `${moment(today).format('YYYY-MM-DD')}`
                                    }),
                                },
                                {
                                    type: "datetimepicker",
                                    label: "Select date",
                                    mode: "date",
                                    data: JSON.stringify({
                                        action: "date-select",
                                    }),
                                    max: `${moment(today).format('YYYY-MM-DD')}`,
                                }
                            ]
                        }
                    }
                ]);
                break;
            case 1:
                Category.getCategoryList(d.type, 21, 0).then((result) => {
                    let qReply = [];
                    result.forEach((d) => {
                        qReply.push({
                            "type": "action",
                            "action": {
                                "type": "postback",
                                "data": JSON.stringify({
                                    action: "category-select",
                                    category: d.id
                                }),
                                "label": `${(d.name).capitalize()}`,
                                inputOption: "openKeyboard",
                            }
                        });
                    });
                    return client.replyMessage(event.replyToken, [
                        ...msgBefore,
                        {
                            type: "text",
                            text: "Please select the transaction category",
                            quickReply: {
                                items: qReply
                            }

                        }
                    ]);
                });
                break;
            case 2:
                return client.replyMessage(event.replyToken, [
                    ...msgBefore,
                    {
                        type: "text",
                        text: "Please enter the amount",
                    }
                ]);
                break;
            case 3:
                return client.replyMessage(event.replyToken, [
                    ...msgBefore,
                    {
                        type: "text",
                        text: "Please enter a note:",
                    }
                ]);
                break;
            case 5:


        } 
    });
}

module.exports = setupTransaction;