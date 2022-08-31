const User = require('../model/User');

function unfollowEvent(event) {
	let userId = event.source.userId;
	User.deleteUser(userId).then((result) => {
		console.log(`User ID: ${userId} has been deleted`);
		console.log(result);
	})
}

module.exports = unfollowEvent;