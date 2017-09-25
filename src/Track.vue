<template>
    <li>
        <div class="col-sm-2 media-photo">
            <img :src="albumArtUrl"/>
        </div>
        <div class="col-sm-10 media-info">
            <h5>{{artistName}} - {{track.name}}</h5>
            <small>Added by Mike</small>
        </div>
    </li>
</template>

<script>
export default {
  name: 'tt-track',
  props: ['track'],
  computed: {
      albumArtUrl() {
          if(this.track && this.track.album) {
              return this.track.album.images[2].url;
          }
      },
      artistName() {
          if(this.track && this.track.artists) {
              return this.track.artists[0].name;
          }
      }
  }
}
</script>

<style>
   
</style>