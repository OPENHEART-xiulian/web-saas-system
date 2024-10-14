<template>
  <router-view />
</template>

<script>
  export default {
    created () {
      this.init(this.$route);
    },

    watch: {
      $route (to) {
        this.init(to);
      }
    },

    methods: {
      init (route) {
        if (route.meta.isList) {
          let tabList = this.$permission.getPermissionTab('staffAccountList');
          let data = tabList.find(elm => elm.path === route.path);
          if (tabList.length && !data) data = tabList[0];
          this.$router.replace(data.path);
        }
      }
    }
  }
</script>
