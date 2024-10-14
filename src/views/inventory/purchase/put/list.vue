<template>
  <!-- 采购入库 - 采购单管理 -->
  <div>
    <!-- 筛选表单 -->
    <saas-query 
      class="mb-20"
      ref="query"
      v-show="queryShow" 
      :loading="loading"
      :data="inputData"
      :auto="false"
      @on-reset="onReset"
      @on-query="onQuery">
      <select-input 
        ref="supplier" 
        slot="supplier" 
        request="supplierList" 
        filter="supplierName" 
        item-key="supplierName" 
        placeholder="输入关键字可快速匹配供应商" 
        @on-change="supplierChange"
        @on-select="supplierSelect"/>
      
      <template slot="staff" slot-scope="scope">
        <Select v-model="scope.formData[scope.item.key]">
          <Option v-for="(item, index) in staffList" :key="index" :value="item.userId">{{item.username}}</Option>
        </Select>
      </template>
    </saas-query>

    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getPurchasePutList"
      :auto="true"
      :columns="columns"  
      :default-params="defaultParams"
      :params="params"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    
    <remind-dialog 
      ref="remindDialog"
      :title="dialogData.title"
      :content="dialogData.content"
      @on-ok="remindOk">
    </remind-dialog>
    <m-print ref="print"/>
  </div>
</template>

<script>
import RemindDialog from '@/components/dialog/remind-dialog';
import SelectInput from './select-input';
import MPrint from './print';
import { purchaseType, bePutInStatus, settleStatus,  getLabel } from '@/store/json/default';

