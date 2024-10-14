<template>
  <div class="workoder-list">
    <div class="table-list">
      <template v-for="item in resultList">
        <table-item
          :key="item._id"
          :data="item"
          @item-emit="remindOpen"
        />
      </template>
      <div
        v-if="resultList.length === 0"
        class="no-data"
      >暂无工单信息</div>
      <Spin
        fix
        v-show="loading"
      ></Spin>
    </div>
    <remind-dialog
      ref="remindDialog"
      :title="remindDialog.title"
      :content="remindDialog.content"
      :show-cancel="remindDialog.cancel"
      @on-ok="remindConfirm"
    />
    <w-print ref="print"></w-print>
  </div>
</template>

<script>
import mixins from './../list-mixins.js'
import WPrint from './print'
import TableItem from './table-item'
import RemindDialog from '@/components/dialog/remind-dialog'

export default {
  mixins: [mixins],
  components: { TableItem, RemindDialog, WPrint },
  data () {
    let tabList = this.$permission.getTabList('salereturnList')
    let permissionData = this.$permission.data.workerSalereturn
    return {
      permissionData,
      showQuery: false, // 是否显示查询条件
      loading: false, // 是否加载中
      showCancel: true, // 弹窗是否显示取消按钮
      tabType: 0, // tab 类型
      total: 0, // 数据总数
      formData: {},
      queryForm: {},
      remindDialog: {
        title: '',
        content: '',
        cancel: true
      },
      inputData: [],
      tabList
    }
  },
  props: {
    result: Object
  },
  computed: {
    resultList () {
      let arr = []
      arr.push(this.result)
      return arr
    }
  },

  methods: {
    initSearch () {
      this.$store.commit('TO_INIT_SEARCH', true)
    },
    remindOpen (obj) {
      this.remindDialog = obj
      this.$refs.remindDialog.openModal()
    },

    async remindConfirm () {
      // 1入库  0作废
      this.$refs.remindDialog.onCancel()
      if (!this.remindDialog.cancel) return
      let name = ''
      if (this.remindDialog.type === 0) name = 'saleRefundCancel'
      if (this.remindDialog.type === 1) name = 'saleRefundStockIn'
      const params = {
        _id: this.remindDialog._id
      }
      const res = await this.$store.dispatch({
        type: 'toGetSaleAction',
        name: name,
        params: params
      })

      if (res.code === '0') {
        this.initSearch()
        this.$Message.success({
          content: '操作成功',
          onClose: () => {
            if (this.tabType === this.remindDialog.tabType) {
              this.init()
            } else {
              this.tabChange(this.remindDialog.tabType)
            }
          }
        })
      } else {
        this.$Message.error(res.msg || '操作失败')
      }
    }
  }
}
</script>
