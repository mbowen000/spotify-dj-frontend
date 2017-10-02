var express = require('express'),
    router = express.Router(),
    db = require('../db'),
    _ = require('underscore'),
    authUtil = require('../utils/authUtil'),
    request = require('request');


router.get('/:query', function(req, res) {

    // if(!authUtil.authCheck(req, res)) {
    //     res.status(401).send("Unauthorized. Please login again.");
    //     return false;
    // }
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
            if(body && body.tracks && body.tracks.items) {
                res.send(body.tracks.items).end();
            }
            
        }
    });

});

router.post('/upvote', function(req, res) {

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
                            // io.emit('trackUpvoted');
                            res.status(200).send(docs[0]);
                            return true;
                        }
                    });
                }
            });
        }

    });

    
});


router.post('/downvote', function(req, res) {
    

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
                    // io.emit('trackUpvoted');
                }
            });
        }
    });
});

module.exports = router;