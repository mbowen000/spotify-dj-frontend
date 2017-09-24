<template>
  <div id="app" class="container">
    <tt-header class="row"/>
    <h1>{{ msg }}</h1>
  </div>
</template>

<script>
import ttHeader from './ttHeader.vue';
import mini from 'mini.css/dist/mini-default.css'; 

export default {
  name: 'app',
  data () {
    return {
      msg: 'Welcome to Your Vue.js App'
    }
  },
  components:{
    ttHeader
  }
}
</script>

<style>

</style>