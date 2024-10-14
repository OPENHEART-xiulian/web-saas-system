<template>
  <!-- 门店分析 -->
  <div class="analyse-list">
    <saas-bread title="门店分析">
      <template slot="actions">
        <div class="flex ac" v-if="this.$storage.get('STORE').isChainStore&&this.$storage.get('STORE').isMasterStore" >
          选择门店：
          <Select v-model="params.subStoreId" style="width: 200px" @on-change="storeAdminSelectChange">
            <Option v-for="(item, index) in storeAdminList" :key="index" :value="item._id">{{item.storeName}}</Option>
          </Select>
          <!--<saas-store-select v-model="vv"/>-->
        </div>
      </template>
    </saas-bread>
    <div class="analyse-top">
      <div class="search-item">
        <span class="search-item__name">{{storeItem.storeName}}</span>
        <btn-group
          :chartBtns="btns"
          :curKey="curKey"
          :renewBtn="renewBtn">
        </btn-group>
        <DatePicker type="date"
          v-model="params.dateFrom"
          placeholder="开始时间"
          :class="{'active': isDateFrom}"
          @on-change="changeTimeFrom">
        </DatePicker>
        <span class="date-line" style="margin: 0 10px;">—</span>
        <DatePicker type="date"
          v-model="params.dateTo"
          placeholder="结束时间"
          :class="{'active': isDateTo}"
          @on-change="changeTimeTo">
        </DatePicker>
      </div>
      <ul style="position: relative;">
        <li v-for="(item, index) in list" :key="index">
          <p>{{ item.title }}</p>
          <p>{{ item.value }}</p>
          <p>{{ item.unit }}</p>
        </li>
        <Spin fix v-if="loading"></Spin>
      </ul>
    </div>
    <div class="analyse-content" v-if="tabList.length">
      <w-tab ref="tab" 
        @tab-change="tabChangeSuccess"
        :tabList="tabList"></w-tab>
      <btn-group
        :chartBtns="incomebtns"
        :curKey="analyseCurKey"
        :renewBtn="analyseRenewBtn">
      </btn-group>
      <div style="position: relative;">
        <chart :options="options" :auto-resize="true"> </chart>
        <Spin fix v-if="trendLoading"></Spin>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import btnGroup from '@/components/btn-group';
import { formatTime, storage } from '@/assets/js/utils';
import '@/styles/views/datareport/analyse.less';

