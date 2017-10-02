<template>
    <li>
        <div class="col-sm-2 media-photo">
            <img :src="albumArtUrl"/>
        </div>
        <div class="col-sm-8 media-info">
            <h5>{{artistName}} - {{track.name}}</h5>
            <small>Added by Mike</small>
        </div>
        <div class="col-sm-2 media-controls" v-if="type === 'search-result'">
            <button v-on:click="addTrack">+</button>
        </div>
    </li>
</template>

<script>
export default {
  name: 'tt-track',
  props: ['track', 'type'],
  computed: {
      albumArtUrl() {
          if(this.track && this.track.album) {
              return this.track.album.images[0].url;
          }
      },
      artistName() {
          if(this.track && this.track.artists) {
              return this.track.artists[0].name;
          }
      }
  },
  methods: {
      addTrack(event) {
          var self = this;
          this.$store.dispatch('addTrackToQueue', this.track).then(function(resp) {
                console.info('Track added', resp);
          }).catch(function(err) {
              console.error('Could not add track...', err);
          });
      }
  }
}
</script>

<style>
   
</style>