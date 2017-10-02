import Vue from 'vue';
import App from './App.vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';

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
    mode: 'search'
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
    changeSearchMode (state, mode) {
      Vue.set(state, 'mode', mode);
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
      .then((response) => context.commit('setSearchResults', response.body))
      .catch((error) => console.error('Could not query', error));
    },
    changeSearchMode (context, options) {
      context.commit('changeSearchMode', options.mode);
    },
    addTrackToQueue (context, track) {
      return Vue.http.post('/queue', track).then(function(resp) {
        context.commit('fetchTracks', resp.body.records);
        context.commit('changeSearchMode', 'playlist');
      });
    }
  }
});

const app = new Vue({
  el: '#app',
  render: h => h(App),
  store
})
