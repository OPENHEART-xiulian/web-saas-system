
import '@/styles/views/workorder/workoder-list.less';
import QueryForm from '@/components/query-form';

export default {
  components: { QueryForm },
  data () {
    return {
      queryShow: false,
      loading: false,
      tabType: 0,
      total: 0,
      params: { page: 1, rows: 10 },
      inputData: [],
      tabList: [],
      tableList: [],
      formData: {}
    }
  },

  activated () {
    // 如果是需要刷新页面，替换当前路由的refresh，防止从当前路由跳转到其他路由返回的时候继续刷新
    if (this.$route.query.refresh) {
      let query = Object.assign({}, this.$route.query);
      delete query.refresh;
      this.$router.replace({
        path: this.$route.path,
        query: query
      })
    }
  },

  // beforeRouteEnter (to, from, next) {
  //   if (to.meta.leve < from.meta.leve) {
  //     to.meta.keepAlive = true;
  //   } else {
  //     to.meta.keepAlive = false;
  //   }
  //   next()
  // },

  // beforeRouteLeave (to, from, next) {
  //   if (to.meta.leve > from.meta.leve) {
  //     from.meta.keepAlive = true;
  //   } else {
  //     from.meta.keepAlive = false;
  //   }
  //   next()
  // },

  methods: {
    toggleQuery () {
      this.queryShow = !this.queryShow;
    },

    tabChange (index) {
      this.$router.push(this.$route.path + '?type=' + index);
      // if (String(index) === this.tabType.type && this.init) {
      //   this.init();
      // };
    },
    
    // 设置分组数量
    setGroupData (group) {
      for (const key in group) {
        let tab = this.tabList.find(elm => elm.key === key);
       if (tab) tab.value = group[key] || 0;
      }
    },

    openPrint (statementNo, type) {
      this.$refs.print.openPrint(statementNo, type);
    }
  }
}