export default {
  data () {
    let tabList = this.$permission.getPermissionTab('dataAnalyseList');
    let request = '';
    if (tabList.length) request = tabList[0].request;
    return {
      subStoreId: '', // 门店id
      curKey: 'today',
      btnCur: 'today',
      analyseCurKey: 'month',
      isDateFrom: false,
      isDateTo: false,
      params: {
        p: 'today',
        subStoreId: ''
      },
      request,
      btns: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' }
      ],
      incomebtns: [
        { name: '月', value: 'month' },
        { name: '季', value: 'season' },
        { name: '半 年', value: 'halfyear' }
      ],
      tabList,
      storeList: [],
      storeItem: {}
    }
  },

  mounted () {
    this.$store.dispatch('actionStoreAdminList');
  },

  watch: {
    storeAdminList (to) {
      if (to.length > 0) {
        let userInfo = storage.get('USER');
        this.storeList = to;
        let data = to.find(elm => elm._id === userInfo.storeId);
        this.storeAdminSelectChange(data._id || to[0]._id);
      }
    }
  },
  
  computed: {
    ...mapGetters({
      cashOverview: 'getCashOverview',
      turnoverTrend: 'getStoreAnalyse',
      storeAdminList: 'getStoreAdminList'
    }),

    ...mapState({ 
      loading: (state) => state.global.isLoading,
      trendLoading: (state) => state.datareport.trendLoading,
    }),

    // 数据统计
    list () {
      const opt = [
        { 
          title: '营业总额', 
          value: 0, 
          unit: '元', 
          key: 'turnover' 
        },
        { 
          title: '支付订单数', 
          value: 0, 
          unit: '单', 
          key: 'paiedOrderCount' 
        },
        { 
          title: '利润', 
          value: 0, 
          unit: '元', 
          key: 'profit'
        },
        { 
          title: '工单总数', 
          value: 0, 
          unit: '单', 
          key: 'orderCount' 
        },
        { 
          title: '库存余额', 
          value: 0, 
          unit: '元', 
          key: 'componentBalance' 
        },
        { 
          title: '本期入库总额', 
          value: 0, 
          unit: '元', 
          key: 'totalStockin' 
        },
        { 
          title: '本期出库总额', 
          value: 0, 
          unit: '元', 
          key: 'totalStockout' 
        }
      ];

      if (this.cashOverview) {
        opt.forEach(item => {
          for (let i in this.cashOverview) {
            if (i === item.key) item.value = this.cashOverview[i];
          }
        })
      }

      return opt;
    },

    options () {
      const optData = {
        color: ['#FF8000', '#0CC9AD', '#00b7ff'],
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          left: '3%',
          top: '27',
          itemWidth: 12,
	        itemHeight: 12,
          data: []
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '10%',
          top: '18%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          axisLine: {
            lineStyle: {
              color: '#332E29'
            }
          },
          axisTick: {
            show: false
          },
          data: []
        },
        yAxis: {
          type: 'value',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false
          },
          splitLine: {
            lineStyle: {
              color: '#E5E2DF'
            }
          }
        }
      };

      if (this.turnoverTrend) {
        optData.xAxis.data = this.turnoverTrend.date;
        if (this.turnoverTrend.turnover) {
          optData.legend.data = ['营业金额', '成本金额'];
          optData.series = [
            {
              name: '营业金额',
              type: 'bar',
              data: this.turnoverTrend.turnover
            },
            {
              name: '成本金额',
              type: 'bar',
              data: this.turnoverTrend.cost
            }
          ]
        }
        
        if (this.turnoverTrend.count) {
          optData.legend.data = ['维修车次'];
          optData.series = [
            {
              name: '维修车次',
              type: 'bar',
              data: this.turnoverTrend.count
            }
          ]
        }

        if (this.turnoverTrend.profit) {
          optData.legend.data = ['配件利润'];
          optData.series = [
            {
              name: '配件利润',
              type: 'bar',
              data: this.turnoverTrend.profit
            }
          ]
        }

        if (this.turnoverTrend.repairPartIncome) {
          optData.legend.data = ["维修项目", "配件销售", "其他费用"];
          optData.series = [
            {
              name: optData.legend.data[0],
              type: 'bar',
              data: this.turnoverTrend.repairItemIncome
            },
            {
              name: optData.legend.data[1],
              type: 'bar',
              data: this.turnoverTrend.repairPartIncome
            },
            {
              name: optData.legend.data[2],
              type: 'bar',
              data: this.turnoverTrend.otherIncome
            }
          ]
        }
      }

      return optData;
    },

    typeOptions () {
      const opt = [
        { 
          title: '营业总额', 
          value: 0, 
          unit: '元', 
          key: 'turnover' 
        },
        { 
          title: '支付订单数', 
          value: 0, 
          unit: '单', 
          key: 'paiedOrderCount' 
        },
        { 
          title: '利润', 
          value: 0, 
          unit: '元', 
          key: 'profit'
        },
        { 
          title: '工单总数', 
          value: 0, 
          unit: '单', 
          key: 'orderCount' 
        },
        { 
          title: '库存余额', 
          value: 0, 
          unit: '元', 
          key: 'componentBalance' 
        },
        { 
          title: '本期入库总额', 
          value: 0, 
          unit: '元', 
          key: 'totalStockin' 
        },
        { 
          title: '本期出库总额', 
          value: 0, 
          unit: '元', 
          key: 'totalStockout' 
        }
      ];

      if (this.cashOverview) {
        opt.forEach(item => {
          for (let i in this.cashOverview) {
            if (i === item.key) item.value = this.cashOverview[i];
          }
        })
      }

      return opt;
    }
  },

  methods: {  
    storeAdminSelectChange (v) {
      this.params.subStoreId = v;
      let data = this.storeList.find(elm => elm._id === v);
      this.storeItem = data || this.storeList[0];
      this.getOverview();
      this.changeTurnover();
    },
    getOverview () {
      if (!this.params.dateFrom) delete this.params.dateFrom;
      if (!this.params.dateTo) delete this.params.dateTo;

      this.$store.dispatch({
        type: 'toGetCashOverview',
        params: this.params
      })
    },

    changeTurnover (by = 'month') {
      this.$store.dispatch({
        type: 'toGetStoreAnalyse',
        payload: {
          params: {
            subStoreId: this.params.subStoreId,
            by: by
          },
          request: this.request
        }
      })
    },

    renewBtn (index) {
      this.curKey = index;
      this.btnCur = index;
      this.params.p = index;
      this.params.dateFrom = '';
      this.params.dateTo = '';
      this.isDateFrom = false;
      this.isDateTo = false;
      this.getOverview();
    },

    analyseRenewBtn (index) {
      this.analyseCurKey = index;
      this.changeTurnover(index);
    },

    changeTimeFrom (value, oldvalue) {
      if (value) this.params.dateFrom = formatTime(this.params.dateFrom, 'yyyy-MM-dd');
      this.getOverviewSearch();
    },

    changeTimeTo (value, oldvalue) {
      if (value) this.params.dateTo = formatTime(this.params.dateTo, 'yyyy-MM-dd');
      this.getOverviewSearch();
    },

    getOverviewSearch () {
      if (this.params.dateFrom || this.params.dateTo) {
        delete this.params.p;
        this.curKey = '';
      } else {
        this.params.p = this.btnCur;
        this.curKey = this.btnCur;
      }

      // 日期是否选中状态
      if (this.params.dateFrom) {
        this.isDateFrom = true;
      } else {
        this.isDateFrom = false;
      }

      if (this.params.dateTo) {
        this.isDateTo = true;
      } else {
        this.isDateTo = false;
      }

      this.getOverview();
    },

    tabChangeSuccess (index, data) {
      this.analyseCurKey = 'month';
      this.request = data.request;
      this.changeTurnover();
    }
  },

  components: { btnGroup }
}
</script>
