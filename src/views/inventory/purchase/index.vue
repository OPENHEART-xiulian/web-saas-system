<template>
  <!-- 配件 - 采购入库 -->
  <div>
    <saas-bread title="采购入库">
      <template slot="actions">
        <saas-store-select v-model="isSelfStore"  @on-change="changeStore" ref="storeSelect"/>
      </template>
    </saas-bread>
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" @on-change="onTabChange">
      <template  slot="right">
        <saas-toggle-btn v-model="tabItem.queryShow" type="default" v-show="tabIndex!==1" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
        <!-- 需要有采购单创建权限 -->
        <Button v-if="tabItem.componentName == 'PutList' && putPermiss.create" type="primary" to="/inventory/purchase/put/add/create">采购开单</Button>
        <!-- 需要有退货单创建权限 -->
        <Button v-if="tabItem.componentName == 'RefundList' && refPermiss.create" type="primary" to="/inventory/purchase/refund/add/create">退货开单</Button>
        <Button type="primary" to="/inventory/purchase/in/add/create" v-show="tabIndex===1"  style="margin-right:10px;">配件入库</Button>
        <Button type="primary" to="/inventory/purchase/in/add/create" v-show="tabIndex===2 && !isSelfStore"  style="margin-right:10px;">配件入库</Button>
      </template>
    </saas-tab>
    <!-- 数据列表 -->
    <component :query-show="tabItem.queryShow" ref="component" :is="tabItem.componentName" :isSelfStore="isSelfStore" :shareStoreId="shareStoreId"></component>
  </div>
</template>

<script>
  import PutList from "./put/list";
  import RefundList from "./refund/list";
  import InList from "./in/list";
  export default {
    name: "InventoryPurchase",
    components: { PutList, RefundList, InList },
    data () {
      let putPermiss = this.$permission.data.inventoryPurchasePut;            // 采购单权限
      let refPermiss = this.$permission.data.inventoryPurchaseRefund;         // 退货单权限
      let tabs = this.$permission.getPermissionTab("inventoryPurchaseList");  // 采购入库tab 
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;
      return {
        putPermiss,
        refPermiss,
        tabIndex,                 // 当前选中的tab的下标
        tabItem: tabs[tabIndex],  // 当前选中的tab { name: tab名称, menuCode: 权限code, componentName: 对应的组件名称, queryShow: 是否显示对应的筛选表单 }
        tabs,                     // tab列表
        isSelfStore:true,
        shareStoreId:''
      }
    },

    created () {
      // 每次初始化的时候，将当前组件加入到缓存里面
      this.$store.commit("setKeepAliveData", { name: "InventoryPurchase", value: true });
        if (!this.$storage.get('STORE').isChainStore&&this.tabs.findIndex(ele=>ele.name=="入库管理")!=-1){
            this.tabs.splice(this.tabs.findIndex(ele=>ele.name=="入库管理"),1)
        }
    },

    methods: {
      changeStore(id){
        this.shareStoreId = id
        this.$refs.component.onStoreChange({ shareStoreId:id })
      },
      // 切换tab
      onTabChange (index) {
        this.tabItem = this.tabs[index];  // 设置选中的tab
        this.shareStoreId = ''
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
