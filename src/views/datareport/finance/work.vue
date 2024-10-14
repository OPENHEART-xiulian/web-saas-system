<template>
  <!-- 工单报表 -->
  <div>
    <saas-bread title="工单报表">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
        <Dropdown trigger="click" @on-click="exportData">
          <Button type="error">
            导出
            <i class="iconfont icon-sanjiaoxing-xia"></i>
          </Button>
          <DropdownMenu slot="list">
            <!-- <DropdownItem name="pdf">PDF</DropdownItem> -->
            <DropdownItem name="csv">CSV</DropdownItem>
            <DropdownItem name="excel">Excel</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </template>
    </saas-bread>

    <!-- 筛选表单 -->
    <div class="workdata-query" >
      <div class="top">
        <btn-group
          :chartBtns="btns"
          :curKey="params.p"
          :renewBtn="renewBtn">
        </btn-group>
        <DatePicker 
          style="margin-left: 10px;"
          v-model="params.dateFrom"
          :class="{'active': params.dateFrom}"
          placeholder="开始时间"
          type="date"
          size="small"
          :clearable="false"
          @on-change="changeTimeFrom">
        </DatePicker>
        <DatePicker 
          style="margin-left: 10px;"
          v-model="params.dateTo"
          :class="{'active': params.dateTo}"
          placeholder="结束时间"
          type="date"
          size="small"
          :clearable="false"
          @on-change="changeTimeTo">
        </DatePicker>
        <saas-toggle-btn style="float:right;" v-model="queryShow" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
      </div>
      <saas-query 
        v-show="queryShow"  
        ref="query"
        class="bottom"
        :loading="loading"
        :data="queryData"
        @on-reset="onQueryReset"
        @on-query="onQuery">
      </saas-query>
    </div>
    <list-detail :loading="loading" :list="dataList"></list-detail>
    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getIncomeList"
      :auto="false"
      :columns="columns"  
      :params="params"
      :close-loading="false"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import commonColumns from "@/commons/columns/common-column";                // 表格的列 -> 公共 
import { workType,  getLabel, customerType } from '@/store/json/default';
import { INCOME_EXPORT } from '@/https/api';

import btnGroup from '@/components/btn-group';
import listDetail from '../list-detail';

