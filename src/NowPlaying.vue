<template>
    <div>
      <div class="row">
        <div class="col-sm-6 col-md-12 media-art">
          <img src="http://www.placehold.it/300x300"/>
        </div>
        <div class="col-sm-6 col-md-12 media-info">
          <h1>Bad Blood</h1>
          <h3>Taylor Swift</h3>
          <p>Added By Max - 3 Votes</p>
        </div>
      </div>
    </div>
</template>

<script>
export default {
  name: 'tt-nowplaying'
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