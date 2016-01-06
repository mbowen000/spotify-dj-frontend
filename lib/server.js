var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var request = require('request');
var _ = require('underscore');
var Datastore = require('nedb');
var moment = require('moment');

var db = new Datastore({filename: 'spotifydb', autoload: true});

var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
	secret: 'xyz123'
}));

var queue = [];
var current = {};

app.post('/queue/play/:index', function(req, res) {
	console.log("Track Played");
	_.each(queue, function(track, index) {
		if(index == req.params.index) {
			// update the play count 
			current = track;
			track.playing = true;

		}
		else {
			track.playing = false;
		}
	});

	console.log("updating with id: " + current.id);

	// db.find({ id: current.id }, function(err, result) {
	// 	console.log(result);
	// });

	db.update({ id: current.id }, { $set: { plays: current.plays+1 || 1, lastPlayedDate: new Date(), votes: [] }, $unset: {upvoteCount: true} }, function(err, numReplaced) {
		if(err) {
			res.status(500).send(err);
		}
		else {	
			// move the track to the end of the list..
			//queue.push(queue.shift(req.params.index));
			io.emit('trackPlayed');
			console.log(current);
			if(current) {
				// send to slack webhook

				if(current.artists && current.artists.length > 0) {
					var artist = current.artists[0].name;
				}

				var options = {
					url: 'https://hooks.slack.com/services/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',
					// headers: { 'Authorization': 'Bearer ' + req.session.authtoken },
					json: true, 
					body: {
						text: current.name + ' by ' + artist + ' was just played! <http://open.spotify.com/track/' + current.id + '|Open In Spotify>',
						username: 'spotifybot',
						"icon_emoji": ":musical_note:"
					}
				};


				request.post(options, function(err, response) {
					if(err) {
						console.error('Failed to contact Slack Webhook!');
					}
					else {
						console.log('Sucessfully posted to slack webhook: ' + response);
					}
				})
			}
			

			res.status(200).send({});
		}
	});	


});

app.get('/queue', function (req, res) {
  res.type('json');
  db.find({}).sort({upvoteCount: -1, lastPlayedDate: 1}).exec(function(err, docs) {
  	if(err) {
  		res.status(500).send(err);
  	}

  	queue = docs;

  	res.send(docs);
  });
});

app.post('/queue', function(req, res) {
	console.log(req.body);
	var track = req.body;
	//queue.push(req.body);
	if(track.uri) {
		console.log(req.session.userid);
		if(req.session.userid) {
			track.user = req.session.user;
		}

		db.insert(track, function(err, newDoc) {
			io.emit('trackAdded', track);
			res.status(200).end();
		});
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
				console.log('Session user id set to: ' + body.id);
				req.session.userid = body.id;
				req.session.user = body;
			}
			res.send(body).end();
		}
	});
});

app.get('/track/:query', function(req, res) {
	// query spotify

	var options = {
		url: 'https://api.spotify.com/v1/search?q=' + req.params.query + "&type=track",
		headers: { 'Authorization': 'Bearer ' + req.session.authtoken },
		json: true
	};

	request.get(options, function(error, response, body) {
		if(error) {
			res.status(500).end(error);
		}
		else {
			res.send(response).end();
		}
	});
});

app.post('/track/upvote', function(req, res) {
	console.log(req.body);

	var upvote = {
		user: req.body.user,
		type: 'upvote' // as opposed to downvote
	};
	db.update({ id: req.body.track.id }, { $addToSet: { votes: upvote }, $inc: { upvoteCount: 1 }}, function(err, numReplaced, newVote) {
		if(err) {
			res.status(500).send(err);
		}
		else {
			console.log('upvoted successfully');
			db.find({ id: req.body.track.id }).limit(1).exec(function(err, docs) {
				if(err) {
					res.status(500).send(err);
				}
				else {
					res.send(docs[0]);
					io.emit('trackUpvoted');
				}
			});
		}
	});
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  io.emit('server-start', "start");
  console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

exports.app = app;
exports.io = io;