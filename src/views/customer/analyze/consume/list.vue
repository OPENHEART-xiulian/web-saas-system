<template>
  <!-- 消费能力分析 -->
  <div class="customer-analyze">
    <saas-bread title="消费能力分析"></saas-bread>
    <w-tab :tab-index="tabIndex" @tab-change="onTabChange" :tabList="tabList" style="margin-bottom: 20px"></w-tab>
    <div class="customer-analyze__box customer-analyze__chart">
      <div class="customer-analyze__head">
        <span class="customer-analyze__label">消费金额分布图</span>
        <btn-group
          class="customer-analyze__group"
          :chartBtns="groupBtnList"
          :curKey="formData.p"
          :renewBtn="onGroupChange">
        </btn-group>
        <DatePicker 
          class="customer-analyze__picker"
          v-model="formData.dateFrom"
          type="date"
          placeholder="开始时间"
          @on-change="onDateChange">
        </DatePicker>
        <span class="date-line">—</span>
        <DatePicker 
          class="customer-analyze__picker"
          v-model="formData.dateTo"
          type="date"
          placeholder="结束时间"
          @on-change="onDateChange">
        </DatePicker>
      </div>
      
      <div style="position: relative;">
        <chart :options="options" style="width: 100%; height: 316px;" :auto-resize="true"></chart>
        <Spin fix v-if="loading"></Spin>
      </div>
    </div>
    <!-- 表格部分 -->
    <div class="customer-analyze__box customer-analyze__table">
      <div class="customer-analyze__head">
        <span class="customer-analyze__label">消费金额分布明细</span>
      </div>
      <w-table
        ref="table"
        request="customerAnalyzeConsume"
        :columns="columns"
        :tableData="tableData"
        @format-form="formatData">
      </w-table>
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
      groupBtnList: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' }
      ],
      
      // 请求参数
      formData: {
        customerType: 'all',
        dateFrom: '',
        dateTo: '',
        p: 'today'
      },

      columns: [
        { title: '消费金额区间', key: 'interval' },
        { title: '客户数', key: 'customerAmount' },
        { title: '客户数占比', key: 'customerAmountRatio' },
        { title: '支付工单数', key: 'orderAmount' },
        { title: '消费总额', key: 'totalCost' },
        { title: '消费总额占比', key: 'totalCostRatio' },
        { 
          title: '操作', 
          width: 120,
          render: (h, {row, column, index}) => {
            return h('span', {
              class: 'customer-analyze__btn',
              on: {
                click: () => {
                  let data = row.interval.split('-');
                  let str = '?';
                  str += '&costFrom=' + (data[0] ? data[0].replace(/[^0-9]/ig, "") : '');
                  str += '&costTo=' + (data[1] ? data[1].replace(/[^0-9]/ig, "") : '');
                  str += '&p=' + this.formData.p;
                  str += '&dateFrom=' + (formatTime(this.formData.dateFrom, 'yyyy-MM-dd') || '');
                  str += '&dateTo=' + (formatTime(this.formData.dateTo, 'yyyy-MM-dd') || '');
                  this.$router.push('/customer/analyze/consume/detail' + str);
                }
              }
            }, '查看详情');
          }
        },
      ],
      tableData: [],
      options: {}
    }
  },

  watch: {
    allTableData (to) {
      if (to.rows) {
        this.tableData = to.rows;
      } else {
        this.tableData = to.table;
        this.setChartOptions(to.line);
      }
    }
  },
  
  computed: {
    ...mapGetters({
      allTableData: 'getAllTableData',
    }),

    ...mapState({ 
      loading: (state) => state.global.isLoading
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
    onGroupChange (v) {
      this.formData.p = v;
      this.formData.dateFrom = '';
      this.formData.dateTo = '';
      this.search();
    },

    /**
     * @description 日期组件数据改变的时候，清除表格单选组的数据
     */
    onDateChange () {
      this.formData.p = '';
      this.search();
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
      formData.p = this.formData.p;
      formData.dateFrom = formatTime(this.formData.dateFrom, 'yyyy-MM-dd');
      formData.dateTo = formatTime(this.formData.dateTo, 'yyyy-MM-dd');
    },

    /**
     * @description 设置图表数据
     * @param { string } data 指标类型 "customerAmount": 客户数，"orderAmount": 工单数，"totalCost": 消费总额
     */
    setChartOptions (data) {
      let newAxis = [];
      let newCustomerAmountAxis = [];
      while (data.customerAmountAxis.length > 0) {
        newCustomerAmountAxis.push(data.customerAmountAxis.pop());
      }
      while (data.consumeAxis.length > 0) {
        newAxis.push(data.consumeAxis.pop());
      }
      data.customerAmountAxis = newCustomerAmountAxis;
      data.consumeAxis = newAxis;
      this.options = {
        color: ['#FF9313'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
              type: 'shadow'
          },
          formatter: "{b} <br> 客户数: {c}"
        },
        grid: {
          left: 40,
          right: 40,
          bottom: 0,
          top: 0,
          containLabel: true
        },
        xAxis: {
          type: 'value',
          min: 0,
          max: 100,
          interval: 20,
          axisLabel: {
            formatter: '{value}',
            textStyle: {
              color: "#545454"
            }
          },
          axisLine: {
            show: false
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
        },
        yAxis: {
          type: 'category',
          data: data.consumeAxis,
          boundaryGap: true,
          axisLabel: {
            show: true,
            textStyle: {
              color: "#545454"
            }
          },
          axisLine: {
            lineStyle: {
              color: "#CECECE"
            }
          },
          axisTick: {
            alignWithLabel: true,
          }
        },          
        series: [
          {
            type: 'bar',
            barWidth: 37,
            data: data.customerAmountAxis
          }
        ]
      }
    }
  },

  components: { BtnGroup }
}
</script>

<style lang="less">
  .customer-analyze {
    &__box {
      padding: 0 20px;
      background: white;
    }

    &__chart {
      padding-bottom: 60px!important;
    }

    &__table {
      padding-bottom: 20px!important;
      .w-table {
        box-shadow: none;
        padding: 0;
      }
    }

    &__head {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-bottom: 1px solid #E5E2DF;
      margin-bottom: 20px;
    }

    &__label {
      flex-grow: 1;
      width:98px;
      height:20px;
      font-size:14px;
      font-weight:500;
      color:rgba(58,52,46,1);
      line-height:20px;
    }

    &__group {
      margin-right: 20px;
    }

    &__picker {
      width: 200px;
    }

    &__btn {
      cursor: pointer;
      font-size:14px;
      font-weight:400;
      color:rgba(255,128,0,1);
      line-height:14px;
    }

    .date-line {
      margin: 0 10px;
      width: 15px;
      color: #BFBAB5;
    }
  }
</style>
