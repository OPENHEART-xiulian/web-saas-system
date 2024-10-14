<template>
  <router-view></router-view>
</template>

<script>
export default {
  data () {
    let tabList = this.$permission.getPermissionTab('customerAnalyzeList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    if (tabIndex === -1) tabIndex = 0;
    return {
      tabIndex,
      tabList,
      tabItem: {}
    }
  },
  created () {
    if (this.$route.meta.isList) {
      this.tabChange(this.tabIndex)
    }
  },
  methods: {
    tabChange (index) {
      // this.tabItem = this.tabList[index];
      this.$router.replace(this.tabList[index].path);
    }
  }
}
</script>
