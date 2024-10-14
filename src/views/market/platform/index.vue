<template>
  <!-- 配件 - 配件库存模块 -->
  <div class="pt-20">
    <!-- tab列表 -->
    <saas-tab v-model="tabIndex" :data="tabs" max-badge="99" @on-change="onTabChange"></saas-tab>
    <!-- 数据列表 -->
    <keep-alive>
      <component :is="tabItem.componentName" @on-change="onDataChange" @on-head-change="onHeadChange"></component>
    </keep-alive>
  </div>
</template>
<script>
  import ProjectList from "./project";          // 项目列表
  import OrderList from "./order";              // 订单列表

  export default {
    components: { ProjectList, OrderList },
    data () {
      let tabs = this.$permission.getPermissionTab("marketPlatformList");
      let name = this.$route.query.name;
      let tabIndex = name ? tabs.findIndex(elm => elm.componentName == name) : 0;
      return {
        tabs,
        tabIndex,
        tabItem: tabs[tabIndex],
        headerData: null
      }
    },

    methods: {
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
      },

      // 设置head值
      onDataChange (headerData) {
        this.headerData = headerData;
        this.updateTabs();
      },

      /**
       * 更新tab徽标的值
       * @param { string } key headData对应的key { birthday: 生日提醒, insurance: 保险提醒, annualCheck: 年检提醒, maintain: 保养提醒 }
       * @param { number } value 改变值：1或-1
       */
      onHeadChange (key, value) {
        this.headerData[key] += value;
        this.updateTabs();
      },

      // 更新tabs里面的徽标的值
      updateTabs () {
        this.tabs.forEach(item => {
          item.badge = this.headerData[item.headName];
        });
      }
    }
  }
</script>
