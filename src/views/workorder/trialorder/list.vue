<template>
  <div class="workoder-list">
    <saas-bread title="试算单">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" type="error" to="/workorder/trialorder/add/create">
            <i class="iconfont icon-xinzeng"></i>
            <span>新建试算单</span>
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
      @reset="init"
      @search="formatFormData"
      :loading="loading"
    />
    <div class="table-list">
      <table-item
        v-for="item in tableList"
        :key="item.statementNo"
        :tableItem="item"
        :isSelfStore="isSelfStore"  
        :shareStoreId="formData.shareStoreId"
      />
      <div class="no-data" v-if="tableList.length === 0">暂无数据</div>
      <Spin fix v-show="loading"></Spin>
    </div>
    <!-- <w-pagination
      ref="pagination"
      :showSizer="true"
      :total="total"
      @change="pageChange"
    />
     -->
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
    <remind-dialog
      ref="remindDialog"
      :show-cancel="true"
      :title="dialogData.title"
      :content="dialogData.content"
      confirmBtn="确定"
      @on-ok="remindConfirm"
    />
  </div>
</template>

<script>
import mixins from './../list-mixins.js'
import WPrint from './print'
import TableItem from './table-item'
import RemindDialog from '@/components/dialog/remind-dialog'
import { repairTypeArr } from '@/store/json/default'
import { formatTime, randomStr, verify } from "@/assets/js/utils";
export default {
  mixins: [mixins],
  components: {
    TableItem,
    WPrint,
    RemindDialog
  },
  data () {
    let permissionData = this.$permission.data.workerTrialorder
    return {
      permissionData,
      queryShow: false, // 是否显示查询条件
      loading: false, // 是否加载中
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
        type: 0,  // -1 删除 1 生成
        title: '',
        content: ''
      },
      tableList: [], // 数据列表
      inputData: [
        {
          type: 'text',
          key: 'filter',
          label: '搜索工单',
          holder: '输入试算单号/车牌号/姓名/电话号码'
        },
        {
          type: 'date',
          key: ['createdAtFrom', 'createdAtTo'],
          label: '开单日期',
          holder: ['开始日期', '结束日期']
        }
      ],
      isSelfStore:true
    }
  },

  mounted () {
    this.$store.dispatch('toGetBillUsers')
    this.init()
  },

  methods: {
    changeStore(id){
      this.formData.shareStoreId = id
      this.init()
    },
    init () {
      this.queryForm = {}
      this.formData = {
        page: 1,
        rows: 10,
        shareStoreId: this.formData.shareStoreId
      }
      this.$nextTick(() => {
        this.$refs.queryForm.search();
      })
    },

    async search (data) {
      const formData = Object.assign({}, this.formData, data || {});
      this.loading = true;
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'trialOrderList',
          params: formData
        });
        if (res.code === '0') {
          this.tableList = res.data.rows || [];
          this.total = res.data.total || 0;
        } else {
          this.$Message.error(res.msg);
        }
        this.loading = false;
      } catch (error) {
        console.dir(error);
        this.loading = false;
      }
    },

    // 格式查询参数
    formatFormData (formData) {
      // this.$nextTick(() => {
        this.$refs.pagination.reset();
      // })
      this.queryForm = formData;
      this.search(this.queryForm);
    },

    // 分页切换
    pageChange (params) {
      this.queryForm.page = params.page;
      this.queryForm.rows = params.rows;
      this.search(this.queryForm);
    },

    // 打开提示弹窗
    openRemindModal (id, statementNo, type, title, content) {
      this.dialogData.id = id;
      this.dialogData.statementNo = statementNo;
      this.dialogData.type = type;
      this.dialogData.title = title;
      this.dialogData.content = content;
      this.$refs.remindDialog.openModal();
    },

    // 弹窗确认
    remindConfirm () {
      this.$refs.remindDialog.onCancel();
      let request = "";
      let tip = "";
      const params = {}
      if (this.dialogData.type === -1) {
        params.id = this.dialogData.id;
        request = "trialOrderDelete"; // 删除
      } else {
        request = "trialOrderCreate"; // 生成工单
        params.trialOrderNo = this.dialogData.statementNo;
        params.trialOrderId = this.dialogData.id;
        params.statementNo =
          randomStr(4) + formatTime(new Date(), "yyMMddHHmmss") + randomStr(4);
      }
      this.$store.dispatch({
        type: 'actionPost',
        name: request,
        params
      }).then(res => {
        if (res.code === '0') {
          this.$Message.success({
            content: this.dialogData.type === -1 ? '删除成功' : '生成工单成功',
            onClose: () => {
              this.init();
            }
          });
        } else {
          this.$Message.error({
            content: this.dialogData.type === -1 ? res.msg : '配件库存不足，请修改工单配件信息或先进行采购',
          })
        }
      }).catch(err => {
        this.$store.commit('REQUEST_ERROR', { err });
      });
    }
  }
}
</script>
