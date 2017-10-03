<template>
    <div>
      <div class="row" v-if="track">
        <div class="col-sm-6 col-md-12 media-art">
          <img src="http://www.placehold.it/300x300"/>
        </div>
        <div class="col-sm-6 col-md-12 media-info">
          <h1>{{track.name}}</h1>
          <!-- <h3>{{track.artists[0].name}}</h3>
          <p>Added By {{track.user.name}} - 3 Votes</p> -->
        </div>
      </div>
    </div>
</template>

<script>
import * as types from './store/action-types';
export default {
  name: 'tt-nowplaying',
  computed: {
    track() {
      return this.$store.state.currentTrack;
    }
  },
  created() {
    this.$store.dispatch(types.GET_CURRENT_TRACK);
  }
}
</script>

<style>
  img {
    width:100%;
  }
  div.media-art, div.media-info {
    padding:0;
  }
  .media-info h1 {
    margin-bottom:0.25rem;
  }
  .media-info h3 {
    margin-top:0px;
  }
</style>