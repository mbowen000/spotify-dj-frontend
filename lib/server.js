var express = require('express'),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	request = require('request'),
	_ = require('underscore'),
	authUtil = require('./utils/authUtil'),
	queue = require('./queue');


var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
	secret: 'xyz123'
}));
// ROUTES
app.use('/queue', require('./routes/queue'));
app.use('/track', require('./routes/track'));
app.use('/sonos', require('./routes/sonos'));

app.get('/nowplaying', function(req, res) {
	if(queue.current) {
		res.status(200).send(queue.current);
	}
	else {
		res.send(204).end();
	}
});

app.get('/me', function(req, res) {
	// query spotify
	var options = {
		url: 'https://api.spotify.com/v1/me',
		headers: { 'Authorization': 'Bearer ' + req.session.authtoken },
		json: true
	};

	request.get(options, function(error, response, body) {
		if(body.error) {
			console.error(body.error);
			res.status(500).send(body.error);
		}
		else {
			if(body.id) {
				//console.log('Session user id set to: ' + body.id);
				req.session.userid = body.id;
				req.session.user = body;
			}
			res.send(body).end();
		}
	});
});

var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  io.emit('server-start', "start");
  //console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

exports.app = app;
exports.io = io;