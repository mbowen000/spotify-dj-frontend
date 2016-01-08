angular.module('spotifyapp', ['ngRoute', 'ngAnimate', 'ngResource', 'ngMaterial'])
.config(['$routeProvider', '$locationProvider',
  function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/content.html',
        controller: 'AppCtrl',
        controllerAs: 'app'
      });

    $locationProvider.html5Mode(true);
}])
.controller('HeaderController', ['$http', '$rootScope', function($http, $rootScope) {
  $http.get('/me').then(function(response) {
      $rootScope.user = response.data;
      console.log('logged in');
    },function(error) {
      // if error, we need to redirect to /login
      window.location = '/login';
    });
}])

.controller('AppCtrl', ['$route', '$routeParams', '$location', 'Queue', 'socket', 'Track', '$http', '$rootScope', '$mdToast',
  function($route, $routeParams, $location, Queue, socket, Track, $http, $rootScope, $mdToast) {
    var that = this;
    this.$route = $route;
    this.$location = $location;
    this.$routeParams = $routeParams;

    that.query = function(q) {
      return Track.query({ query: q });
    };

    that.addTrackToQueue = function(track) {
      if(track && track.uri) {

        // add the user to the track so we know 'who done it'
        // track.user = $rootScope.user;

        console.log('adding track');
        var item = new Queue(track);
        item.$save().then(function(response) {
          $mdToast.show(
            $mdToast.simple().textContent('Added!').hideDelay(3000)
          );
        }, function(error) {
          $mdToast.show(
            $mdToast.simple()
              .textContent('No Rick Astley!')
          );
        });
      }
    };

    that.fetchQueue = function() {
      Queue.query().$promise.then(function(response) {
        that.queue = [];
        angular.forEach(response, function(item) {
          if(item.uri) {
            that.queue.push(item);
          }
        });
      });
    };

    that.upvote = function(track) {
      console.log('Upvoting ' + track);
      var upvote = {
        track: track,
        user: $rootScope.user
      }
      // if(_.findWhere(_.pluck(track.votes, 'user'), { id: upvote.user.id })) {
      //   alert('Please don\'t Upvote More than Once!');
      // }
      //else {
        $http.post('/track/upvote', upvote).then(function(updatedTrack) {
          if(track.votes && track.votes.length > 0) {
            track.votes.splice(0, track.votes.length);
          }
          angular.forEach(updatedTrack.data.votes, function(vote) {
            if(!track.votes) {
              track.votes = [];
            }
            track.votes.push(vote);
          });
          track.upvoteCount = updatedTrack.data.upvoteCount;
          track.downvoteCount = updatedTrack.data.downvoteCount || 0;

          that.fetchQueue();

        });
      //}
    }

    that.remove = function(track) {
      $http.post('/queue/delete', track).then(function(resp) {
        that.fetchQueue();
      });
    }

    socket.on('trackAdded', function() {
      that.fetchQueue();
    });

    socket.on('trackPlayed', function() {
      that.fetchQueue();
    });

    socket.on('trackUpvoted', function() {
      that.fetchQueue();
    });

    that.fetchQueue();
}])

.factory('Queue', ['$resource', function($resource) {
  return $resource('queue', null);
}])

.factory('Track', ['$resource', function($resource) {
  return $resource('/track/:query', null, {
    'query': {
      method: 'GET',
      isArray: true,
      transformResponse: function(data, headersGetter) {
        var resp = JSON.parse(data);
        return resp.body.tracks.items;
      }
    }
  });
}])

.factory('socket', function ($rootScope) {
  var socket = io.connect();
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});