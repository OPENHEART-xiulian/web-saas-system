<template>
  <div class="workoder-list">
    <saas-bread title="洗美工单">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" type="error"  to="/workorder/cleanout/add/create">
            <i class="iconfont icon-xinzeng"></i>
            <span>新建洗美工单</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>
    <query-form
      ref="queryForm"
      :params="queryForm"
      :inputData="inputData"
      v-show="queryShow"
      @reset="queryReset"
      @search="formatFormData"
      :loading="loading"
    />
    <w-tab
      :tab-index="tabType"
      @tab-change="tabChange"
      :tabList="tabList"
    />
    <div class="table-list">
      <template v-for="(item, index) in tableList">
        <table-item
          :key="index"
          :data="item"
          @item-emit="remindOpen"
          @print-emit="openPrint"
          @getMaterial="getMaterial"
          :isSelfStore="isSelfStore"
          :shareStoreId="formData.shareStoreId"
          @remark="remark"
        />
      </template>
      <div
        v-if="tableList.length === 0"
        class="no-data"
      >暂无工单信息</div>
      <Spin
        fix
        v-show="loading"
      ></Spin>
    </div>
    <!-- <w-pagination
      ref="pagination"
      :showSizer="true"
      :total="total"
      @change="pageChange"
    /> -->
    
    <div style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
      <saas-page
        ref="pagination"
        v-show="total > formData.rows"
        :sizer="true"
        :page="formData.page"
        :rows="formData.rows"
        :total="total"
        @on-change="pageChange">
      </saas-page>
    </div>
    <remind-dialog
      ref="remindDialog"
      :title="remindDialog.title"
      :content="remindDialog.content"
      :show-cancel="remindDialog.cancel"
      @on-ok="remindConfirm"
    />
    <w-print ref="print" :shareStoreId="formData.shareStoreId"></w-print>
    <template v-if="tableList.length>0">
      <w-get-material
        ref="getMaterial"
        requestRole="cleanout"
      />
    </template>
    <remove-dialog ref="removeDialog" @on-ok="removeConfirm" />
    <w-remark ref="remarkModal" @remarkOk="onRemarkOk"/>
  </div>
</template>

<script>
import mixins from './../list-mixins.js'
import TableItem from './table-item'
import WPrint from './print'
import WGetMaterial from './../components/workorder-receive-material' // 领取配件
import RemindDialog from '@/components/dialog/remind-dialog'
import RemoveDialog from '@/components/dialog/remove-dialog'
import WRemark from './../components/workorder-remark' // 备注
export default {
  mixins: [mixins],
  components: { TableItem, RemindDialog, WPrint, WGetMaterial, RemoveDialog, WRemark },
  data () {
    let tabList = this.$permission.getTabList('cleanoutList')
    let permissionData = this.$permission.data.workerCleanout
    return {
      permissionData,
      queryShow: false, // 是否显示查询条件
      loading: false, // 是否加载中
      showCancel: true, // 弹窗是否显示取消按钮
      tabType: 0, // tab 类型
      total: 0, // 数据总数
      formData: {
        shareStoreId:''
      },
      queryForm: {},
      tableList: [],
      remindDialog: {
        title: '',
        content: '',
        cancel: true
      },
      inputData: [],
      tabList,
      materialModalList: [],
      workId: '',
      isSelfStore: true
    }
  },

  watch: {
    $route (to, from) {
      // 在同一个页面切换tab时，需要刷新数据
      // if (to.path === from.path && to.path === '/workorder/cleanout/list') {
      this.init()
      // }
    }
  },

  created () {
    this.$store.dispatch('toGetBillUsers')
    this.init()
  },

  methods: {
    changeStore(id){
      this.formData.shareStoreId = id
      this.init()
    },
    getMaterial (id) {
      this.$refs.getMaterial.showModal(id)
    },
    remark(params){
      this.$refs.remarkModal.showModal(params,3)
    },
    init () {
      const type = Number(this.$route.query.type || 0)
      this.tabType = type
      this.formData = {
        page: 1,
        rows: 10,
        workStatus: this.tabList[type].status[0],
        payStatus: this.tabList[type].status[1],
        shareStoreId: this.formData.shareStoreId
      }
      this.changeInputData(type)
      this.$nextTick(() => {
        this.$refs.queryForm.search()
      })
    },
    onRemarkOk(){
      this.search()
    },

    async search (data) {
      const formData = Object.assign({}, this.formData, data || {})
      this.loading = true
      try {
        const res = await this.$store.dispatch({
          type: 'toGetCareList',
          params: formData
        })
        if (res.code === '0') {
          res.data.groupData && this.setGroupData(res.data.groupData)
          this.tableList = res.data.rows || []
          this.total = res.data.total || 0
        } else {
          this.$Message.error(res.msg)
        }
        this.loading = false
      } catch (error) {
        // this.$Message.error(error);
        this.loading = false
      }
    },

    // 格式查询参数
    formatFormData (formData) {
      this.$nextTick(() => {
        this.$refs.pagination.reset()
      })
      this.queryForm = formData
      this.search(this.queryForm)
    },

    changeInputData (type) {
      const arr = [
        {
          type: 'text',
          key: 'filter',
          label: '搜索工单',
          holder: '输入结算单号/车牌号/姓名/电话号码'
        },
        {
          type: 'date',
          key: ['createdAtFrom', 'createdAtTo'],
          label: '开单日期',
          holder: ['开始日期', '结束日期']
        }
      ]

      const settle = {
        type: 'date',
        key: ['settlementDateFrom', 'settlementDateTo'],
        label: '结算日期',
        holder: ['开始日期', '结束日期']
      }

      if (type === 3 || type === 4) {
        arr.push(settle)
      }

      this.inputData = arr
    },

    pageChange (params) {
      this.queryForm.page = params.page
      this.queryForm.rows = params.rows
      this.search(this.queryForm)
    },

    queryReset () {
      this.queryForm = {}
      this.init()
    },

    remindOpen (obj) {
      if (obj.type === 0) {
        this.$refs.removeDialog.openModal(obj)
      } else {
        this.remindDialog = obj
        this.$refs.remindDialog.openModal()
      }
    },

    removeConfirm (params) {
      this.remindDialog = params;
      this.$refs.removeDialog.onCancel()
      this.remindConfirm();
    },

    async remindConfirm () {
      this.$refs.remindDialog.onCancel()
      if (!this.remindDialog.cancel) return
      let name = ''
      const params = {
        statementNo: this.remindDialog.statementNo
      }
      if (this.remindDialog.type === 0) {
        name = 'careCancel'
        params.cancelReason = this.remindDialog.cancelReason;
      }
      if (this.remindDialog.type === 1) name = 'careStockOut'
      if (this.remindDialog.type === 2) name = 'careCredit'
      const res = await this.$store.dispatch({
        type: 'toGetCareAction',
        name: name,
        params: params
      })

      if (res.code === '0') {
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
        this.$Message.error('操作失败')
      }
    }
  }
}
</script>
