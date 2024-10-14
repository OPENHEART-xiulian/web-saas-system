<template>
  <!-- <router-view /> -->
  <!-- 配件 - 即进即出 -->
  <div class="pt-20">
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" @on-change="onTabChange">
      <saas-toggle-btn slot="right" v-model="tabItem.queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </saas-tab>
    <!-- 数据列表 -->
    <component :query-show="tabItem.queryShow" :is="tabItem.componentName" ref="compo"></component>
  </div>
</template>

<script>
  import TaskList from "./task/list";
  import PaymentList from "./payment/list";
  export default {
    name: "InventoryForward",
    components: { TaskList, PaymentList },
    data () {
      let tabs = this.$permission.getPermissionTab("inventoryForwardTab");
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;
      return {
        tabIndex,                 // 当前选中的tab的下标
        tabItem: tabs[tabIndex],  // 当前选中的tab { name: tab名称, menuCode: 权限code, componentName: 对应的组件名称, queryShow: 是否显示对应的筛选表单 }
        tabs,                     // tab列表
      }
    },

    created () {
      // 每次初始化的时候，将当前组件加入到缓存里面
      this.$store.commit("setKeepAliveData", { name: "InventoryForward", value: true });
    },

    watch:{
      $route(to,from){
        if(from.fullPath.indexOf('taskDetail')>-1 && this.tabIndex === 0){
          this.$refs.compo.tableInit()
        }
      }
    },

    methods: {
      // getTabItem () {
      //   let tabIndex = Number(this.$route.query.tabIndex || 0);
      //   this.tabIndex = tabIndex;
      //   this.tabItem = this.tabs[tabIndex];
      // },
      // 切换tab
      onTabChange (index) {
        this.tabItem = this.tabs[index];  // 设置选中的tab
        // 替换路由是为了刷新的时候选中对应的tab
        this.$router.replace({
          path: this.$route.path,
          query: {
            name: this.tabItem.componentName
          }
        });
      }
    }
  }
</script>
