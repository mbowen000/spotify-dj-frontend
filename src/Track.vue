<template>
    <li>
        <div class="col-sm-2 media-photo">
            <img :src="albumArtUrl"/>
        </div>
        <div class="col-sm-8 media-info">
            <h5>{{artistName}} - {{track.name}}</h5>
            <small>Added by {{track.user ? track.user.display_name : track.user.id}}</small>
        </div>
        <div class="col-sm-2 media-controls" v-if="type === 'search-result'">
            <button v-if="!track.alreadyAdded" v-on:click="addTrack">+</button>
            <button v-if="track.alreadyAdded">Upvote</button> 
        </div>
        <div class="col-sm-2 media-controls" v-if="type !== 'search-result'">
            <button v-if="!addedByMe" v-on:click="upvote">Upvote</button> 
            <button v-if="addedByMe" v-on:click="remove">X</button>
        </div>
    </li>
</template>

<script>
import * as types from './store/action-types.js';

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
      },
      addedByMe() {
          if(!this.track.user) {
              return true;
          }
          return this.track.user.id === this.$store.state.user.id;
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
      },
      upvote(event) {
          var self = this;
          this.$store.dispatch(types.UPVOTE_TRACK, this.track).then(function(response) {
              console.info('track upvoted');
              // todo: add success message
          }).catch(function(err) {
              console.error('Error upvoting track...', err);
          });
      },
      remove(event) {
          this.$store.dispatch(types.DELETE_TRACK, this.track).then(function(response) {
              console.info('track deleted');
          }).catch(function(err) {
              console.error('could not delete', err);
          });
      }
  }
}
</script>

<style>
   
</style>