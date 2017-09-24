var express = require('express'),
    router = express.Router(),
    request = require('request'),
	_ = require('underscore'),
	queue = require('../queue');
	
// include the database 
var db = require('../db');

// some configs / local variables
var numPerPage = 50;


router.post('/delete', function(req, res) {
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

router.post('/play/:index', function(req, res) {
	//console.log("Track Played");
	_.each(queue.tracks, function(track, index) {
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
			//queue.tracks.push(queue.tracks.shift(req.params.index));
			// io.emit('trackPlayed');
			//console.log(current);
			if(current) {

				var sonosOpts = {
					url: 'http://sonos-http:5005/zone1/spotify/now/spotify:track:' + current.id
				};

				request.get(sonosOpts, function(err, response) {
					if(err || response.statusCode != 200) {
						console.error('Error sending to sonos...', response.body);
					}
				});	
				// send to slack webhook

				var artist = '';
				if(current.artists && current.artists.length > 0) {
					artist = current.artists[0].name;
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

router.get('/', function (req, res) {
  res.type('json');
  db.find({}).count(function(err, count) {

  	var offset = req.query.page * numPerPage || 0;
  	
  	db.find({}).sort({upvoteCount: -1, lastPlayedDate: 1, dateAdded: 1}).limit(numPerPage).skip(offset, function(err, docs) {
	  	if(err) {
	  		res.status(500).send(err);
	  	}

	  	queue.tracks = docs;

	  	var response = {
	  		total: count,
	  		records: docs,
	  		numPerPage: numPerPage
	  	};

	  	res.send(response);
	  });
  });

  
});

router.post('/', function(req, res) {
	//console.log(req.body);
	var track = req.body;

	// rick astley restriction 
	console.log(_.pluck(track.artists, 'id'));
	if(track.artists && _.pluck(track.artists, 'id').indexOf('0gxyHStUsqpMadRV0Di1Qt') !== -1) {
		res.status(401).send('You cannot add Rick Astley to this router.');
		return false;
	}
	//queue.tracks.push(req.body);
	if(_.pluck(queue.tracks, "id").indexOf(track.id) !== -1) {
		res.status(500).send("No duplicates");
		return false;
	}

	if(track.uri) {
		//console.log(req.session.userid);
		if(req.session.userid) {
			track.user = req.session.user;
		}

		// timestamp add so we can sort by it
		track.dateAdded = new Date();

		db.insert(track, function(err, newDoc) {
			res.status(200).end();
		});
	}

});

module.exports = router;