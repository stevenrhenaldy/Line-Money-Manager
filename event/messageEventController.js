const User = require('../model/User');
const Transaction = require('../model/Transaction');
const Category = require('../model/Category');
const moment = require('moment');
const setupTransaction = require('./setupTransactionController');
const setupAccount = require('./setupAccountController');

const client = require('../model/Client').lineClient;


function messageEvent(event) {
	let userId = event.source.userId;
	User.userEnrolled(userId).then((result) => {
		if (result.step != 2) {
			setupAccount(event);
		} else {
			if (event.message.type == "text") {
				Transaction.getRunningTransactionStep(userId).then((result) => {
					// console.log(result.length);
					if (event.message.text == "!cancel") {
						if (result.length > 0) {
							Transaction.deleteRunningTransaction(userId).then(res => {
								// console.log(res)
								return client.replyMessage(event.replyToken, [
									{
										type: "text",
										text: "Running transaction has been cancelled.",
									}
								]);
							});
							return;
						} else {
							return client.replyMessage(event.replyToken, [
								{
									type: "text",
									text: "No running transaction!",
								}
							]);
							return;
						}
					}
					if (result.length > 0) {
						const step = result[0].step;
						if (step == 2) {
							const amount = parseInt(event.message.text);
							if (Number.isNaN(amount) || amount <= 0) {
								return client.replyMessage(event.replyToken, [
									{
										type: "text",
										text: "Please enter the amount",
									}
								]);
							} else {
								User.getUserView(userId).then((u) => {
									const user = u[0];
									// console.log(user)
									Transaction.updateTransaction(userId, {
										amount: amount,
										step: 3
									}).then(res => {
										setupTransaction(event, 2, [
											{
												type: "text",
												text: `Transaction Amount: ${user.currency_symbol} ${(amount).commaSeparator()}`
											},
										]);
									});
								})
							}

						} else if (step == 3) {
							const note = event.message.text;
							// console.log(note)
							if (note.length <= 0) {
								return client.replyMessage(event.replyToken, [
									{
										type: "text",
										text: "Please enter a note:",
									}
								]);
							} else {
								Transaction.updateTransaction(userId, {
									note: note,
									step: 5
								}).then(res => {
									Transaction.getLastCompleteTransaction(userId).then(result => {
										const d = result[0];
										return client.replyMessage(event.replyToken, [
											{
												type: "text",
												text: `Your transaction has been saved`,
											},
											{
												type: "flex",
												altText: `${d.type == 1 ? "Income" : "Expense"}`,
												contents: {
													"type": "bubble",
													"body": {
														"type": "box",
														"layout": "vertical",
														"contents": [
															{
																"type": "text",
																"text": `${d.type == 1 ? "Income" : "Expense"}`,
																"weight": "bold",
																"size": "xl"
															},
															{
																"type": "box",
																"layout": "vertical",
																"margin": "lg",
																"spacing": "sm",
																"contents": [
																	{
																		"type": "box",
																		"layout": "baseline",
																		"spacing": "sm",
																		"contents": [
																			{
																				"type": "text",
																				"text": "Date",
																				"color": "#aaaaaa",
																				"size": "sm",
																				"flex": 2
																			},
																			{
																				"type": "text",
																				"text": `${moment(d.date).format('YYYY/MM/DD')}`,
																				"wrap": true,
																				"color": "#666666",
																				"size": "sm",
																				"flex": 4
																			}
																		]
																	},
																	{
																		"type": "box",
																		"layout": "baseline",
																		"spacing": "sm",
																		"contents": [
																			{
																				"type": "text",
																				"text": "Category",
																				"color": "#aaaaaa",
																				"size": "sm",
																				"flex": 2
																			},
																			{
																				"type": "text",
																				"text": `${(d.category).capitalize()}`,
																				"wrap": true,
																				"color": "#666666",
																				"size": "sm",
																				"flex": 4
																			}
																		]
																	},
																	{
																		"type": "box",
																		"layout": "baseline",
																		"spacing": "sm",
																		"contents": [
																			{
																				"type": "text",
																				"text": "Amount",
																				"color": "#aaaaaa",
																				"size": "sm",
																				"flex": 2
																			},
																			{
																				"type": "text",
																				"text": `${d.currency_symbol} ${(d.amount).commaSeparator()}`,
																				"wrap": true,
																				"color": "#666666",
																				"size": "sm",
																				"flex": 4
																			}
																		]
																	},
																	{
																		"type": "box",
																		"layout": "baseline",
																		"spacing": "sm",
																		"contents": [
																			{
																				"type": "text",
																				"text": "Note",
																				"color": "#aaaaaa",
																				"size": "sm",
																				"flex": 2
																			},
																			{
																				"type": "text",
																				"text": `${d.note}`,
																				"wrap": true,
																				"color": "#666666",
																				"size": "sm",
																				"flex": 4
																			}
																		]
																	}
																]
															}
														],
														"action": {
															"type": "uri",
															"label": "action",
															"uri": "https://liff.line.me/1657290312-MbrLVaX4"
														}
													}
												}
											}
										]);
									});
								});
							}
						}
					} else {
						const message = event.message.text;
						const message_arr = message.split(' ');
						if (message_arr.length >= 2) {
							let message_part = {
								start_string: [],
								num: -1,
								end_string: []
							}
							let bef_num = true
							let getNumLocation = -1
							message_arr.forEach((n, key) => {
								if (parseInt(n)) {
									if (key > getNumLocation && message_part.num != -1) {
										// Move the captured number and everything in message_part.end_string to message_part.start_string 
										message_part.start_string.push(`${message_part.num}`);
										message_part.start_string.push(...message_part.end_string);
										message_part.end_string = [];
									}
									message_part.num = parseInt(n);
									bef_num = false;
									getNumLocation = key;
									return;
								}
								if (bef_num == true) {
									message_part.start_string.push(n)
								} else {
									message_part.end_string.push(n)
								}
							});
							// console.log(message_part);
							if(message_part.num != -1){

								for (i = message_part.start_string.length - 1; i >= 0; i--) {
									let getString = ""
									for (j = 0; j <= i; j++) {
										getString += message_part.start_string[j].toLowerCase();
										if (j != i) {
											getString += " "
										}
										Category.getNearestCategory(getString).then((cat) => {
											// console.log(cat);
											let note = ""
											if (message_part.end_string.length == 0) {
												message_part.start_string.forEach((t, key)=>{
													note += t;
													if (key != message_part.start_string.length-1) {
														note += " "
													}
												});
											}else{
												message_part.end_string.forEach((t, key)=>{
													note += t;
													if (key != message_part.end_string.length-1) {
														note += " "
													}
												});
											}
											
											if (cat.length > 0) {
												Transaction.createTransaction(userId, cat[0].type, false, {
													category_id: cat[0].id,
													amount: message_part.num,
													date: new Date(),
													note: note,
												}).then(res => {
													Transaction.getLastCompleteTransaction(userId).then(result => {
														const d = result[0];
														return client.replyMessage(event.replyToken, [
															{
																type: "text",
																text: `Your transaction has been saved`,
															},
															{
																type: "flex",
																altText: `${d.type == 1 ? "Income" : "Expense"}`,
																contents: {
																	"type": "bubble",
																	"body": {
																		"type": "box",
																		"layout": "vertical",
																		"contents": [
																			{
																				"type": "text",
																				"text": `${d.type == 1 ? "Income" : "Expense"}`,
																				"weight": "bold",
																				"size": "xl"
																			},
																			{
																				"type": "box",
																				"layout": "vertical",
																				"margin": "lg",
																				"spacing": "sm",
																				"contents": [
																					{
																						"type": "box",
																						"layout": "baseline",
																						"spacing": "sm",
																						"contents": [
																							{
																								"type": "text",
																								"text": "Date",
																								"color": "#aaaaaa",
																								"size": "sm",
																								"flex": 2
																							},
																							{
																								"type": "text",
																								"text": `${moment(d.date).format('YYYY/MM/DD')}`,
																								"wrap": true,
																								"color": "#666666",
																								"size": "sm",
																								"flex": 4
																							}
																						]
																					},
																					{
																						"type": "box",
																						"layout": "baseline",
																						"spacing": "sm",
																						"contents": [
																							{
																								"type": "text",
																								"text": "Category",
																								"color": "#aaaaaa",
																								"size": "sm",
																								"flex": 2
																							},
																							{
																								"type": "text",
																								"text": `${(d.category).capitalize()}`,
																								"wrap": true,
																								"color": "#666666",
																								"size": "sm",
																								"flex": 4
																							}
																						]
																					},
																					{
																						"type": "box",
																						"layout": "baseline",
																						"spacing": "sm",
																						"contents": [
																							{
																								"type": "text",
																								"text": "Amount",
																								"color": "#aaaaaa",
																								"size": "sm",
																								"flex": 2
																							},
																							{
																								"type": "text",
																								"text": `${d.currency_symbol} ${(d.amount).commaSeparator()}`,
																								"wrap": true,
																								"color": "#666666",
																								"size": "sm",
																								"flex": 4
																							}
																						]
																					},
																					{
																						"type": "box",
																						"layout": "baseline",
																						"spacing": "sm",
																						"contents": [
																							{
																								"type": "text",
																								"text": "Note",
																								"color": "#aaaaaa",
																								"size": "sm",
																								"flex": 2
																							},
																							{
																								"type": "text",
																								"text": `${d.note}`,
																								"wrap": true,
																								"color": "#666666",
																								"size": "sm",
																								"flex": 4
																							}
																						]
																					}
																				]
																			}
																		],
																		"action": {
																			"type": "uri",
																			"label": "action",
																			"uri": "https://liff.line.me/1657290312-MbrLVaX4"
																		}
																	}
																}
															}
														]);
													});
												});
											}
										});
									}
								}
							}

						}
					}
				});
			} else {
				console.log(event);
			}
		}
	});
}

module.exports = messageEvent;