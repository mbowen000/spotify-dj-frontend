import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import * as types from './store/action-types.js';
import VueSocketio from 'vue-socket.io';
import config from 'config';

Vue.use(Vuex);
Vue.use(VueResource);

const store = new Vuex.Store({
  state: {
    systems: [],
    tracks:[
      {},{},{},{}
    ],
    searchResults: [ 

    ],
    user: {},
    sonos: {
      availableRooms: []
    },
    currentTrack: {},
    mode: 'playlist'
  },
  mutations: {
    getCurrentUser (state, user) {
      Vue.set(state, 'user', user);
    },
    [types.FETCH_TRACKS] (state, tracks) {
      Vue.set(state, 'tracks', tracks);
    },
    setSearchResults (state, results) {
      Vue.set(state, 'searchResults', results);
    },
    [types.CHANGE_SEARCH_MODE] (state, mode) {
      Vue.set(state, 'mode', mode);
    },
    [types.GET_CURRENT_TRACK] (state, current) {
      Vue.set(state, 'currentTrack', current);
    },
    [types.GET_USER_SYSTEMS] (state, systems) {
      Vue.set(state, 'systems', systems);
    }
  },
  actions: {
    getCurrentUser (context) {
      return Vue.http.get('/me')
      .then((response) => context.commit('getCurrentUser', response.body))
      .catch(function(error) {
        console.error(error);
        window.location = '/login'; 
      });
    },
    [types.FETCH_TRACKS] (context) {
      return Vue.http.get('/queue')
      .then((response) => context.commit(types.FETCH_TRACKS, response.body.records))
      .catch((error) => console.error('Could not fetch tracks', error));
    },
    search (context, options) {
      return Vue.http.get('/track/' + options.query)
      .then((response) => 
        context.commit('setSearchResults', response.body),
        context.commit(types.CHANGE_SEARCH_MODE, 'search')
      )
      .catch((error) => console.error('Could not query', error));
    },
    [types.CHANGE_SEARCH_MODE] (context, options) {
      context.commit(types.CHANGE_SEARCH_MODE, options.mode);
    },
    addTrackToQueue (context, track) {
      return Vue.http.post('/queue', track).then(function(resp) {
        context.commit('fetchTracks', resp.body.records);
        context.commit(types.CHANGE_SEARCH_MODE, 'playlist');
      });
    },
    [types.UPVOTE_TRACK] (context, track) {
      return Vue.http.post('/track/upvote', track).then(function(resp) {
        return context.dispatch('fetchTracks');
      });
    },
    [types.GET_CURRENT_TRACK] (context) {
      return Vue.http.get('/nowplaying').then(function(resp) {
        return context.commit(types.GET_CURRENT_TRACK, resp.body);
      });
    },
    [types.DELETE_TRACK] (context, track) {
      return Vue.http.post('/queue/delete', track).then(function(resp) {
        return context.dispatch('fetchTracks');
      });
    },
    [types.GET_USER_SYSTEMS] (context, user) {
      return Vue.http.get('https://api.spotify.com/v1/me/player/devices', {
        headers: {
          'Authorization': 'Bearer ' + user.authtoken
        }
      }).then(function(resp) {
        console.log(resp);
        return context.commit(types.GET_USER_SYSTEMS, resp.body.devices);
      }).catch(function(err) {
        console.error(err);
      })
    }
  }
});

Vue.use(VueSocketio, config.SERVER_URL, store);

const app = new Vue({
  el: '#app',
  render: h => h(App),
  store
})
