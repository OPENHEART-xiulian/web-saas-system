<template>
  <div>
    <saas-bread title="门店设置">
      <template slot="actions">
        <i-button v-if="$route.path === '/store/setting/admin/list' && !isChain" type="default" to="/store/setting/chain">开启连锁店功能</i-button>
      </template>
    </saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>

    <router-view  @getMessage="getMessage" style="margin-top: 20px;"></router-view>
  </div>
</template>

<script>
export default {
  data () {
    let tabList = this.$permission.getPermissionTab('storeSettingList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    if (tabIndex === -1) tabIndex = 0;
    return {
      tabIndex,
      tabList,
      isChain: false, // 是否为连锁店
    }
  },
  watch: {
    $route (to) {
      let tabIndex = this.tabList.findIndex(elm => elm.path === to.path);
      //判断是否连锁总店  显示门店分组tab
      if(!this.$storage.get("STORE").isMasterStore||!this.$storage.get("STORE").isChainStore){
        let groupIndex=this.tabList.findIndex(elm => elm.name === "门店分组");
        if(groupIndex!=-1){
          this.tabList.splice(groupIndex,1);
        }
      }
      if ((tabIndex < 0 || to.path === '/store/setting') && to.path !== '/store/setting/info/form'&& to.path !== '/store/setting/admin/shareSetting'&& to.path !=='/store/setting/group/groupEdit') {
        this.tabChange(this.tabIndex);
      }
    }
  },
  created () {
    this.tabChange(this.tabIndex)
  },
  methods: {
    getMessage(e){
      this.isChain=e;
    },
    tabChange (index) {
      let path = this.tabList[index].path;
      if (this.$route.path === path) return;
      this.tabIndex = index;
      this.$router.push(path);
    }
  }
}
</script>

<style>
  .relationStore{
    padding: 30px 0 20px 0;
    text-align: center;
  }
</style>
