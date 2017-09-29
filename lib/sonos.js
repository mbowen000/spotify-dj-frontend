var request = require('request');

module.exports = {
    playTrack: function(track) {
        var sonosOpts = {
            url: 'http://sonos-http:5005/zone1/spotify/now/spotify:track:' + track.id
        };
        
        request.get(sonosOpts, function(err, response) {
            if(err || response.statusCode != 200) {
                console.error('Error sending to sonos...', response.body);
            }
        });	
    }
}

