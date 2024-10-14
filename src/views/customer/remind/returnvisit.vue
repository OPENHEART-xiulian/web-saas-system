<template>
  <!-- 回访提醒列表 -->
  <div class="relative mt-20 pt-20 white-bg">
    <div class="space-between pl-20 pr-20">
      <saas-search-input v-model="params.name" placeholder="输入客户名称 / 联系电话 / 车牌号搜索" @on-search="onTableSearch"></saas-search-input>
      <saas-toggle-btn v-model="queryShow" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </div>

    <!-- 筛选表单 -->
    <saas-query 
      v-show="queryShow" 
      ref="query"
      class="intable"
      query-class="column-3"
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery">
    </saas-query>

    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getCareRemindList"
      :auto="true"
      :columns="columns"  
      :params="params"
      :close-loading="true"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    <Spin size="large" fix v-if="loading"></Spin>
    
    <!-- 删除弹窗 -->
    <remind-dialog
      ref="removeDialog"
      title="删除记录"
      content="记录删除后无法恢复，确定继续吗？"
      @on-ok="deleteReturnVisit"/>

    <!-- 回访记录弹窗 -->
    <revisit-dialog ref="revisitDialog" @on-success="onTableSearch"/>
  </div>
</template>
<script>
  import remindInputs from "@/commons/inputs/remind-input";               // 筛选列 -> 客户提醒
  import statementInputs from "@/commons/inputs/statement-input";         // 筛选列 -> 工单

  import commonColumns from "@/commons/columns/common-column";            // 表格的列 -> 公共 
  import customerColumns from "@/commons/columns/customer-column";        // 表格的列 -> 客户
  import remindColumns from "@/commons/columns/remind-column";            // 表格的列 -> 客户提醒
  import vehicleColumns from "@/commons/columns/vehicle-column";          // 表格的列 -> 车辆
  import orderColumns from "@/commons/columns/order-column";              // 表格的列 -> 工单

  import { workType } from "@/store/json/default";
  import mixins from "./minix";

  import RemindDialog from "@/components/dialog/remind-dialog";
  import RevisitDialog from "@/components/dialog/revisit-dialog";
  export default {
    components: { RemindDialog, RevisitDialog },
    mixins: [mixins],
    data () {
      let status = 4; // 提醒类型：{ 0: 生日提醒, 1: 保险提醒, 2: 年检提醒, 3: 保养提醒, 4: 回访提醒 }
      //    提醒权限         维修工单    洗美工单         销售工单          退货工单
      let { customerRemind, workerList, workerCleanout, workerSparepart, workerSalereturn } = this.$permission.data;
      let columns = [
        commonColumns.index(),                   // 序号
        customerColumns.name(),                  // 客户姓名
        customerColumns.mobile(),                // 手机号码
        vehicleColumns.plateNo(),                // 车牌号码
        orderColumns.statementNo(),              // 工单号
        remindColumns.planReturnVisitAt(),       // 计划回访日期
        remindColumns.returnVisitAt(),           // 实际回访日期
        remindColumns.returnVisitStatus(),       // 回访状态
        remindColumns.returnVisitUserName(),     // 回访人
      ];
      
      columns.push({
        title: "操作",
        width: 198,
        fixed: "right",
        render: (h, { row }) => {
          let { orderType } = row;
          let item = workType.find(elm => elm.value === orderType);
          let pathType = item.pathType;
          let elms = [];
          
          // 已回访显示回访记录，未回访显示回访登记 row.status == 0回访登记 row.status == 1回访记录
          // 有创建权限且未登记的，可以看到回访登记；有查看权限且登记的，可以查看记录
          if ((customerRemind.create && row.status == 0) || (customerRemind.check && row.status == 1)) {
            elms.push(
              h("Button", {
                props: { type: "text" },
                on: {
                  click: () => this.returnRegister(row)
                },
                style: { marginRight: "10px" }
              }, row.status == 0 ? "回访登记" : "回访记录")
            );
          }

          // { value: '1', label: '维修工单', pathType: 'worker' },
          // { value: '2', label: '配件销售', pathType: 'sparepart' },
          // { value: '3', label: '洗美工单', pathType: 'cleanout' },
          // { value: '4', label: '退货工单', pathType: 'salereturn' }
          // 工单类型对应且有权限
          let hasCheck = (workerList.check && orderType == 1) || (workerCleanout.check && orderType == 3) || 
                          (workerSparepart.check && orderType == 2) || (workerSalereturn.check && orderType == 4);
          if (hasCheck) {
            elms.push(
              h("Button", {
                props: {
                  type: "text",
                  to: `/workorder/${pathType}/detail/${row.statementNo}`
                },
                style: { marginRight: "10px" }
              }, "查看工单")
            );
          }

          // 删除
          if (customerRemind.delete) {
            elms.push(
              h("Button", {
                props: { type: "text" },
                style: { marginRight: "10px" },
                on: {
                  click: () => {
                    this.removeId = row._id;
                    this.$refs.removeDialog.openModal();
                  }
                }
              }, "删除")
            );
          }

          return elms.length ? elms : ["--"];
        }
      });
      return {
        queryShow: false,
        defaultParams: {},
        params: {
          name: "",
          status
        },
        queryData: [],
        columns,
        removeId: "",         // 需要删除的id
        returnVisitUsers: [], // 回访人列表
      }
    },

    created () {
      this.getStaffList();
    },

    methods: {
      // 获取员工列表
      async getStaffList () {
        let data = await this.$ajax.getStaffList();
        let returnVisitUsers = data.rows.map(elm => ({ label: elm.username, value: elm.userId }));
        this.returnVisitUsers = returnVisitUsers;
        // 设置筛选内容
        this.queryData = [
          statementInputs.statementNo(),                               // 工单号
          remindInputs.remindStatus(),                                 // 回访状态
          remindInputs.returnVisitUserId({ data: returnVisitUsers }),  // 回访人
          remindInputs.planReturnVisitAt(),                            // 计划回访时间
          remindInputs.returnVisitAt(),                                // 实际回访时间
        ];
      },

      /**
       * 查询数据
       * @params {object} params 返回筛选对象
       */
      onQuery (params) {
        let { status, name } = this.params;
        params.status = status;
        params.name = name;
        this.params = params;
        this.onTableSearch();
      },

      returnRegister (row) {
        this.$refs.revisitDialog.openModal(row, this.returnVisitUsers);
      },

      async deleteReturnVisit () {
        try {
          await this.$ajax.deleteReturnVisit({ _id: this.removeId });
          this.$Message.success("删除成功");
          this.$refs.removeDialog.onCancel();
          this.onTableSearch();
        } catch (error) {
          
        }
      }
    }
  }
</script>
