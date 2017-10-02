<template>
    <div class="col-sm-12 search-box">
        <input type="text" placeholder="Search..." v-on:keyup="searchTracks"/>
    </div>
</template>

<script>
    import _ from 'lodash';
    export default {
        name: 'tt-tracklist',
        methods: {
            searchTracks: _.debounce(function(event) {
                this.$store.dispatch('search', {
                    query: event.target.value
                });
            }, 500)
        }
    }
</script>