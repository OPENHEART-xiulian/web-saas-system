<template>
  <div class="workoder-list">
    <div class="table-list">
      <table-item
        v-for="item in resultList"
        :key="item.statementNo"
        :tableItem="item"
        @remark="remark"
        @getMaterial="getMaterial"
      />
      <div
        class="no-data"
        v-if="resultList.length === 0"
      >暂无数据</div>
      <Spin
        fix
        v-show="loading"
      ></Spin>
    </div>
    <w-print ref="print"></w-print>
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
    <factory-dialog ref="factoryDialog"></factory-dialog>
    <template v-if="resultList.length>0">
      <w-get-material
        ref="getMaterial"
        requestRole="worker"
      />
    </template>
    <w-remark ref="remarkModal" @remarkOk="onRemarkOk"/>
    <remove-dialog ref="removeDialog" @on-ok="removeConfirm" />
    
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
import factoryDialog from '@/components/dialog/factory-dialog'
import { repairTypeArr } from '@/store/json/default'
import RemoveDialog from '@/components/dialog/remove-dialog'
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
    WRemark,
    RemoveDialog
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

  data () {
    let permissionData = this.$permission.data.workerList
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
      formData: {}, // 查询条件
      dialogData: {
        // 弹窗所需要的参数
        statementNo: '', // 结算单号 跳转页面需要的参数
        type: 0,
        title: '',
        content: '',
        cancel: true
      },
      inputData: [],
      materialModalList: [],
      workId: '',
      confirmBtn: '确定', // 弹窗按钮文案
      tabType: 6
    }
  },

  watch: {},

  created () {
    // this.init()
  },

  methods: {
    init () {
      this.$store.commit('TO_INIT_SEARCH', true)
    },
    initSearch () {
      this.$store.commit('TO_INIT_SEARCH', true)
    },
    search (){
      this.$store.commit('TO_INIT_SEARCH', true)
    },
    getMaterial (id) {
      this.$refs.getMaterial.showModal(id)
    },
    onRemarkOk(){
      this.initSearch()
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
    remark(params){
      this.$refs.remarkModal.showModal(params,1)
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
    tabChange () {
      this.initSearch()
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
          this.initSearch()
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
