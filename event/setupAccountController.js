const client = require('../model/Client').lineClient;
const User = require('../model/User');
const Language = require('../model/Language');
const Currency = require('../model/Currency');

function setupAccount(event, msgBefore = null) {
	const userId = event.source.userId;
	User.getUser(userId).then((result) => {
		switch (result[0].step) {
			case 0:
				Language.getLanguageList().then((languages) => {
					let actions = [];
					languages.forEach(d => {
						actions.push({
							type: "postback",
							label: d.name,
							data: JSON.stringify({
								language: d.id
							})
						})
					});

					if (msgBefore != null) {
						return client.replyMessage(event.replyToken, [
							msgBefore,
							{
								type: "template",
								altText: "Please select your language",
								template: {
									type: "buttons",
									title: "Language",
									text: "Please select your language",
									actions: actions
								}
							}
						]);
					} else {
						return client.replyMessage(event.replyToken, [
							{
								type: "template",
								altText: "Please select your language",
								template: {
									type: "buttons",
									title: "Language",
									text: "Please select your language",
									actions: actions
								}
							}
						]);
					}
				});
				break;
			case 1:
				Currency.getCurrencyList().then((currency) => {
					let actions = [];
					currency.forEach(d => {
						actions.push({
							type: "postback",
							label: `${d.name} ( ${d.symbol} )`,
							data: JSON.stringify({
								currency: d.id
							})
						})
					});
					if (msgBefore != null) {
						return client.replyMessage(event.replyToken, [
							msgBefore,
							{
								type: "template",
								altText: "Please select your currency",
								template: {
									type: "buttons",
									title: "Currency",
									text: "Please select your currency",
									actions: actions
								}
							}
						]);
					} else {
						return client.replyMessage(event.replyToken, [
							{
								type: "template",
								altText: "Please select your currency",
								template: {
									type: "buttons",
									title: "Currency",
									text: "Please select your currency",
									actions: actions
								}
							}
						]);
					}
				});
				break;
		}
	});
}

module.exports = setupAccount;