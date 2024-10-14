<template>
  <!-- 成交客户概述 -->
  <div class="customer-analyze">
    <saas-bread title="成交客户概述"></saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="onTabChange" :tabList="tabList" style="margin-bottom: 20px"></w-tab>
    <div class="analyze-table">
      <div class="analyze-table__head">
        <btn-group
          class="analyze-table__group"
          :chartBtns="tableBtnList"
          :curKey="formData.tableBtnValue"
          :renewBtn="onTableGroupChange">
        </btn-group>
        <DatePicker 
          class="analyze-table__picker"
          v-model="formData.dateFrom"
          type="date"
          placeholder="开始时间"
          @on-change="onDateChange">
        </DatePicker>
        <span class="date-line">—</span>
        <DatePicker 
          class="analyze-table__picker"
          v-model="formData.dateTo"
          type="date"
          placeholder="结束时间"
          @on-change="onDateChange">
        </DatePicker>
      </div>
      <w-table
        ref="table"
        request="customerAnalyzeMake"
        :columns="columns"
        :tableData="tableData"
        @format-form="formatData">
      </w-table>
    </div>
    <div class="analyze-chart">
      <div class="analyze-chart__head">
        <span class="radio-label">趋势指标选择：</span>
        <i-radio-group class="radio-group" v-model="formData.chartRadioValue" @on-change="onChartRadioChange">
          <i-radio v-for="(item, index) in chartRadioList" :key="index" :label="item.value">{{item.name}}</i-radio>
        </i-radio-group>
        
        <btn-group
          class="analyze-chart__group"
          :chartBtns="chartBtnList"
          :curKey="formData.chartBtnValue"
          :renewBtn="onChartGroupChange">
        </btn-group>
      </div>
      <div style="position: relative;">
        <chart :options="options" style="width: 100%" :auto-resize="true">
        </chart>
        <Spin fix v-if="chartLoading"></Spin>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { formatTime } from '@/assets/js/utils';
import BtnGroup from '@/components/btn-group';

