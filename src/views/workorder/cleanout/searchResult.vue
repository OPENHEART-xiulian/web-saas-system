<template>
  <div class="workoder-list">
    <div class="table-list">
      <template v-for="(item, index) in resultList">
        <table-item
          :key="index"
          :data="item"
          @item-emit="remindOpen"
          @print-emit="openPrint"
          @getMaterial="getMaterial"
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
    <template v-if="resultList.length>0">
      <w-get-material
        ref="getMaterial"
        requestRole="cleanout"
      />
    </template>
  </div>
</template>

<script>
import mixins from './../list-mixins.js'
import TableItem from './table-item'
import WPrint from './print'
import WGetMaterial from './../components/workorder-receive-material' // 领取配件
import RemindDialog from '@/components/dialog/remind-dialog'

export default {
  mixins: [mixins],
  components: { TableItem, RemindDialog, WPrint, WGetMaterial },
  data () {
    let tabList = this.$permission.getTabList('cleanoutList')
    let permissionData = this.$permission.data.workerCleanout
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
      tabList,
      materialModalList: [],
      workId: ''
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
    getMaterial (id) {
      this.$refs.getMaterial.showModal(id)
    },

    remindOpen (obj) {
      this.remindDialog = obj
      this.$refs.remindDialog.openModal()
    },

    async remindConfirm () {
      this.$refs.remindDialog.onCancel()
      if (!this.remindDialog.cancel) return
      let name = ''
      if (this.remindDialog.type === 0) name = 'careCancel'
      if (this.remindDialog.type === 1) name = 'careStockOut'
      if (this.remindDialog.type === 2) name = 'careCredit'
      const params = {
        statementNo: this.remindDialog.statementNo
      }
      const res = await this.$store.dispatch({
        type: 'toGetCareAction',
        name: name,
        params: params
      })

      if (res.code === '0') {
        this.initSearch()
        this.$Message.success({
          content: '操作成功',
          onClose: () => {
            if (this.tabType === this.remindDialog.tabType) {
            } else {
              this.tabChange(this.remindDialog.tabType)
            }
          }
        })
      } else {
        this.$Message.error('操作失败')
      }
    }
  }
}
</script>
