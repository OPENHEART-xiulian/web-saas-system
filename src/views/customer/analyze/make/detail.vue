<template>
  <!-- 成交客户详情 -->
  <div>
    <saas-bread title="成交客户详情">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="tabChange" :tabList="tabList"></w-tab>
    <router-view style="margin-top: 20px;"></router-view>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { formatTime } from '@/assets/js/utils';

export default {
  data () {
    let tabList = this.$permission.getTabList('customerAnalyzeMakeDetail')
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    if (tabIndex === -1) tabIndex = 0;
    return {
      tabIndex,
      tabList,
      tabItem: {}
    }
  },
  created () {
    this.tabChange(this.tabIndex)
  },
  methods: {
    tabChange (index) {
      let formData = this.$route.query;
      let str = '?type=' + formData.type;
      str += '&p=' + formData.p;
      str += '&dateFrom=' + formData.dateFrom;
      str += '&dateTo=' + formData.dateTo;
      this.tabItem = this.tabList[index];
      this.$router.replace(this.tabList[index].path + str);
    }
  }
}
</script>
