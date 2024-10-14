<template>
  <div>
    <saas-bread title="系统设置">
      <template slot="actions">
        <Button v-if="permiss.create && $route.path === '/store/system/payment'" type="error" @click="addPayment">
          <i class="iconfont icon-xinzeng"></i>新增支付方式
        </Button>
      </template>
    </saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>

    <router-view style="margin-top: 20px;"></router-view>
  </div>
</template>

<script>
export default {
  data () {
    let permiss = this.$permission.data.settingPayment;
    let tabList = this.$permission.getPermissionTab('storeSystemList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    if (tabIndex === -1) tabIndex = 0;
    return {
      permiss,
      tabIndex,
      tabList
    }
  },
  created () {
    this.tabChange(this.tabIndex)
  },
  methods: {
    addPayment () {
      this.$children[2].toAdd();
    },
    tabChange (index) {
      this.$router.push(this.tabList[index].path);
    }
  }
}
</script>
