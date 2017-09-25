<template>
  <div id="app" class="container">
    <tt-header class="row"/>
    <div class="row">
      <tt-nowplaying class="col-sm-12 col-md-4 now-playing"/>
      <tt-tracklist class="col-sm-12 col-md-8 track-list"/>
    </div>
  </div>
</template>

<script>
import Header from './Header.vue';
import NowPlaying from './NowPlaying.vue';
import Tracklist from './TrackList.vue';
import mini from 'mini.css/dist/mini-default.css'; 

export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components:{
    'tt-header': Header,
    'tt-nowplaying': NowPlaying,
    'tt-tracklist': Tracklist
  }
}
</script>

<style>
  .container {
    margin:0;
    padding:0;
  }
  div.now-playing, div.track-list {
    padding:0;
  }
</style>