<template>
  <div>
    <saas-bread title="配件出库">
      <template slot="actions">
        <div class="flex" style="align-items:center;">
          <i-button style="margin-right:12px;" v-if="permissionData.create" type="error" to="/inventory/output/form/create">
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新增出库单</span>
          </i-button>
        </div>
      </template>
    </saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>
    <component :query-show="tabItem.queryShow" :is="tabItem.componentName" :isSelfStore="isSelfStore"></component>
  </div>  
</template>

<script>
  import particulars from "./particulars";
  import stockout from "./stockout";
  export default {
    name: "InventoryOutput",
    components: { particulars, stockout },
    data(){
      let tabList = this.$permission.getPermissionTab('inventoryOutputList');
      let tabIndex =  0;
      let permissionData = this.$permission.data.inventoryOutput;
      return {
        permissionData,
        tabList,
        tabIndex,
        tabItem:tabList[tabIndex],
        isSelfStore: true
      };
    },

    created () {
      //this.init(this.$route);
    },

    watch: {
      // $route (to) {
      //   this.init(to);
      // }
    },

    methods: {
      // 切换tab
      tabChange (index) {
        this.tabItem = this.tabList[index];  // 设置选中的tab
        // 替换路由是为了刷新的时候选中对应的tab
        this.$router.replace({
          path: this.$route.path,
          query: {
            name: this.tabItem.componentName
          }
        });
      },



      // init (route) {
      //   if (route.meta.isList) {
      //     let tabList = this.$permission.getPermissionTab('inventoryOutputList');
      //     let data = tabList.find(elm => elm.path === route.path);
      //     if (tabList.length && !data) data = tabList[0];
      //     this.$router.replace(data.path);
      //   }
      // }
    }
  }
</script>
