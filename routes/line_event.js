const followEvent = require('../event/followEventController');
const unfollowEvent = require('../event/unfollowEventController');
const postbackEvent = require('../event/postbackEventController');
const messageEvent = require('../event/messageEventController');

// Event Router
function handleEvent(event) {
	switch (event.type) {
		case 'follow':
			return followEvent(event);
		case 'unfollow':
			return unfollowEvent(event);
		case 'message':
			return messageEvent(event);
		case 'postback':
			return postbackEvent(event);
		default:
			console.log(event);
			return Promise.resolve(null);
	}
}

module.exports=handleEvent;