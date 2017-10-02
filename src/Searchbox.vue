<template>
    <div class="col-sm-12 row">
        <div class="col-sm-10 search-box">
            <input type="text" placeholder="Search..." v-on:keyup="searchTracks" v-model="searchText"/>
        </div>
        <div class="col-sm-2">
            <button v-on:click="hideSearchResults">x</button>
        </div>
    </div>
</template>

<script>
    import _ from 'lodash';
    import * as Types from './store/action-types';
    export default {
        name: 'tt-tracklist',
        data() {
            return {
                searchText: ''
            }
        },
        methods: {
            searchTracks: _.debounce(function(event) {
                if(this.searchText) {
                    this.$store.dispatch('search', {
                        query: this.searchText
                    });
                }
                else {
                    this.$store.dispatch(Types.CHANGE_SEARCH_MODE, {
                        mode: 'playlist'
                    });   
                }
                
            }, 500),
            hideSearchResults(event) {
                // clear the input
                this.searchText = null;

                // hide the search menu
                this.$store.dispatch(Types.CHANGE_SEARCH_MODE, {
                    mode: 'playlist'
                });
            }
        }
    }
</script>