export default {
  data () {
    let tabList = this.$permission.getPermissionTab('customerAnalyzeList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    return {
      tabList,
      tabIndex,
      chartLoading: false,
      tableBtnList: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' }
      ],
      chartRadioList: [
        { name: '成交客户数', value: 'customerAmount' },
        { name: '支付工单数', value: 'orderAmount' },
        { name: '消费总额', value: 'totalCost' }
      ],
      chartBtnList: [
        { name: '周', value: 'week' },
        { name: '月', value: 'month' },
        { name: '季', value: 'season' }
      ],
      
      // 请求参数
      formData: {
        type: 'all',
        dateFrom: '',
        dateTo: '',
        tableBtnValue: 'today',
        chartBtnValue: 'week',
        chartRadioValue: 'customerAmount'
      },

      // 客户类型
      customerTypes: {
        all: '全部客户',
        new: '新客户',
        old: '老客户'
      },

      columns: [
        { 
          title: '客户类型', 
          key: 'customerType', 
          minWidth: 140,
          render: (h, { row, column }) => {
            return [this.customerTypes[row[column.key]]]
          }
        },
        { 
          title: '成交客户数', 
          key: 'customerAmount', 
          minWidth: 180,
          render: (h, { row, column }) => this.getTableColumnElm(h, row.customerAmount, row.customerAmountChange, row.customerAmountR)
        },
        { 
          title: '客户数占比', 
          key: 'customerAmountRatio', 
          minWidth: 140,
          render: (h, { row, column }) => this.getTableColumnElm(h, row.customerAmountRatio, row.customerAmountRatioChange, row.customerAmountRatioR, true) 
        },
        { 
          title: '支付工单数', 
          key: 'orderAmount', 
          minWidth: 180,
          render: (h, { row, column }) => this.getTableColumnElm(h, row.orderAmount, row.orderAmountChange, row.orderAmountR) 
        },
        { 
          title: '消费总额', 
          key: 'totalCost', 
          minWidth: 180,
          render: (h, { row, column }) => this.getTableColumnElm(h, row.totalCost, row.totalCostChange, row.totalCostR) 
        },
        { 
          title: '消费总额占比', 
          key: 'totalCostRatio', 
          minWidth: 140,
          render: (h, { row, column }) => this.getTableColumnElm(h, row.totalCostRatio, row.totalCostRatioChange, row.totalCostRatioR, true) 
        },
        { 
          title: '操作', 
          width: 100,
          render: (h, {row, column}) => {
            return h('span', {
              class: 'analyze-table__btn',
              on: {
                click: () => {
                  let str = '?type=' + row.customerType;
                  str += '&p=' + this.formData.tableBtnValue;
                  str += '&dateFrom=' + (formatTime(this.formData.dateFrom, 'yyyy-MM-dd') || '');
                  str += '&dateTo=' + (formatTime(this.formData.dateTo, 'yyyy-MM-dd') || '');
                  this.$router.push('/customer/analyze/make/detail' + str);
                }
              }
            }, '查看详情');
          }
        },
      ],

      // 分析指标数据
      chartTargetData: {
        customerAmount: [], // 客户数
        orderAmount: [], // 工单数
        totalCost: [], // 消费总额
      },

      tableData: [],
      options: {}
    }
  },

  mounted () {
    this.getChartData();
  },

  watch: {
    allTableData (to) {
      if (to.rows) {
        this.tableData = to.rows;
      } else {
        this.tableData = to;
      }
    }
  },
  
  computed: {
    ...mapGetters({
      allTableData: 'getAllTableData',
    }),
  },

  methods: {
    /**
     * @description tab切换
     * @param { number } index tab下标
     */
    onTabChange (index) {
      let tabItem = this.tabList[index];
      this.$router.push(tabItem.path);
    },

    /**
     * @description 表格单选组改变的时候，清除日期选择的数据
     */
    onTableGroupChange (v) {
      this.formData.tableBtnValue = v;
      this.formData.dateFrom = '';
      this.formData.dateTo = '';
      this.search();
    },

    /**
     * @description 日期组件数据改变的时候，清除表格单选组的数据
     */
    onDateChange () {
      this.formData.tableBtnValue = '';
      this.search();
    },

    /**
     * @description 图表单选组改变
     */
    onChartGroupChange (v) {
      this.formData.chartBtnValue = v;
      this.getChartData();
    },

    onChartRadioChange (v) {
      this.setChartOptions(v);
    },
    
    /**
     * @description 查询数据
     */
    search () {
      this.$refs.table.init();
    },

    /**
     * @description 设置表格组件请求参数
     * @param { object } formData 表格组件参数对象，不能修改指向
     */
    formatData (formData) {
      formData.type = this.formData.type;
      formData.p = this.formData.tableBtnValue;
      formData.dateFrom = formatTime(this.formData.dateFrom, 'yyyy-MM-dd');
      formData.dateTo = formatTime(this.formData.dateTo, 'yyyy-MM-dd');
    },

    /**
     * @description 获取表格列的元素
     * @param { function } h 渲染函数
     * @param { string, number } value 变化前数值
     * @param { string, number } change 变化了多少
     * @param { boolean } lifting 上升还是下降 1：上升 0：不变 -1：下降
     * @returns { array } 元素数组
     */
    getTableColumnElm (h, value, change, lifting, hideChange) {
      let elms = [h('span', { class: 'analyze-table__value' }, value)];
      if (!hideChange) elms.push(h('span', { class: 'analyze-table__change ' + (lifting === 1 ? 'analyze-table__up' : lifting === -1 ? 'analyze-table__down' : '') }, change))
      return elms;
    },
      
    /**
     * @description 获取折线图数据
     */
    async getChartData () {
      this.chartLoading = true;
      try {
        let res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'customerAnalyzeMakeLine',
          params: {
            by: this.formData.chartBtnValue
          }
        });
        if (res.code === '0') {
          res.data.forEach(elm => {
            this.chartTargetData[elm.metrics] = {
              dateAxis: elm.dateAxis,
              newCustomerAxis: elm.newCustomerAxis,
              oldCustomerAxis: elm.oldCustomerAxis
            }
          });
          this.onChartRadioChange(this.formData.chartRadioValue);
        }
        this.chartLoading = false;
      } catch (error) {
        this.chartLoading = false;
        console.dir(error);
      }
    },

    /**
     * @description 设置图表数据
     * @param { string } mertrics 指标类型 "customerAmount": 客户数，"orderAmount": 工单数，"totalCost": 消费总额
     */
    setChartOptions (metrics) {
      let data = this.chartTargetData[metrics]; // 拿到对应的图表数据
      this.options = {
        backgroundColor: '#ffffff',
        tooltip: {
          trigger: "axis"
        },
        grid: { 
          right: 60, 
          top: 10, 
          left: 60,
          containLabel: true
        },
        legend: {
          itemWidth: 12,
          itemHeight: 2,
          itemGap: 40,
          bottom: 0,
          width: "100%",
          textStyle: {
            fontSize: 14,
            color: "#666666"
          },
          data: [
            { name: "新客户", icon: "react" },
            { name: "老客户", icon: "react" },
          ]
        },
        xAxis: {
          type: "category",
          boundaryGap: true,
          axisLine: {
            lineStyle: {
              color: "#aaa"
            }
          },
          nameRotate: 45,
          axisTick: {
            alignWithLabel: true
          },
          axisLabel: {
            fontWeight: "normal",
            color: "#666666"
          },
          data: data.dateAxis
        },
        yAxis: {
          axisLine: {
            show: false,
            lineStyle: {
              color: "#aaa"
            }
          },
          axisLabel: {
            fontWeight: "normal",
            color: "#666666"
          },
          axisTick: {
            show: false
          },
          // 分割线
          splitLine: {
            lineStyle: {
              color: "#eeeeee",
              width: 1,
              type: "dashed"
            }
          },
          type: "value"
        },
        series: [
          {
            name: "新客户",
            type: "line",
            showAllSymbol: false,
            lineStyle: {
              color: "#2579D8"
            },
            itemStyle: {
              color: "#2579D8"
            },
            smooth: 0.2,
            data: data.newCustomerAxis
          },
          {
            name: "老客户",
            type: "line",
            lineStyle: {
              color: "#2FC25B"
            },
            itemStyle: {
              color: "#2FC25B"
            },
            smooth: 0.2,
            data: data.oldCustomerAxis
          },
        ]
      }
    }
  },

  components: { BtnGroup }
}
</script>

