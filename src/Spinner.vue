<template>
    <div v-if="show" class="spinner-overlay">
      <div class="spinner-container">
        <div class="spinner-donut"></div>
      </div>
    </div>
</template>

<script>
    export default {
        name: 'spinner',
        props: {
            show: {
                type: Boolean,
                default: false
            }
        }
    }
</script>

<style>
  .spinner-overlay {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 9050;
    background-color: rgba(255, 255, 255, 0.75);
    visibility: visible;
    opacity: 1;
    transition: opacity 0.2s ease, visibility 0s;
    transition-delay: 0s, 0.3s;
  }
  .spinner-container {
    position: absolute;
    top:50%;
    left:50%;
  }
</style>