var express = require('express'),
    router = express.Router(),
    request = require('request'),
    _ = require('underscore');

router.get('/zones', function(req, res) {
    var opts = {
        url: 'http://sonos-http:5005/zones'        
    }

    request(opts).pipe(res);
});

module.exports = router;