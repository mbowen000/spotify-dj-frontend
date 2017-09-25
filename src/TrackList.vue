<template>
    <div>
        <div class="row searchbar">
            <div class="col-sm-12 search-box">
                <input type="text" placeholder="Search..."/>
            </div>
        </div>
        <div class="row tracks">
            <ul>
                <tt-track v-for="track in tracks" class="row" :key='track.id' :track="track"/>
            </ul>
        </div>  
    </div>
</template>

<script>
import Track from './Track.vue';

export default {
  name: 'tt-tracklist',
  computed: {
      tracks() {
          return this.$store.state.tracks;
      }
  },
  created () {
      this.$store.dispatch('getCurrentUser');
      this.$store.dispatch('fetchTracks');
  },
  components: {
      'tt-track': Track
  }
}
</script>

<style>
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