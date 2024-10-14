<template>
  <!-- 维修工单列表 -->
  <div class="workoder-list">
    <!-- 面包屑 -->
    <saas-bread title="维修工单">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起订单筛选', '展开订单筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" type="error" to="/workorder/worker/add/create">
            <i class="iconfont icon-xinzeng"></i>
            <span>新建维修工单</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>
    
    <!-- 筛选表单 -->
    <!-- <saas-query 
      class="mb-20"
      ref="query"
      v-show="queryShow" 
      :loading="loading"
      :data="inputData"
      :auto="false"
      @on-reset="onReset"
      @on-query="onQuery">
    </saas-query> -->
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
      <table-item
        v-for="item in tableList"
        :key="item.statementNo"
        :tableItem="item"
        @getMaterial="getMaterial"
        @remark="remark"
        :isSelfStore="isSelfStore"
        :shareStoreId="formData.shareStoreId"
      />
      <div
        class="no-data"
        v-if="tableList.length === 0"
      >暂无数据</div>
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
    <w-print ref="print" :shareStoreId="formData.shareStoreId"></w-print>

    <construction-dialog
      ref="constructionDialog"
      @on-ok="tabChange"
    />
    <remind-dialog
      ref="remindDialog"
      :show-cancel="dialogData.cancel"
      :title="dialogData.title"
      :content="dialogData.content"
      :confirmBtn="confirmBtn"
      @on-ok="remindConfirm"
    />
    <remove-dialog ref="removeDialog" @on-ok="removeConfirm" />
    <factory-dialog ref="factoryDialog"></factory-dialog>
    <template v-if="tableList.length>0">
      <w-get-material
        ref="getMaterial"
        requestRole="worker"
      />
    </template>
    <w-remark ref="remarkModal" @remarkOk="onRemarkOk"/>

  </div>
</template>

