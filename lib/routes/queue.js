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

	try {
		queue.playIndex(req.params.index);
		res.status(200).send({});
	}
	catch(e) {
		res.status(500).send(e.getMessage());
	}
	

});

router.get('/', function (req, res) {
  res.type('json');
  queue.getTracks(req.query.page, numPerPage, function(response) {
	res.send(response);
  });
});

// UNTESTED: THIS IS NOT USED ATM
router.get('/search/:searchString', function(req, res) {
	var searchString = req.params.searchString;
	queue.findTracks(searchString, function(err, docs) {
		if(err) {
			res.status(500).send(err);
		}
		else {
			res.status(200).send(docs);
		}
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
			//res.status(200).end();
			res.type('json');
			queue.getTracks(req.query.page, numPerPage, function(response) {
			  res.send(response);
			});
		});
	}

});

module.exports = router;