<style lang="less">
  .customer-analyze {
    .analyze-table {
      background: white;
      margin-bottom: 20px;
      &__head {
        padding: 20px;
        text-align: right;
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }
      &__group {
        margin-right: 20px;
      }
      &__picker {
        width: 200px;
      }
      &__value, &__change {
        position: relative;
        display: inline-block;
        width: 65px;
        height:14px;
        font-size:14px;
        font-weight:400;
        color:rgba(128,125,124,1);
        line-height:14px;
      }
      &__change {
        min-width: 80px;
        padding-left: 14px;
      }
      &__change::after {
        content: '';
        position: absolute;
        width: 8px;
        height:1px;
        background: rgba(153,153,153,1);
        border-radius: 1px;
        top: 6px;
        // right: -3px;
        left: 0;
        display: none;
      }
      &__up {
        color: #F22D00;
        &::after {
          display: block;
          top: 0px;
          // right: -4px;
          left: 0;
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-bottom-color: #F22D00;
          background: transparent;
        }
      }
      &__down {
        color: #50B566;
        &::after {
          display: block;
          top: 5px;
          right: -4px;
          width: 0;
          height: 0;
          border: 5px solid transparent;
          border-top-color: #50B566;
          background: transparent;
        }
      }

      &__btn {
        cursor: pointer;
        font-size:14px;
        font-weight:400;
        color:rgba(255,128,0,1);
        line-height:14px;
      }
    }

    .analyze-chart {
      background: white;
      padding-bottom: 20px;
      &__head {
        display: flex;
        align-items: center;
        padding: 20px;
        .radio-label {
          width: 100px;
          margin-right: 10px;
          color: #3A342E;
          font-size: 14px;
        }
        
        .radio-group {
          flex-grow: 1;
          .ivu-radio-wrapper {
            font-size: 14px;
            color: #3A342E;
            margin-right: 10px;
          }
        }

        .analyze-chart__group {
          .ivu-btn {
            width: 75px;
          }
        }
      }
    }

    .date-line {
      margin: 0 10px;
      width: 15px;
      color: #BFBAB5;
    }
  }
</style>
