<template>
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
      api="getPurchaseRefundList"
      :auto="true"
      :columns="columns"  
      :default-params="defaultParams"
      :params="params"
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
import RemindDialog from "@/components/dialog/remind-dialog";
import SelectInput from "./select-input";
import MPrint from "./print";
import { formatTime } from "@/assets/js/utils.js";
import { returnStatus, refundStatus,  getLabel } from "@/store/json/default";

export default {
  name: "inventoryRefundList",
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
    let permissionData = this.$permission.data.inventoryPurchaseRefund;
    let n = 0;
    for (const key in permissionData) {
      if (permissionData[key] && key !== "create") n++;
    }
    let width = 180;
    if (n == 1) width = 70;
    else if (n == 2) width = 100;
    const that = this

    let columns = [
      { title: "序号", type: "index", width: 80 },
      { title: "单号", key: "returnFormCode" },
      { title: "供应商", key: "supplierName" },
      { title: "退货数量", key: "totalQuantity" },
      { title: "开单日期", key: "orderAt" },
      { title: "退货人", key: "operatedBy" },
      { 
        title: "出库状态", 
        key: "returnStatus",
        render: (h, { row }) => {
          return h("span", getLabel(row.returnStatus, returnStatus));
        }
      },
      { 
        title: "退款状态", 
        key: "refundStatus",
        render: (h, { row }) => {
          return h("span", getLabel(row.refundStatus, refundStatus));
        }
      },
      { 
        title: "操作",
        width,
        render: (h, { row }) => {
          const btn1 = this.getElement(h, "编辑", () => {
            this.$router.push("/inventory/purchase/refund/add/" + row.returnFormId);
          });
          const btn2 = this.getElement(h, "出库", () => {
            this.dialogData.title = "确认出库";
            this.dialogData.content = "出库后，退货单信息将无法编辑，确认出库吗？";
            this.dialogData.cancel = true;
            this.dialogData.id = row.returnFormId;
            this.dialogData.callback = this.refundConfirm;
            this.$refs.remindDialog.openModal();
          });
          const btn3 = this.getElement(h, "作废", () => {
            this.dialogData.title = "作废退货单";
            this.dialogData.content = "退货单作废后将不能恢复，确定作废退货单吗？";
            this.dialogData.cancel = true;
            this.dialogData.id = row.returnFormId;
            this.dialogData.callback = this.cancelForm;
            this.$refs.remindDialog.openModal();
          });
          const btn4 = this.getElement(h, "查看", () => {
            this.$router.push("/inventory/purchase/refund/detail/" + row.returnFormId + `?shareStoreId=${this.shareStoreId}`);
          });
          const btn5 = this.getElement(h, "退款", () => {
            this.$router.push("/inventory/purchase/refund/pay/" + row.returnFormId);
          });
          const btn6 = this.getElement(h, "打印", () => {
            this.$refs.print.openPrint(row.returnFormId, this.shareStoreId);
          });
          
          let elms = [];
          if (row.returnStatus === "1") {
            if( that.isSelfStore ){
              if (permissionData.update) elms.push(btn1);
              if (permissionData.output) elms.push(btn2);
              if (permissionData.delete) elms.push(btn3);
            }
          } else if (row.returnStatus === "2" && row.refundStatus === "1") {
            if (permissionData.check) elms.push(btn4);
            if( that.isSelfStore ){
              if (permissionData.refund) elms.push(btn5);
            }
          } else if (row.refundStatus === "2") {
            if (permissionData.check) elms.push(btn4);
          }

          if (permissionData.print) elms.push(btn6);
          return elms;
        }
      }
    ];
    if (n == 0) columns.pop();
    return {
      permissionData,
      loading: false,
      staffList: [],
      dialogData: {
        title: "",
        content: "",
        cancel: true,
        callback: null
      },
      defaultParams: {
        supplierName: "",
        operatorId: ""
      }, 
      params: {},
      inputData: [
        { type: "text", key: "returnFormCode", label: "单号", holder: "请输入退货单号" },
        { 
          label: "供应商",
          slot: "supplier"
        },
        { 
          label: "退货人",
          slot: "staff",
          key: "operatorId"
        },
        { 
          type: "select", 
          key: "returnStatus", 
          label: "出库状态", 
          clearable: true,
          data: returnStatus.slice(0, 2)
        },
        { 
          type: "select", 
          key: "refundStatus", 
          label: "退款状态", 
          clearable: true,
          data: refundStatus
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
    // 获取员工数据
    async getStaffList () {
      try {
        const res = await this.$store.dispatch({
          type: "actionGet",
          name: "staffList"
        });

        if (res.code === "0") {
          this.staffList = res.data.rows;
        }
      } catch (error) {
        
      }
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

    supplierChange (str) {
      this.defaultParams.supplierName = str;
    },

    supplierSelect (data) {
      this.defaultParams.supplierName = data.supplierName;
    },

    remindOk () {
      this.dialogData.callback();
    },
    // 确认出库
    async refundConfirm () {
      try {
        const res = await this.$store.dispatch({
          type: "actionPost",
          name: "refundConfirm",
          params: {
            returnFormId: this.dialogData.id
          }
        });

        if (res.code === "0") {
          this.$Message.success("出库成功");
          this.$refs.table.reset();
          this.$refs.remindDialog.onCancel();
        } else {
          this.$Message.warning("出库失败");
        }
      } catch (error) {
        this.$Message.warning("出库失败");
      }
    },
    // 作废退货单
    async cancelForm () {
      try {
        const res = await this.$store.dispatch({
          type: "actionPost",
          name: "refundCancel",
          params: {
            returnFormId: this.dialogData.id
          }
        });

        if (res.code === "0") {
          this.$Message.success("退货单已作废");
          this.$refs.table.reset();
          this.$refs.remindDialog.onCancel();
        } else {
          this.$Message.warning("作废失败");
        }
      } catch (error) {
        this.$Message.warning("作废失败");
      }
    },

    // 按钮
    getElement (h, text, clickHandle) {
      return h("i-button", {
        props: {
          type: "text"
        },
        style: {
          marginRight: "5px"
        },
        on: {
          click: clickHandle || function () {}
        }
      }, text);
    }
  },
}
</script>
