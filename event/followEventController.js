const User = require('../model/User');
const Language = require('../model/Language');
const ClientProfile = require('../model/ClientProfile');
const setupAccount = require('./setupAccountController');

function followEvent(event) {
	let userId = event.source.userId;
	User.createUser(userId).then((result) => {
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
			})

			ClientProfile.getClientProfile(userId).then((profile) => {
				console.log(profile);
				let dispName = profile.displayName;

				return setupAccount(event, {
					type: "text",
					text: `Hi ${dispName},\nMy name is Money Manager!\nI will help you to manage your income and expense!\nFirst, let me help you to setup your account.`
				});
			});

		});
	});
}

module.exports = followEvent;