export default {
  components: { btnGroup, listDetail },
  data () {
    let permissionData = this.$permission.data.worker;
    let columns = [
      commonColumns.index({ fixed: "left" }),
      { title: '工单号', key: 'statementNo',  width: 180 },
      { 
        title: '工单类型', 
        key: 'orderType',  
        width: 100,
        render: (h, { row }) => {
          return [getLabel(row.orderType, workType) || '--'];
        }
      },
      { 
        title: '车牌号', 
        key: 'plateNo',  
        width: 120,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      { 
        title: '客户姓名', 
        key: 'vehicleOwner',  
        width: 120,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      {
        title: '客户类型',
        width: 120,
        render: (h, { row }) => {
          return h('div', getLabel(row.customerType,customerType) || '--')
        }
      },
      // { 
      //   title: '联系人', 
      //   key: 'repairName',  
      //   width: 100,
      //   render: (h, { row, column }) => [row[column.key] || '--']
      // },
      { 
        title: '联系方式', 
        key: 'repairMobile',  
        width: 120,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      {
        title: "服务顾问",
        key: 'serviceAdvisor',
        width: 100,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      {
        title: "服务技师",
        key: 'technicians',
        width: 100,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      {
        title: "单据状态",
        key: 'invoiceStatus',  
        width: 100,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      {
        title: "结算状态",
        key: 'settleStatus',  
        width: 100
      },
      { title: '项目总额', key: 'totalItemCost',  width: 100 },
      { title: '配件总额', key: 'totalPartCost',  width: 100 },
      { title: '其他费用', key: 'totalOtherCost',  width: 100 },
      { title: '应收金额', key: 'receivable',  width: 100 },
      { title: '实收金额', key: 'realCost',  width: 100 },
      { title: '未收金额', key: 'leftReceivable',  width: 100 },
      // 未收金额、税费、整单优惠、抹零、创建时间、收款时间；
      // { 
      //   title: '挂账应收', 
      //   key: 'creditReceivable',  
      //   width: 100,
      //   render: (h, { row, column }) => [row[column.key] || '--']
      // },
      // { 
      //   title: '挂账实收', 
      //   key: 'creditRealCost',  
      //   width: 100,
      //   render: (h, { row, column }) => [row[column.key] || '--']
      // },
      { title: '税费', key: 'tax',  width: 100 },
      { title: '整单优惠', key: 'discountCost',  width: 100 },
      { title: '抹零', key: 'smallChange',  width: 100 },
      // { title: '配件成本', key: 'totalPartPurchase',  width: 100 },
      // { title: '毛利', key: 'profit',  width: 100 },
      { 
        title: '创建时间', 
        key: 'createdAt',  
        width: 170 
      },
      { 
        title: '收款时间', 
        key: 'settlementDate',  
        width: 170,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      { 
        title: '施工完成时间', 
        key: 'finishDate',  
        width: 170,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      { 
        title: '挂账时间', 
        key: 'creditDate',  
        width: 170,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      { 
        title: '出厂时间', 
        key: 'factoryDate',  
        width: 170,
        render: (h, { row, column }) => [row[column.key] || '--']
      },
      { 
        title: '操作',
        width: 90,
        fixed: 'right',
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: { type: 'text' },
              on: {
                'click': () => {
                  const orderType = {
                    "1": "worker",
                    "2": "sparepart",
                    "3": "cleanout",
                  }
                  this.$router.push({ 
                    path: `/workorder/${orderType[row.orderType]}/detail/${row.statementNo}`
                  });
                }
              }
            }, '查看工单')
          ])
        }
      }
    ];
    if (!permissionData.admin) columns.pop();
    let subStoreId = this.$route.query.subStoreId;
    return {
      loading: false,
      queryShow: true,
      queryData: [
        { 
          type: "select", 
          key: "orderType", 
          label: "工单类型", 
          holder: "请选择工单类型",
          data: [
            { label: "维修工单", value: "1" },
            { label: "洗美工单", value: "3" },
            { label: "销售工单", value: "2" },
          ]
        },
        {
          type: "select",
          key: "orderStatus",
          label: "单据状态",
          holder: "请选择单据状态",
          multiple: true,
          data: [
            { 
              label: "待施工", 
              value: 1
            },
            { 
              label: "待结算", 
              value: 2
            },
            { 
              label: "待出厂", 
              value: 3
            },
            { 
              label: "已挂账", 
              value: 4
            },
            { 
              label: "已完成", 
              value: 5
            }
          ]
        },
        {
          type: "select",
          key: "settleStatus",
          label: "结算状态",
          holder: "请选择结算状态",
          data: [            // 工单类型：维修工单，洗美工单，销售工单；
            // 结算状态：未结算、已结算、挂账；
            //  “未结算”的状态有——待施工、待结算
            //  “已结算”的状态有——待出厂(结算)、已完成
            //  “挂账”的状态有——待出厂(挂账)、已挂账
            // 单据状态：待施工、待结算、待出厂、已挂账、已完成；
            // workStatus 施工进度  '0'- 取消 1'-待施工  '2'- 已施工(未出厂) '3'-已出厂
            // payStatus 结算状态  1'-待结算  '2'- 已结算 '3'-已挂账
            { 
              label: "未结算", 
              value: 1
            },
            { 
              label: "已结算", 
              value: 2
            },
            { 
              label: "挂账", 
              value: 3
            },
          ]
        },
        {
          type: "select",
          key: "customerType",
          label: "客户类型",
          holder: "请选择客户类型",
          data: customerType
        },
        {
          type: "text",
          key: "vehicleOwner",
          label: "客户姓名",
          holder: "请输入客户姓名"
        }
      ],
      params: {
        p: 'today',
        dateFrom: '',
        dateTo: '',
        subStoreId
      },
      dataList: [
        { title: '工单数量', value: '0', unit: '单' },
        { title: '工单总额', value: '0', unit: '元' }
      ],
      btns: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' },
        { name: '最近30天', value: '30days' }
      ],
      columns
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getAllTableData'
    })
  },

  watch: {
    $route (to) {
      this.$destroy();
    }
  },

  methods: {

    onQueryReset () {
      this.params.dateFrom = "";
      this.params.dateTo = "";
      this.params.p = "today";
    },
    onQuery (params) {
      this.params.orderType = params.orderType;
      this.params.settleStatus = params.settleStatus;
      this.params.orderStatus = params.orderStatus;
      this.params.orderStatus = params.orderStatus;
      this.params.vehicleOwner = params.vehicleOwner;
      this.params.customerType = params.customerType
      this.$refs.table.reset();
    },

    onLoadingChange (loading) {
      this.loading = loading;
    },

    onTableSuccess (data) {
      this.dataList[0].value = data.total || 0;
      this.dataList[1].value = data.receivable || 0;
    },

    exportData (type) {
      const params = this.params;
      const url = `${INCOME_EXPORT}?token=${this.$storage.get("TOKEN")}&t=${type}`;
      let string = "";
      for (let i in params) {
        if (params[i]) {
          string += `&${i}=${params[i]}`;
        }
      }
      window.location.href = url + string;
    },

    renewBtn (curKey) {
      this.params.p = curKey;
      this.params.dateFrom = "";
      this.params.dateTo = "";
      this.$refs.table.init();
    },

    changeTimeFrom (value, oldvalue) {
      if (this.params.dateTo) {
        let fromTime = new Date(value).getTime();
        let toTime = new Date(this.params.dateTo).getTime();
        if (fromTime > toTime) {
          this.params.dateTo = value;
        }
      }
      if (this.params.dateFrom) {
        this.params.dateFrom = this.$moment(this.params.dateFrom).format("YYYY-MM-DD");
      }
      if (this.params.dateTo) {
        this.params.dateTo = this.$moment(this.params.dateTo).format("YYYY-MM-DD");
      }
      this.params.p = "";
    },

    changeTimeTo (value, oldvalue) {
      if (this.params.dateFrom) {
        let fromTime = new Date(this.params.dateFrom).getTime();
        let toTime = new Date(value).getTime();
        if (fromTime > toTime) {
          this.params.dateFrom = value;
        }
      }
      if (this.params.dateFrom) {
        this.params.dateFrom = this.$moment(this.params.dateFrom).format("YYYY-MM-DD");
      }
      if (this.params.dateTo) {
        this.params.dateTo = this.$moment(this.params.dateTo).format("YYYY-MM-DD");
      }
      this.params.p = "";
    },
  }
}
</script>

<style lang="less">
  .active {
    .ivu-input {
      border-color: #ff8700;
    }
  }
  .workdata-query {
    background: white;
    padding: 20px;
    .top {
      padding-bottom: 23px;
    }
    .bottom {
      box-shadow: none;
      padding: 0;
    }
  }
</style>
