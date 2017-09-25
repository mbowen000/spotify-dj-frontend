<template>
    <div>
        <div class="row searchbar">
            <div class="col-sm-12 search-box">
                <input type="text" placeholder="Search..."/>
            </div>
        </div>
        <div class="row tracks">
            <ul>
                <li v-for="track in tracks" class="row">
                    <div class="col-sm-2 media-photo">
                        <img src="http://placehold.it/50x50"/>
                    </div>
                    <div class="col-sm-10 media-info">
                        <h5>Yeasayer - Odd Blood</h5>
                        <small>Added by Mike</small>
                    </div>
                </li>
            </ul>
        </div>  
    </div>
</template>

<script>
export default {
  name: 'tt-tracklist',
  data () {
    return {
        tracks: [{},{},{},{},{},{},{},{},{},{},{},{}]
    }
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