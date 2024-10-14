<template>
  <!-- 客户标签 -->
  <div class="label-list">
    <saas-bread title="客户标签" v-if="$route.meta.isList">
      <template slot="actions">
        <Button type="error" @click="toAdd('create')" v-if="list.length < 20 && permissionData.create">
          <i class="iconfont icon-xinzeng left-icon"></i>
          <span>新增标签</span>
        </Button>
      </template>
    </saas-bread>
    <w-tab v-if="$route.meta.isList" :tabList="tabList" @tab-change="tabChange">
    </w-tab>
    <router-view />
  </div>
</template>

<script>
  import '@/styles/views/customer/label-list.less';
  export default {
    data () {
      let tabList = this.$permission.getTabList('customerLabelList');
      let permissionData = this.$permission.data.customerLabel;
      return {
        permissionData,
        tabList
      }
    },

    created () {
      // this.init(this.$route);
    },

    watch: {
      // $route (to) {
      //   this.init(to);
      // }
    },

    computed: {
      list () {
        return this.$store.getters.getCustomerTagList;
      }
    },

    methods: {
      init (route) {
        if (route.meta.isList) {
          let tabList = this.tabList;
          let data = tabList.find(elm => elm.path === route.path);
          if (tabList.length && !data) data = tabList[0];
          this.$router.replace(data.path);
        }
      },

      tabChange (index, data) {
        this.$router.push(data.path);
      },
      
      toAdd (id) {
        this.$router.push('/customer/label/form/' + id);
      }
    }
  }
</script>
