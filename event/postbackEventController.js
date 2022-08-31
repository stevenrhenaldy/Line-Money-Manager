const moment = require('moment');
const client = require('../model/Client').lineClient;

const User = require('../model/User');
const Language = require('../model/Language');
const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const Currency = require('../model/Currency');

const setupTransaction = require('./setupTransactionController');
const setupAccount = require('./setupAccountController');

function postbackEvent(event) {
	let userId = event.source.userId;
	let data = JSON.parse(event.postback.data);
	switch (Object.keys(data)[0]) {
		case "language":
			User.getUser(userId).then((result) => {
				if (result[0].step == 0) {
					User.updateUser(userId, {
						language_id: data['language'],
						step: 1
					}).then((result) => {
						Language.getLanguage(data['language']).then((r) => {
							console.log(`User: ${userId} language has been set to ${r[0].name}`);
							return setupAccount(event, {
								type: "text",
								text: `Your language has been set to ${r[0].name}`
							});
						});
					});
				} else {
					return setupAccount(event);
				}
			});
			break;
		case "currency":
			User.getUser(userId).then((result) => {
				if (result[0].step == 1) {
					User.updateUser(userId, {
						currency_id: data['currency'],
						step: 2
					}).then((r) => {
						Currency.getCurrency(data['currency']).then((r) => {
							console.log(`User: ${userId} currency has been set to ${r[0].name}`);
							client.linkRichMenuToUser(userId, "richmenu-e2fd9f54d3bd76e3b4ffce69fa1bd87a")

							return client.replyMessage(event.replyToken, [
								{
									type: "text",
									text: `Your currency has been set to ${r[0].name} ( ${r[0].symbol} )`
								},
								{
									type: "text",
									text: "Your account has been set up!",
								}
							]);
						});
					});
				} else {
					return setupAccount(event);
				}
			});
			break;
		case "action":
			switch (data.action) {
				case "income":
					Transaction.getRunningTransactionStep(userId).then((r) => {
						console.log(`User: ${userId} click Income`);
						if (r.length == 0) {
							Transaction.createTransaction(userId, 1, true).then((result) => {
								setupTransaction(event, 0, [
									{
										type: "text",
										text: "Please enter \"!cancel\" to discard"
									}
								]);
							});
						} else {
							setupTransaction(event, 0, [
								{
									type: "text",
									text: `Another undone ${r[0].type == 1 ? "income" : "expense"} transaction setup is still running in background.\n\nPlease enter \"!cancel\" to discard.`
								}
							]);
						}
					});
					break;

				case "expense":
					Transaction.getRunningTransactionStep(userId).then((r) => {
						console.log(`User: ${userId} click Expense`);
						if (r.length == 0) {
							Transaction.createTransaction(userId, 2, true).then((result) => {
								setupTransaction(event, 0, [
									{
										type: "text",
										text: "Please enter \"!cancel\" to discard"
									}
								]);
							});
						} else {
							setupTransaction(event, 0, [
								{
									type: "text",
									text: `Another undone ${r[0].type == 1 ? "income" : "expense"} transaction setup is still running in background.\n\nPlease enter \"!cancel\" to discard.`
								}
							]);
						}
					});
					break;
				case "date-select":
					Transaction.getRunningTransactionStep(userId).then((r) => {
						if (r.length != 0) {
							const d = r[0];
							if (d.step == 0) {
								const params = event.postback.params;
								let date = ""
								if (params != null) {
									date = params.date;
								} else {
									date = data.date;
								}
								Transaction.updateTransaction(userId, {
									date: date,
									step: 1
								}).then((result) => {
									setupTransaction(event, 1, [
										{
											type: "text",
											text: `Transaction Date: ${date}`,
										},
									]);
								});
							} else {
								setupTransaction(event, 0, [
									{
										type: "text",
										text: `This part has been selected.\n\nPlease enter \"!cancel\" to discard..`
									}
								]);
							}
						} else {
							return Promise.resolve(null);
						}
					});
					break;
				case "report":
					console.log(`User: ${userId} click Report`);
					break;
				case "category-select":
					const category = parseInt(data.category);
					Category.getCategory(category).then(result => {
						const categoryName = result[0].name;
						Transaction.updateTransaction(userId, {
							category_id: category,
							step: 2
						}).then((result) => {
							setupTransaction(event, 2, [
								{
									type: "text",
									text: `Category: ${(categoryName).capitalize()}`
								},
							])
						});
					})
					break;
				default:
					console.log(event);
			}
			break;
		default:
			console.log(event);
			break;
	}
}

module.exports = postbackEvent;