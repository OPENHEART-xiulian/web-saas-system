<template>
  <div class='remind-setting'>
    <div class="searchResult_info">共查询到 {{workData.total}} 个相关结果：<span style="color:#ff9933">{{this.searchText}}</span> </div>

    <div
      v-for="item in orderList"
      :key="item._id"
    >
      <workorderResult
        :result="item"
        v-if="item.orderType==='1'"
      />
      <sparepartResult
        :result="item"
        v-if="item.orderType==='2'"
      />
      <salereturnResult
        :result="item"
        v-if="item.orderType==='4'"
      />
      <cleanoutResult
        :result="item"
        v-if="item.orderType==='3'"
      />
    </div>
    <div style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
      <saas-page
        ref="pagination"
        v-show="workData.total > params.rows"
        :sizer="true"
        :page="params.page"
        :rows="params.rows"
        :total="workData.total"
        @on-change="pageChange">
      </saas-page>
    </div>
    <Spin
      v-if="loading"
      fix
    ></Spin>
  </div>

</template>
<script>
import { mapState } from 'vuex'
import '@/styles/views/customer/remind-setting.less'
import formatInput from '@/components/format-input'
import workorderResult from '@/views/workorder/worker/searchResult' // 维修工单
import sparepartResult from '@/views/workorder/sparepart/searchResult' // 销售工单
import salereturnResult from '@/views/workorder/salereturn/searchResult' // 退货工单
import cleanoutResult from '@/views/workorder/cleanout/searchResult' // 洗美工单
export default {
  components: {
    formatInput,
    workorderResult,
    sparepartResult,
    salereturnResult,
    cleanoutResult,
  },
  data () {
    return {
      a: 10,
      loading: false,
      orderList: [],
      workData: {
        total: 0
      },
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  props: {
    searchText: {
      type: String,
      default: ''
    }
  },

  created () {},

  watch: {
    searchText: {
      handler (nV) {
        if (nV === '') return
        this.search()
      },
      immediate: true
    },
    canSearch (newV) {
      if (newV) {
        this.search()
      }
    }
  },

  computed: {
    ...mapState({
      canSearch: state => state.global.canInitSearch,
    }),
  },
  mounted () {
     // this.search()
  },
  methods: {
    async search () {
      this.loading = true
      try {
        const data = await this.$store.dispatch('actionGet', {
          name: 'orderSearch',
          params: Object.assign({ filter: this.searchText }, this.params)
        })
        if (data.code === '0') {
          this.workData = data.data
          this.orderList = data.data.rows
        }
      } catch (error) {
        console.log(error)
      }
      this.$store.commit('TO_INIT_SEARCH', false)
      this.loading = false
    },

    pageChange (params) {
      this.params = params
      this.search()
    }
  }
}
</script>
