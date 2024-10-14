<template>
  <!-- 保险提醒 -->
  <div class="relative mt-20 white-bg">
    <div class="pt-20 pl-20 pr-20">
      <saas-search-input v-model="params.name" placeholder="输入客户名称 / 联系电话" @on-search="onTableSearch"></saas-search-input>
    </div>
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
  </div>
</template>

<script>
  import commonColumns from "@/commons/columns/common-column";            // 表格的列 -> 公共 
  import customerColumns from "@/commons/columns/customer-column";        // 表格的列 -> 客户
  import remindColumns from "@/commons/columns/remind-column";            // 表格的列 -> 客户提醒
  import vehicleColumns from "@/commons/columns/vehicle-column";          // 表格的列 -> 车辆

  import mixins from "./minix";
  export default {
    mixins: [mixins],
    data () {
      let status = 1; // 提醒类型：{ 0: 生日提醒, 1: 保险提醒, 2: 年检提醒, 3: 保养提醒, 4: 回访提醒 }
      //    提醒权限         车辆权限
      let { customerRemind, customerVehicle } = this.$permission.data;
      let columns = [
        commonColumns.index(),                                 // 序号
        customerColumns.name(),                                // 客户姓名
        customerColumns.mobile(),                              // 手机号码
        vehicleColumns.plateNo(),                              // 车牌号码
        vehicleColumns.vehicleStyle(),                         // 详细车型
        vehicleColumns.insuranceExpire(),                      // 保险到期日期
        remindColumns.distanceDays({ sortable: "custom" }),    // 距离天数
      ];

      // 有操作权限就添加处理状态
      if (customerRemind.operation) {
        columns.push(
          remindColumns.remindStatus({
            update: this.update,
            status,
            statusKey: "insurance"
          })
        );
      }
      // 有查看权限就添加查看按钮
      if (customerVehicle.check) {
        columns.push({
          title: "操作",
          width: 80,
          fixed: "right",
          render: (h, { row }) => {
            return h("Button", {
              props: {
                type: 'text',
                to: "/customer/car/detail/" + row.vehicleId
              }
            }, "查看");
          }
        });
      }

      return {
        columns,
        params: {
          name: "",
          status
        },
      }
    }
  }
</script>
