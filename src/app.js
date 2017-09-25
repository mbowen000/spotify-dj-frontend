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
    user: {},
    sonos: {
      availableRooms: []
    },
    currentTrack: {}
  },
  mutations: {
    getCurrentUser (state, user) {
      Vue.set(state, 'user', user);
    },
    fetchTracks (state, tracks) {
      Vue.set(state, 'tracks', tracks);
    }
  },
  actions: {
    getCurrentUser (context) {
      return Vue.http.get('/me')
      .then((response) => store.commit('getCurrentUser', response.body))
      .catch(function(error) {
        console.error(error);
        window.location = '/login';
      });
    },
    fetchTracks (context) {
      return Vue.http.get('/queue')
      .then((response) => store.commit('fetchTracks', response.body.records))
      .catch((error) => console.error('Could not fetch tracks', error));
    }
  }
});

const app = new Vue({
  el: '#app',
  render: h => h(App),
  store
})
