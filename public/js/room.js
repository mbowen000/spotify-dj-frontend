angular.module('spotifyapp.room', [])

.service('RoomService', ['Room', function(Room) {
	
	var fetch = function() {
		var self = this;
		return Room.query().$promise.then(function(results) {
			return results;
		});
	}

	return {
		rooms: [],
		selectedRoom: {},
		fetch: fetch
	}


}])

.factory('Room', ['$resource', function($resource) {
	return $resource('room', null, {
    	'query': {
      		isArray: true,
      		method: 'GET'
    	}
	});
}]);