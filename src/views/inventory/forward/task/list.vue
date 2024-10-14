<template>
  <!-- 采购任务列表 -->
  <saas-query-table
    ref="table"
    api="getStockInAndOutList"
    :query-show="queryShow" 
    :query-data="queryData"
    :columns="columns">
  </saas-query-table>
</template>

<script>
  import statementInputs from "@/commons/inputs/statement-input";             // 筛选列 -> 配件
  import purchaseInputs from "@/commons/inputs/purchase-input";               // 筛选列 -> 采购单

  import commonColumns from "@/commons/columns/common-column";                // 表格的列 -> 公共 
  import orderColumns from "@/commons/columns/order-column";                  // 表格的列 -> 工单 
  import customerColumns from "@/commons/columns/customer-column";            // 表格的列 -> 客户 
  import vehicleColumns from "@/commons/columns/vehicle-column";              // 表格的列 -> 车辆 
  import purchaseColumns from "@/commons/columns/purchase-column";            // 表格的列 -> 采购单 

  export default {
    props: {
      queryShow: {
        type: Boolean,
        default: false
      }
    },
    data () {
      let permissionData = this.$permission.data.inventoryForwardTask;
      let columns = [
        commonColumns.index(),                                              // 序号
        orderColumns.statementNo(),                                         // 工单号
        vehicleColumns.plateNo({ border: false }),                          // 车牌号
        customerColumns.vehicleOwner({ title: "客户" }),                    // 客户姓名
        customerColumns.ownerMobile(),                                      // 联系方式
        purchaseColumns.orderAt(),                                          // 开单日期
        purchaseColumns.status(),                                           // 采购状态
      ];

      // 操作权限
      if (permissionData.resolve) {
        columns.push({
          title: "操作",
          width: 100,
          fixed: "right",
          render: (h, { row }) => {
            return h("div", row.status === "1" ? [
              h("Button", {
                props: {
                  type: "text",
                  to: "/inventory/forward/decompose/" + row.statementNo
                }
              }, "分解任务")
            ] : [
              h("Button", {
                props: {
                  type: "text",
                  to: "/inventory/forward/taskDetail/" + row.statementNo
                }
              }, "查看")
            ])
          }
        });
      }
      return {
        permissionData,
        queryData: [
          statementInputs.filter(),                 // 搜索工单
          statementInputs.orderAtFrom(),            // 工单开单时间开始时间
          statementInputs.orderAtTo(),              // 工单开单时间结束时间
          purchaseInputs.purchaseStatus(),          // 采购状态
        ],
        columns
      }
    },
    methods: {
      
      tableInit(){
        this.$refs.table.init()
      }
    },
  }
</script>
