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

module.exports = db;