<script>
import mixins from './../list-mixins.js'
import WPrint from './../print'
import WGetMaterial from './../components/workorder-receive-material' // 领取配件
import WRemark from './../components/workorder-remark' // 备注
import TableItem from './table-item'
import ConstructionDialog from '@/components/dialog/construction-dialog'
import RemindDialog from '@/components/dialog/remind-dialog'
import RemoveDialog from '@/components/dialog/remove-dialog'
import factoryDialog from '@/components/dialog/factory-dialog'
import { repairTypeArr } from '@/store/json/default'
// import { formatTime } from '@/assets/js/utils';
export default {
  mixins: [mixins],
  components: {
    TableItem,
    WPrint,
    ConstructionDialog,
    RemindDialog,
    factoryDialog,
    WGetMaterial,
    RemoveDialog,
    WRemark
  },
  data () {
    let permissionData = this.$permission.data.workerList
    let tabList = this.$permission.getTabList('workerList')
    return {
      permissionData,
      showQuery: false, // 是否显示查询条件
      loading: false, // 是否加载中
      showCancel: true, // 弹窗是否显示取消按钮
      tabType: 0, // tab 类型
      total: 0, // 数据总数
      pageData: {
        page: 1,
        rows: 10
      },
      queryForm: {},
      formData: {
        shareStoreId:''
      }, // 查询条件
      dialogData: {
        // 弹窗所需要的参数
        statementNo: '', // 结算单号 跳转页面需要的参数
        type: 0,
        title: '',
        content: '',
        cancel: true
      },
      tableList: [], // 数据列表
      inputData: [],
      tabList,
      materialModalList: [],
      workId: '',
      confirmBtn: '确定', // 弹窗按钮文案
      isSelfStore: true,
      remindStatusObj:{
        customerId:'',
        vehicleId:'',
        maintainExpDate:'',
        adviceMileage:0
      }
      
      
    }
  },

  watch: {
    $route (to, from) {
      // 在同一个页面切换tab时，需要刷新数据
      // if (to.path === from.path && to.path === '/workorder/worker/list') {
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
      this.$refs.remarkModal.showModal(params,1)
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
          type: 'toGetWorkerList',
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
        console.dir(error)
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

    // 分页切换
    pageChange (params) {
      this.queryForm.page = params.page
      this.queryForm.rows = params.rows
      this.search(this.queryForm)
    },

    queryReset () {
      this.queryForm = {}
      this.init()
    },
    // 为了切换tab的时候，查询条件数据不重置
    setQueryForm () {
      const data = Object.assign({}, this.queryForm)
      // const data = this.queryForm;
      if (this.tabType === 0 || this.tabType === 1 || this.tabType === 3) {
        delete data.settlementDateFrom
        delete data.settlementDateTo
        delete data.factoryDateFrom
        delete data.factoryDateTo
      }
      if (this.tabType === 2) {
        delete data.factoryDateFrom
        delete data.factoryDateTo
      }
      return data
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
          type: 'select',
          key: 'repairType',
          label: '维修类型',
          clearable: true,
          holder: '选择维修类型',
          data: repairTypeArr
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

      const factory = {
        type: 'date',
        key: ['factoryDateFrom', 'factoryDateTo'],
        label: '出厂日期',
        holder: ['开始日期', '结束日期']
      }

      if (type === 2) {
        arr.push(settle)
      }

      if (type === 4 || type === 5) {
        arr.push(settle)
        arr.push(factory)
      }

      this.inputData = arr
    },

    // 打开提示弹窗
    openRemindModal (id, type, title, content, advance) {
      this.dialogData.statementNo = id
      this.dialogData.type = type
      this.dialogData.title = title
      this.dialogData.content = content
      if (advance) this.dialogData.advance = advance // 预收款
      if (content) this.dialogData.cancel = true
      else this.dialogData.cancel = false
      if (title === '暂时无法结算') {
        this.confirmBtn = '取消预收'
      } else {
        this.confirmBtn = '确定'
      }
      this.$refs.remindDialog.openModal()
    },

    openRemoveModal (statementNo, type) {
      this.$refs.removeDialog.openModal({
        statementNo,
        type
      });
    },

    removeConfirm (formData) {
      this.$refs.removeDialog.onCancel();
      const payload = {
        params: {
          statementNo: formData.statementNo,
          cancelReason: formData.cancelReason
        },
        request: 'workCancel'
      }
      
      this.$store
        .dispatch({
          type: 'toWorkOpt',
          payload
        })
        .then(res => {
          if (res.code === '0') {
            this.$Message.success({
              content: '操作成功',
              onClose: () => {
                if (this.tabType === formData.type) {
                  this.init()
                } else {
                  this.tabChange(formData.type)
                }
              }
            })
          }
        })
        .catch(err => {
          this.$store.commit('REQUEST_ERROR', { err })
        })
    },

    // 弹窗确认
    remindConfirm () {
      if (this.dialogData.content) {
        let request = ''
        switch (this.dialogData.title) {
          case '作废工单':
            request = 'workCancel'
            break
          case '工单挂账':
            request = 'workCredit'
            break
          case '出厂确认':
            request = 'workLeave'
            break
          case '重新施工':
            request = 'workRemaintain'
            break
          case '取消预收':
            request = 'workPayCancel'
            break
          case '重新结算':
            request = 'workResettle'
            break
          case '暂时无法结算':
            request = ''
            break
          default:
            break
        }

        if (request) {
          this.confirmRequest(request)
        } else {
          this.openRemindModal(
            this.dialogData.statementNo,
            1,
            '取消预收',
            '取消预收后，需要返还客户￥' +
              this.dialogData.advance +
              '，确定取消预收？'
          )
        }
      } else {
        this.$refs.remindDialog.onCancel()
      }
    },

    confirmRequest (request) {
      this.$refs.remindDialog.onCancel()

      const payload = {
        params: {
          statementNo: this.dialogData.statementNo
        },
        request: request
      }

      this.$store
        .dispatch({
          type: 'toWorkOpt',
          payload
        })
        .then(res => {
          if (res.code === '0') {
            this.$Message.success({
              content: '操作成功',
              onClose: () => {
                if (this.tabType === this.dialogData.type) {
                  this.init()
                } else {
                  this.tabChange(this.dialogData.type)
                }
              }
            })
          }
        })
        .catch(err => {
          this.$store.commit('REQUEST_ERROR', { err })
        })
    }
  }
}
</script>
