<template>
    <div class="row header">
        <div class="col-sm-6 col-md-4 logo">
            <h2>Teamtunes</h2>
        </div>
        <div class="col-sm-12 col-md-4 col-sm-last row controls">
            <div class="col-sm-6">System Status: Stopped
                <a href="/connect/pause">PAUSE</a>
            </div>
            <div class="col-sm-6 system">
                <select name="system-select" v-model="systemid">
                    <option v-for="option in systems" v-bind:value="option.id">{{option.name}}</option>
                </select>
            </div>
        </div>
        <div class="col-sm-6 col-md-4 col-md-last userinfo">Logged in as {{user.display_name}} - <a href="/logout">Logout</a></div>
    </div>
</template>

<script>
import * as types from './store/action-types';
import Vue from 'Vue';
export default {
  name: 'tt-header',
  computed: {
      user () {
          return this.$store.state.user
      },
      systems () {
          return this.$store.state.systems
      }
  },
  data() {
      return {
          systemid: ''
      }
  },
  watch: {
      user(newUser) {
          console.log(newUser);
          this.$store.dispatch(types.GET_USER_SYSTEMS, newUser);
      }
  },
  sockets:{
    connect: function(){
      console.log('socket connected')
    },
    play: function(track) {

        // TODO: MOVE THIS TO ACTION IN THE STORE
        console.log(track);
        this.$http.put('https://api.spotify.com/v1/me/player/play?device_id=' + this.systemid, {
            uris: [track.uri]
        }, {
            headers: {
                'Authorization': 'Bearer ' + this.user.authtoken
            }
        });

        this.$store.commit(types.GET_CURRENT_TRACK, track);
    }
  }
}
</script>

<style>
    .header {
        background-color:blueviolet
    }
    .userinfo {
        text-align:right;
        padding-top:15px;
    }
    .system {
        text-align:right;
    }
</style>