export default {
  name: "inventoryPurchaseList",
  components: { RemindDialog, SelectInput, MPrint },
  props: {
    queryShow: {
      type: Boolean,
      default: false
    },
    isSelfStore: {
      type: Boolean,
      default: true
    },
    shareStoreId: {
      type: String,
      default: ''
    }
  },
  data () {
    let permissionData = this.$permission.data.inventoryPurchasePut;
    let n = 0;
    for (const key in permissionData) {
      if (permissionData[key] && key !== 'create') n++;
    }
    let width = 180;
    if (n == 1) width = 70;
    else if (n  == 2) width = 180;
    const that = this
    let columns = [
      { title: '序号', type: 'index', width: 80 },
      { title: '单号', key: 'purchaseCode' },
      { title: '供应商', key: 'supplierName' },
      { title: '采购数量', key: 'totalQuantity' },
      { title: '采购人', key: 'operatedBy' },
      { 
        title: '入库状态', 
        key: 'purchaseStatus',
        render: (h, { row }) => {
          return h('span', row.purchaseStatus ? getLabel(row.purchaseStatus, bePutInStatus) : '--');
        }
      },
      { 
        title: '结算状态', 
        key: 'settleStatus',
        render: (h, { row }) => {
          return h('span', getLabel(row.settleStatus, settleStatus));
        }
      },
      { 
        title: '操作',
        width,
        render: (h, { row }) => {
          const btn1 = this.getElement(h, '编辑', () => {
            this.$router.push('/inventory/purchase/put/add/' + row.purchaseId);
          });
          const btn2 = this.getElement(h, '入库', () => {
            this.dialogData.title = '确认入库';
            this.dialogData.content = '入库后，采购单信息将无法编辑，确认入库吗？';
            this.dialogData.cancel = true;
            this.dialogData.id = row.purchaseId;
            this.dialogData.callback = this.purchaseConfirm;
            this.$refs.remindDialog.openModal();
          });
          const btn3 = this.getElement(h, '作废', () => {
            this.dialogData.title = '作废采购单';
            this.dialogData.content = '采购单作废后将不能恢复，确定作废采购单吗？';
            this.dialogData.cancel = true;
            this.dialogData.id = row.purchaseId;
            this.dialogData.callback = this.cancelForm;
            this.$refs.remindDialog.openModal();
          });
          const btn4 = this.getElement(h, '查看', () => {
            this.$router.push('/inventory/purchase/put/detail/' + row.purchaseId + `?shareStoreId=${this.shareStoreId}`+"&isSelfStore="+that.isSelfStore);
          });
          const btn5 = this.getElement(h, '付款', () => {
            this.$router.push('/inventory/purchase/put/pay/' + row.purchaseId);
          });
          const btn6 = this.getElement(h, '打印', () => {
            this.$refs.print.openPrint(row.purchaseId, this.shareStoreId);
          });

          // let elements = [];
          // if (row.purchaseStatus === '1') { // 未入库
          //   elements = [btn1, btn2, btn3, btn6];
          // } else if (row.purchaseStatus === '2' && row.settleStatus === '1') { // 已入库，未结算
          //   elements = [btn4, btn5, btn6];
          // } else if (row.settleStatus === '2') {
          //   elements = [btn4, btn6]
          // }
          let elms = [];
          if(that.isSelfStore){
            if (row.purchaseStatus === '1') {
              if (permissionData.update) elms.push(btn1);
              if (permissionData.input) elms.push(btn2);
              if (permissionData.delete) elms.push(btn3);
            } else if (row.purchaseStatus === '2' && row.settleStatus === '1') {
              if (permissionData.check) elms.push(btn4);
              if (permissionData.payment) elms.push(btn5);
            } else if (row.settleStatus === '2') {
              if (permissionData.check) elms.push(btn4);
            }
          }else{
            if (row.purchaseStatus === '2' && row.settleStatus === '1') {
              if (permissionData.check) elms.push(btn4);
            } else if (row.settleStatus === '2') {
              if (permissionData.check) elms.push(btn4);
            }
          }
          if (permissionData.print) elms.push(btn6);
          return elms;
        }
      }
    ];
    if (n == 0) columns.pop();
    return {
      loading: false,
      permissionData,
      staffList: [],
      dialogData: {
        title: '',
        content: '',
        cancel: true,
        callback: null
      },
      defaultParams: {
        supplierName: '',
        // operatorId: '',
        purchaseType: '0'
        // sortOrder: '-1',
        // orderBy: 'stockOutDate'
      }, // 除筛选表单外的参数 
      params: {},
      stockOutNo: '',
      inputData: [
        { type: 'text', key: 'purchaseCode', label: '单号', holder: '请输入采购单号' },
        { 
          label: '供应商',
          slot: 'supplier'
        },
        // { 
        //   type: 'select', 
        //   key: 'purchaseType', 
        //   holder: '请选择采购类型', 
        //   label: '采购类型', 
        //   data: purchaseType
        // },
        { 
          label: '采购人', 
          slot: 'staff',
          key: "operatorId"
        },
        { 
          type: 'select', 
          key: 'purchaseStatus', 
          holder: '请选择入库状态',
          label: '入库状态', 
          clearable: true,
          data: bePutInStatus.slice(0, 2)
        },
        { 
          type: 'select', 
          key: 'settleStatus', 
          holder: '请选择结算状态',
          label: '结算状态', 
          clearable: true,
          data: settleStatus
        },
        { type: "date", key: "orderAtFrom", label: "开单日期", holder: "开始日期" },
        { type: "date", key: "orderAtTo", label: " ", holder: "结束日期" },
      ],
      columns
    }
  },

  mounted () {
    this.getStaffList();
  },

  activated () {
    if (this.$route.query.refresh) {
      this.$refs.table.reset();
    }
  },

  methods: {
    resetForm () {
      this.defaultParams.supplierName = '';
      this.defaultParams.operatorId = '';
      this.$refs.supplier.setData('');
    },
    // 获取员工数据
    async getStaffList () {
      try {
        let data = await this.$ajax.getStaffList();
        this.staffList = data.rows;
      } catch (error) {
        console.log(error);
      }
    },

    supplierChange (str) {
      this.defaultParams.supplierName = str;
    },
    supplierSelect (data) {
      this.defaultParams.supplierName = data.supplierName;
    },

    onReset () {
      this.$refs.supplier.setData("");
      this.defaultParams.supplierName = "";
    },

    onQuery (params) {
      this.params = params;
      this.$refs.table.reset();
    },

    onStoreChange ( otherParams ) {
      this.params = Object.assign({},this.params,otherParams)
      this.$refs.table.reset();
    },

    onLoadingChange (loading) {
      this.loading = loading;
    },

    onTableSuccess (data) {

    },

    remindOk () {
      this.dialogData.callback();
    },
    // 确认入库
    async purchaseConfirm () {
      try {
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'purchaseConfirm',
          params: {
            purchaseId: this.dialogData.id
          }
        });

        if (res.code === '0') {
          this.$Message.success('入库成功');
          this.$refs.table.reset();
          this.$refs.remindDialog.onCancel();
        } else {
          this.$Message.warning('入库失败');
        }
      } catch (error) {
        this.$Message.warning('入库失败');
      }
    },
    // 作废采购单
    async cancelForm () {
      try {
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'purchaseCancel',
          params: {
            purchaseId: this.dialogData.id
          }
        });

        if (res.code === '0') {
          this.$Message.success('采购单已作废');
          this.$refs.table.reset();
          this.$refs.remindDialog.onCancel();
        } else {
          this.$Message.warning('作废失败');
        }
      } catch (error) {
        this.$Message.warning('作废失败');
      }
    },

    // 按钮
    getElement (h, text, clickHandle) {
      return h('i-button', {
        props: {
          type: 'text'
        },
        style: {
          marginRight: '5px'
        },
        on: {
          click: clickHandle || function () {}
        }
      }, text);
    }
  },
}
</script>
