const lineMiddleware = require('./model/Client').lineMiddleware;
const handleEvent = require('./routes/line_event');
const helmet = require('helmet');

var cookieParser = require('cookie-parser')
var session = require('./config/session');

const config = require('./config/conf');
const PORT = config.port;
const a = require('./config/app');
const app = a.express;

Object.defineProperty(String.prototype, 'capitalize', {
	value: function () {
		return this.charAt(0).toUpperCase() + this.slice(1);
	},
	enumerable: false
});

Object.defineProperty(Number.prototype, 'commaSeparator', {
	value: function () {
		const t = this
		if(t == null) {t = 0} 

		return t.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},
	enumerable: false
});

app.set('view engine', 'ejs');

// parse cookies
// we need this because "cookie" is true in csrfProtection
app.use(cookieParser());
app.use("/static",a.express_static('public'))
app.use(session);

//app.use(helmet());

app.use("/", require("./routes/web"));

app.post('/webhook', lineMiddleware, (req, res) => {
	Promise
		.all(req.body.events.map(handleEvent))
		.then((result) => res.json(result));
});

app.listen(PORT);
console.log(`Listening on port ${PORT}`);
// client.getBotInfo().then(result => {
// 	console.log(result)
// });
