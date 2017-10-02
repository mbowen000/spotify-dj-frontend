<template>
    <div class="track-list">
        <spinner :show="showSpinner"/>
        <div class="row searchbar">
            <tt-searchbox/>
        </div>
        <div class="row tracks" v-if="mode === 'playlist'">
            <ul>
                <tt-track v-for="track in tracks" class="row" :key='track.id' :track="track"/>
            </ul>
        </div>
        <div class="row tracks" v-if="mode === 'search'">
            <ul>
                <tt-track v-for="track in searchResults" class="row" :key='track.id' :track="track"/>
            </ul>
        </div>  
    </div>
</template>

<script>
import Track from './Track.vue';
import Spinner from './Spinner.vue';
import Searchbox from './Searchbox.vue';

export default {
  name: 'tt-tracklist',
  computed: {
      tracks() {
          return this.$store.state.tracks;
      },
      mode() {
          return this.$store.state.mode;
      },
      searchResults() {
          return this.$store.state.searchResults;
      }
  },
  created () {
      var self = this;
      this.showSpinner = true;
      Promise.all([
        this.$store.dispatch('getCurrentUser'),
        this.$store.dispatch('fetchTracks')
      ]).then(function() {
          self.showSpinner = false;
      });
  },
  data() {
      return {
        showSpinner: false
      }
  },
  components: {
      'tt-track': Track,
      'spinner': Spinner,
      'tt-searchbox': Searchbox
  }
}
</script>

<style>
    div.track-list {
        position:relative;
    }
    input {
        width:98%;
    }
    .search-box {
        padding:15px 0;
    }
    div.tracks ul {
        list-style-type:none;
        width:100%;
        margin:0;
        padding:0;
    }
    div.tracks ul li {
        border-bottom:1px solid #cccccc;
    }
    .media-info h5 {
        margin:0px;
    }
</style>