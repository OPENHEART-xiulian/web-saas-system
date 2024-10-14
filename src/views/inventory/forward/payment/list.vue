<template>
  <!-- 付款管理列表 -->
  <div>
    <saas-query-table
      ref="table"
      api="getPurchasePutList"
      :query-show="queryShow" 
      :query-data="queryData"
      :columns="columns"
      :default-params="{
        purchaseType: '1',
        purchaseStatus: '2'
      }">
    </saas-query-table>
    
    <print ref="print"></print>
    <remind-dialog
      ref="remindDialog"
      :show-cancel="dialogData.cancel"
      :title="dialogData.title"
      :content="dialogData.content"
      @on-ok="purchaseCredit"
    />
  </div>
</template>

<script>
  import statementInputs from "@/commons/inputs/statement-input";             // 筛选列 -> 工单
  import purchaseInputs from "@/commons/inputs/purchase-input";               // 筛选列 -> 采购单

  import commonColumns from "@/commons/columns/common-column";                // 表格的列 -> 公共 
  import orderColumns from "@/commons/columns/order-column";                  // 表格的列 -> 工单 
  import purchaseColumns from "@/commons/columns/purchase-column";            // 表格的列 -> 采购单 
  import supplierColumns from "@/commons/columns/supplier-column";            // 表格的列 -> 供应商 

  import Print from "./print";
  import RemindDialog from "@/components/dialog/remind-dialog"

  export default {
    components: { Print, RemindDialog },
    props: {
      queryShow: {
        type: Boolean,
        default: false
      }
    },
    data () {
      let { check, payment, print } = this.$permission.data.inventoryForwardManage;
      let columns = [
        commonColumns.index(),            // 序号
        purchaseColumns.purchaseCode(),   // 采购单号
        orderColumns.statementNo(),       // 工单号
        supplierColumns.supplierName(),   // 供应商名称
        purchaseColumns.totalQuantity(),  // 采购数量
        purchaseColumns.totalCost(),      // 采购金额
        purchaseColumns.purchaseAt(),     // 采购时间
        purchaseColumns.operatedBy(),     // 采购人
        purchaseColumns.settleStatus(),   // 采购状态
      ];
      
      if (check || payment || print) {
        columns.push({
          title: "操作",
          width: 200,
          fixed: "right",
          render: (h, { row }) => {
            let elms = [];
            if (check) {
              elms.push(h("Button", {
                props: { 
                  type: "text",
                  to: "/inventory/forward/detail/" + row.purchaseId
                },
              }, "查看"));
            }

            if (row.settleStatus !== "2" && payment) {
              if (elms.length) elms.push(h("span", " | "));
              elms.push(h("Button", {
                props: { 
                  type: "text",
                  to: "/inventory/forward/pay/" + row.purchaseId
                },
              }, "付款"));
              if (row.settleStatus !== "3") {
                elms.push(h("span", " | "));
                elms.push(h("Button", {
                  props: { type: "text" },
                  on: {
                    click: () => this.openCreditModal(row)
                  }
                }, "挂账"));
              }
            }

            if (print) {
              if (elms.length) elms.push(h("span", " | "));
              elms.push(h("Button", {
                props: { type: "text" },
                on: {
                  click: () => {
                    this.$refs.print.openPrint(row.purchaseId);
                  }
                }
              }, "打印"));
            }
            return elms;
          }
        });
      }
      return {
        dialogData: {
          // 弹窗所需要的参数
          statementNo: "", // 结算单号 跳转页面需要的参数
          type: 0,
          title: "",
          content: "",
          cancel: true
        },
        queryData: [],
        columns,
        supplierList: [], // 供应商列表
        staffList: [],    // 员工列表
      }
    },

    created () {
      this.init();
    },

    methods: {
      async init () {
        await this.getSupplierList();
        await this.getStaffList();
        this.queryData = [
          purchaseInputs.purchaseCode(),                          // 采购单号
          statementInputs.statementNo(),                          // 工单号
          purchaseInputs.supplierId({ data: this.supplierList }), // 供应商id
          purchaseInputs.operatorId({ data: this.staffList }),    // 采购人id
          purchaseInputs.settleStatus(),                          // 采购状态
          purchaseInputs.purchaseAtFrom(),                        // 采购时间开始时间
          purchaseInputs.purchaseAtTo(),                          // 采购时间结束时间
        ];
      },

      // 获取供应商列表
      async getSupplierList () {
        try {
          let data = await this.$ajax.getSupplierList();
          this.supplierList = data.rows.map(elm => ({ label: elm.supplierName, value: elm.supplierId }));
        } catch (error) {
          console.log(error);
        }
      },

      // 获取员工列表
      async getStaffList () {
        try {
          let data = await this.$ajax.getStaffList();
          this.staffList = data.rows.map(elm => ({ label: elm.username, value: elm.userId }));
        } catch (error) {
          console.log(error);
        }
      },

      // 打开挂账提示
      openCreditModal (data) {
        // 金额小于等于0不能挂账
        if (data.totalCost <= 0) {
          this.dialogData.title = "该工单金额为0，不能挂账。";
          this.dialogData.content = "";
          this.dialogData.purchaseId = "";
          this.$refs.remindDialog.openModal()
          return
        }
        this.dialogData.title = "工单挂账";
        this.dialogData.content = "该工单确定挂账？"
        this.dialogData.purchaseId = data.purchaseId;
        this.$refs.remindDialog.openModal();
      },
      
      // 挂账
      async purchaseCredit () {
        this.$refs.remindDialog.onCancel();
        // 没有id不能挂账
        if (!this.dialogData.purchaseId) return;
        try {
          let res = await this.$ajax.purchaseCredit({ purchaseId: this.dialogData.purchaseId });
          this.$Message.success({
            content: "挂账成功",
            onClose: this.$refs.table.init
          });
        } catch (error) {
          console.log(error);
          this.$Message.error("挂账失败");
        }
      }
    }
  }
</script>
