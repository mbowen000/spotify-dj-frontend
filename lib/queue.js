var db = require('./db');
var sonos = require('./sonos');

module.exports = {
    tracks: [],
    current: {},
    playTrack: function(track, callback) {
        var self = this;
        this.current = track;
        track.playing = true;
        var simulate = false;

        // update db stats
        db.update({ id: track.id }, { $set: { plays: track.plays+1 || 1, lastPlayedDate: new Date(), votes: [] }, $unset: {upvoteCount: true} }, function(err, numReplaced) {
            if(err) {
                res.status(500).send(err);
            }
            else {	
                // start the timer on the song...
                var duration = track.duration_ms;
                
                // **** PLAY WITH SONOS **//
                // todo: Implement generic "connectors" that would play via different device methods on spotify
                if(simulate) {
                    console.info(':::: PLAYING TRACK ON SYSTEM ::::', track);
                }
                else {
                    sonos.playTrack(track);
                }
                


                setTimeout(function() { 
                    self.playIndex.apply(self, arguments); 
                }, duration);
                console.info(track);

                callback(null, track);
            }
        });

        
    },
    playIndex: function(index, callback) {
        var self = this;
        index = index || 0;
        // re-query tracks so we're up to date
        this.getTracks(0, null, function(response) {
            self.tracks = response.records;
            var track = self.tracks[index];
            if(track) {
                self.playTrack(track, callback);
                self.tracks.push(self.tracks.shift(index));
            }
            else {
                console.error('Song at index ' + index + ' is not in range...');
            }
        });
       
        
    },
    findTracks: function(searchString, callback) {
        db.find({name: {$regex: searchString}}, function(err, docs) {
            if(err) {
                callback(err);
            }
            else {
                callback(null, docs);
            }
        });
    },
    getTracks: function(page, numPerPage, callback) {
        var self = this;
        page = page || 0;
        numPerPage = numPerPage || 50; // todo: make setting and match front-end
        db.find({}).count(function(err, count) {
            
            var offset = page * numPerPage || 0;
            
            db.find({}).sort({upvoteCount: -1, lastPlayedDate: 1, dateAdded: 1}).limit(numPerPage).skip(offset, function(err, docs) {
                if(err) {
                    res.status(500).send(err);
                }
    
                var response = {
                    total: count,
                    records: docs,
                    numPerPage: numPerPage
                };
    
                callback(response);
            });
        });
    }
};