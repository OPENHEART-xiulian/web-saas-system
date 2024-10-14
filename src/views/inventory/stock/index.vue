<template>
  <!-- 配件 - 配件库存模块 -->
  <div>
    <!-- 面包屑 -->
    <saas-bread title="配件库存">
      <template slot="actions">
        <saas-store-select v-model="isSelfStore" @on-change="changeStore" ref="storeSelect"/>
      </template>
    </saas-bread>
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" @on-change="onTabChange">
      <saas-toggle-btn slot="right" v-model="tabItem.queryShow" v-show="tabIndex === 1" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </saas-tab>
    <!-- 数据列表 -->
    <keep-alive>
      <component :query-show="tabItem.queryShow" :is="tabItem.componentName"  ref="component" @on-head-change="updateTabs" :isSelfStore="isSelfStore"></component>
    </keep-alive>
  </div>
</template>

<script>
  import StockList from "./partstock/list";
  import WarningList from "./warning/list";
  export default {
    name: "InventoryStock",
    components: { StockList, WarningList },
    data () {
      let tabs = this.$permission.getPermissionTab("inventoryStockTab");
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;
      return {
        isSelfStore:true,
        tabIndex,                 // 当前选中的tab的下标
        tabItem: tabs[tabIndex],  // 当前选中的tab { name: tab名称, menuCode: 权限code, componentName: 对应的组件名称, queryShow: 是否显示对应的筛选表单 }
        tabs,                     // tab列表
        shareStoreId:''
      }
    },

    created () {
      this.$store.commit("setKeepAliveData", { name: "InventoryStock", value: true });
      this.getComponnentWarningCount();
    },


    methods: {
      changeStore(id){
        this.shareStoreId = id
        this.$refs.component.onTableSearch({ shareStoreId:id })
        if( this.tabIndex === 0 ){
          this.$refs.component.initByShareStoreId({ shareStoreId:id },true)
        }
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

      updateTabs (count, key) {
        this.tabs.forEach(item => {
          if (item.headName == key) item.badge = count;
        });
      },

      async getComponnentWarningCount () {
        let res = await this.$ajax.getComponnentWarningCount();
        this.updateTabs(res.data.total, "warningCount");
      }
    }
  }
</script>
