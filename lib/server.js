var express = require('express');
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser');
var session = require('express-session');
var request = require('request');
var _ = require('underscore');
var Datastore = require('nedb');
var moment = require('moment');
var colors = require('colors');

//var db = new Datastore({filename: 'spotifydb', autoload: true});
var mongojs = require('mongojs');
if(process.env.MONGOLAB_URI) {
	var mongojsconn = mongojs(process.env.MONGOLAB_URI, ['tracks', 'tracks-2']);	
	
	if(process.env.collection) {
		console.log('got connection override from envs: ' + process.env.collection);
		var db = mongojsconn[process.env.collection];
	}
	else {
		console.log('using standard collection: tracks');
		var db = mongojsconn.tracks;	
	}
	
}
else {
	console.error('No MONGOLAB_URI set.. did you set the variable or run the env file?'.bgRed.white);
}



var app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cookieParser());
app.use(session({
	secret: 'xyz123'
}));

var queue = [];
var current = {};

var authCheck = function(req, res) {
	if(!req.session || !req.session.userid) {
		return false;
	}
	return true;
}

app.post('/queue/delete', function(req, res) {
	// auth should be mbowen000 right now, roles could be defined later
	if(!req.session || req.session.userid !== "mbowen000") {
		res.status(401).send("Unauthorized");
		return false;
	}
	if(req.body.id) {
		//console.log('deleting track');
		db.remove({id: req.body.id}, function(err, resp) {
			if(err) {
				res.status(500).send(err);
				return false;
			}
			else {
				res.status(200).send(resp);
				return true;
			}
		});
	}
});

app.get('/nowplaying', function(req, res) {
	if(current) {
		res.status(200).send(current);
	}
	else {
		res.send(204).end();
	}
});

app.post('/queue/play/:index', function(req, res) {
	//console.log("Track Played");
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

	//console.log("updating with id: " + current.id);

	// db.find({ id: current.id }, function(err, result) {
	// 	//console.log(result);
	// });

	db.update({ id: current.id }, { $set: { plays: current.plays+1 || 1, lastPlayedDate: new Date(), votes: [] }, $unset: {upvoteCount: true} }, function(err, numReplaced) {
		if(err) {
			res.status(500).send(err);
		}
		else {	
			// move the track to the end of the list..
			//queue.push(queue.shift(req.params.index));
			io.emit('trackPlayed');
			//console.log(current);
			if(current) {
				// send to slack webhook

				if(current.artists && current.artists.length > 0) {
					var artist = current.artists[0].name;
				}

				var options = {
					url: process.env.slackuri,
					// headers: { 'Authorization': 'Bearer ' + req.session.authtoken },
					json: true, 
					body: {
						text: current.name + ' by ' + artist + ' was just played! <http://open.spotify.com/track/' + current.id + '|Open In Spotify>',
						username: 'spotifybot',
						"icon_emoji": ":musical_note:"
					}
				};

				if(process.env.slackuri) {
					request.post(options, function(err, response) {
						if(err) {
							console.error('Failed to contact Slack Webhook!');
						}
						else {
							//console.log('Sucessfully posted to slack webhook: ' + response);
						}
					});
				}
			}
			

			res.status(200).send({});
		}
	});	


});

app.get('/queue', function (req, res) {
  res.type('json');
  db.find({}).sort({upvoteCount: -1, lastPlayedDate: 1, dateAdded: 1}, function(err, docs) {
  	if(err) {
  		res.status(500).send(err);
  	}

  	queue = docs;

  	res.send(docs);
  });
});

app.post('/queue', function(req, res) {
	//console.log(req.body);
	var track = req.body;

	// rick astley restriction
	if(track.artists && _.pluck(track.artists, 'id').indexOf('0gxyHStUsqpMadRV0Di1Qt') !== -1) {
		res.status(401).send('You cannot add Rick Astley to this app.');
		return false;
	}
	//queue.push(req.body);
	if(_.pluck(queue, "id").indexOf(track.id) !== -1) {
		res.status(500).send("No duplicates");
		return false;
	};

	if(track.uri) {
		//console.log(req.session.userid);
		if(req.session.userid) {
			track.user = req.session.user;
		}

		// timestamp add so we can sort by it
		track.dateAdded = new Date();

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
				//console.log('Session user id set to: ' + body.id);
				req.session.userid = body.id;
				req.session.user = body;
			}
			res.send(body).end();
		}
	});
});

app.get('/track/:query', function(req, res) {

	if(!authCheck(req, res)) {
		res.status(401).send("Unauthorized. Please login again.");
		return false;
	}
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

	// see if they already upvoted
	var userid = req.session.userid;

	// make sure the submitter is who they say they are..
	console.log("USER ID: " + userid);
	console.log(req.body.user.id);
	if(userid !== req.body.user.id) {
		res.status(401).send('Stop it voldemort!');
		return false;
	}

	var upvote = {
		user: req.body.user,
		type: 'upvote' // as opposed to downvote
	};


	// check if there is already an upvote on that song with the user's id, if so don't upvote / downvote
	db.find({ id: req.body.track.id }, function(err, tracks) {
		var duplicateFound = false;
		var ownTrack = false;
		if(tracks && tracks.length > 0) {
			console.log('tracks found.');
			console.log(tracks);
			_.each(tracks, function(track) {
			
				if(track.user.id === req.session.userid) {
					ownTrack = true;
				}

				duplicateFound = _.find(track.votes, function(vote) {
					console.log('found existing vote: ' + vote.user.id);
					return vote.user.id === upvote.user.id && vote.type === "upvote";
				});
			});
		}
		if(duplicateFound) {
			res.status(401).send('You cannot upvote multiple times.');
			return false;
		}
		else if(ownTrack) {
			res.status(401).send('You cannot upvote your own tracks.');
			return false;
		}
		else {
			db.update({ id: req.body.track.id }, { $addToSet: { votes: upvote }, $inc: { upvoteCount: 1 }}, function(err, numReplaced, newVote) {
				if(err) {
					res.status(500).send(err);
					return false;
				}
				else {
					//console.log('upvoted successfully');
					db.find({ id: req.body.track.id }).limit(1, function(err, docs) {
						if(err) {
							res.status(500).send(err);
						}
						else {
							io.emit('trackUpvoted');
							res.status(200).send(docs[0]);
							return true;
						}
					});
				}
			});
		}

	});

	
});


app.post('/track/downvote', function(req, res) {
	

	var downvote = {
		user: req.body.user,
		type: 'downvote' // as opposed to downvote
	};
	db.update({ id: req.body.track.id }, { $addToSet: { votes: downvote }, $inc: { downvoteCount: 1 }}, function(err, numReplaced, newVote) {
		if(err) {
			res.status(500).send(err);
		}
		else {
			//console.log('downvoted successfully');
			db.find({ id: req.body.track.id }).limit(1, function(err, docs) {
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


var server = app.listen(process.env.PORT || 3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  io.emit('server-start', "start");
  //console.log('Example app listening at http://%s:%s', host, port);
});

var io = require('socket.io')(server);

exports.app = app;
exports.io = io;