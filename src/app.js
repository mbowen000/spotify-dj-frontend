import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import * as types from './store/action-types.js';

Vue.use(Vuex);
Vue.use(VueResource);

const store = new Vuex.Store({
  state: {
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
    fetchTracks (state, tracks) {
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
    fetchTracks (context) {
      return Vue.http.get('/queue')
      .then((response) => context.commit('fetchTracks', response.body.records))
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
    }
  }
});

const app = new Vue({
  el: '#app',
  render: h => h(App),
  store
})
