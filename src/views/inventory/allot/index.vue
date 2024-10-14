<template>
  <!-- 配件 - 调拨申请 -->
  <div class="allotApply">
    <saas-bread title="调拨申请">
      <template slot="actions">
        <div class="flex ac" >
          <!-- <i-button v-if="permissionData.create" type="error" to="/inventory/takestock/add/create"> -->
          <i-button  type="error" to="/inventory/allot/put/add/create">
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新增调入申请</span>
          </i-button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore" ref="storeSelect"/>
        </div>
      </template>
    </saas-bread>
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" @on-change="onTabChange">

    </saas-tab>
    <!-- 数据列表 -->
    <keep-alive>
      <component :query-show="tabItem.queryShow" ref="component" :is="tabItem.componentName" :isSelfStore="isSelfStore"></component>
    </keep-alive>
  </div>
</template>

<script>
  import PutList from "./put/list";
  import RefundList from "./refund/list";
  export default {
    name: "InventoryPurchase",
    components: { PutList, RefundList },
    data () {
      let permissionData = this.$permission.data.inventoryTakestock;
      let putPermiss = this.$permission.data.inventoryPurchasePut;            // 采购单权限
      let refPermiss = this.$permission.data.inventoryPurchaseRefund;         // 退货单权限
      let tabs = this.$permission.getPermissionTab("allotApplyList");  // 采购入库tab 
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;
      return {
        permissionData,
        putPermiss,
        refPermiss,
        tabIndex,                 // 当前选中的tab的下标
        tabItem: tabs[tabIndex],  // 当前选中的tab { name: tab名称, menuCode: 权限code, componentName: 对应的组件名称, queryShow: 是否显示对应的筛选表单 }
        tabs,                     // tab列表
        isSelfStore:''
      }
    },

    created () {
      // 每次初始化的时候，将当前组件加入到缓存里面
      this.$store.commit("setKeepAliveData", { name: "InventoryPurchase", value: true });
    },

    methods: {
      changeStore(id){
        this.$refs.component.onTableSearch({ shareStoreId:id })
      },
      // 切换tab
      onTabChange (index) {
        this.tabItem = this.tabs[index];  // 设置选中的tab
        this.$refs.storeSelect.init()
        // 替换路由是为了刷新的时候选中对应的tab
        this.$router.replace({
          path: this.$route.path,
          query: {
            name: this.tabItem.componentName
          }
        });
      },
    }
  }
</script>
<style lang="less">

</style>