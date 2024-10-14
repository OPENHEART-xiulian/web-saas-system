<template>
  <div class="searchResult">
    <saas-bread title="搜索结果" />
    <w-tab
      :tabList="tabList"
      :tabIndex="tabIndex"
      @tab-change="tabChange"
    >
    </w-tab>
    <work-result v-if="Number(tabIndex)===0" :searchText="searchText"/>
    <client-result v-if="Number(tabIndex)===1" :searchText="searchText"/>
    <car-result  v-if="Number(tabIndex)===2" :searchText="searchText"/>
  </div>

</template>
<script>
import '@/styles/views/searchResult/index.less'
import workResult from './workorder'
import clientResult from './client'
import carResult from './car'
export default {
  components: {workResult, clientResult, carResult},
  data () {
    return {
      tabList: [
        {
          name: '工单信息',
        },
        {
          name: '客户信息',
        },
        {
          name: '车辆信息',
        }
      ],
      tabIndex: 0,
      searchText: ''
    }
  },
  watch: {
    $route (to, from) {
      this.tabIndex = Number(to.query.type)
      this.searchText = to.query.text
    },
  },

  created () {
    this.tabIndex = Number(this.$route.query.type)
    this.searchText = this.$route.query.text
    this.$store.dispatch('toGetBillUsers')
  },
  mounted () {
   // this.initTabIndex()
  },

  computed: {},

  methods: {
    initTabIndex () {
      let pathArr = this.$route.path.split('/')
      console.log(pathArr)
      if (pathArr.length > 3) {
        let cPath = pathArr[3]
        let index = this.tabList.findIndex(item => item.path.includes(cPath))
        this.tabIndex = index
      } else {
        this.tabIndex = 0
      }
    },
    tabChange (index, data) {
      const url = `/searchResult?text=${this.searchText.replace(/\#/, '%23')}&type=${index}`
      this.$router.push(url)
      this.$router.push()
    }
  }
}
</script>
