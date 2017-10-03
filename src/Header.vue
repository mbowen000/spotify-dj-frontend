<template>
    <div class="row header">
        <div class="col-sm-6 col-md-4 logo">
            <h2>Teamtunes</h2>
        </div>
        <div class="col-sm-12 col-md-4 col-sm-last row controls">
            <div class="col-sm-6">System Status: Stopped</div>
            <div class="col-sm-6 system">
                <select name="system-select">
                    <option>System 1</option>
                    <option value="">System 2</option>
                </select>
            </div>
        </div>
        <div class="col-sm-6 col-md-4 col-md-last userinfo">Logged in as {{user.display_name}} - <a href="/logout">Logout</a></div>
    </div>
</template>

<script>
export default {
  name: 'tt-header',
  computed: {
      user () {
          return this.$store.state.user
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