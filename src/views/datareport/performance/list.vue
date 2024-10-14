<template>
  <!-- 员工产值 -->
  <div class="perf-list">
    <saas-bread title="员工产值">
      <template slot="actions">
        <div class="flex ac" v-if="this.$storage.get('STORE').isChainStore&&this.$storage.get('STORE').isMasterStore">
          选择门店：
          <Select v-model="formData.subStoreId" style="width: 200px" @on-change="storeAdminSelectChange">
            <Option v-for="(item, index) in storeAdminList" :key="index" :value="item._id">{{item.storeName}}</Option>
          </Select>
          <!--<saas-store-select v-model="vv"/>-->
        </div>
      </template>
    </saas-bread>
    <div class="perf-container">
      <h2 class="perf-container__title">{{storeItem.storeName}}</h2>
      <div class="perf-header">
        <i-select class="perf-header__item" v-model="formData.jobTitle" @on-change="search">
          <i-option v-for="(item, index) in roleList" :key="index" :value="item.name">{{item.name}}</i-option>
        </i-select>
        <RadioGroup class="perf-header__item" v-model="formData.range" type="button" @on-change="onRadioChange">
          <Radio v-for="(item, index) in rangeList" :key="index" :label="item.value">{{item.name}}</Radio>
        </RadioGroup>
        <div class="perf-header__item">
          <DatePicker v-model="formData.start" type="date" placeholder="开始时间" style="width: 140px" @on-change="onPickerChange"></DatePicker> -
          <DatePicker v-model="formData.end" type="date" placeholder="结束时间" style="width: 140px" @on-change="onPickerChange"></DatePicker>
        </div>
      </div>
      <w-table
        ref="table"
        request="staffOutputs"
        :auto-init="false"
        :columns="columns"
        :tableData="tableList"
        @format-form="searchFormat">
      </w-table>
    </div>
    <div class="perf-flex-wrap">
      <div class="perf-container">
        <div class="perf-header">
          <h4 class="title">员工产值占比</h4>
          <div class="right">
            <span>产值指标</span>
            <i-select class="perf-header__item" v-model="pieTarget" @on-change="initPie">
              <i-option v-for="(item, index) in targetList" :key="index" :value="item.value">{{item.name}}</i-option>
            </i-select>
          </div>
        </div>
        <div class="perf-content">
          <chart v-if="pieOption" class="chart" :options="pieOption" :auto-resize="true"></chart>
          <div v-else class="no-data">暂无员工产值占比</div>
        </div>
      </div>
      <div class="perf-container">
        <div class="perf-header">
          <h4 class="title">员工产值趋势图</h4>
          <div class="right">
            <span>产值指标</span>
            <i-select class="perf-header__item" v-model="lineTarget" @on-change="initLine">
              <i-option v-for="(item, index) in targetList" :key="index" :value="item.value">{{item.name}}</i-option>
            </i-select>
          </div>
        </div>
        <div class="perf-content">
          <chart v-if="lineOption" class="chart" :options="lineOption" :auto-resize="true"></chart>
          <div v-else class="no-data">暂无员工产值占比</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { formatTime, storage } from '@/assets/js/utils';

export default {
  data () {
    let permiss = this.$permission.data.dataPerformance;
    return {
      permiss,
      rangeList: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '本周', value: 'thisWeek' },
        { name: '本月', value: 'thisMonth' },
        { name: '全部', value: 'all' }
      ],

      roleList: [], // 岗位列表
      pieTarget: 'billAmount',
      lineTarget: 'billAmount',
      targetList: [
        { name: '开单数量', value: 'billAmount', title: '单' },
        { name: '项目数量', value: 'projectAmount', title: '项' },
        { name: '项目总额', value: 'projectMoney', title: '元' },
        { name: '销售工单数', value: 'saleBillAmount', title: '单' },
        { name: '销售总额', value: 'saleMoney', title: '元' }
      ],

      page: 1,
      formData: {
        start: '',
        end: '',
        range: 'today', // 查询范围  "today": 今天, "yesterday"，昨天, "thisWeek": 本周, "thisMonth": 本月, "all": 全部
        jobTitle: ''
      },

      columns: [
        { title: '序号', type: 'index', width: 65 },
        { title: '姓名', key: 'userName' },
        { 
          title: '职位名称', 
          key: 'jobTitle',
          render: (h, { row, column }) => {
            let user = storage.get('USER');
            let isRoot = user.isRoot && row.userId === user.userId;
            if (isRoot) return ['店长'];
            return [row[column.key] || '--']
          }
        },
        { title: '开单数量', key: 'billAmount', sortable: 'custom' },
        { title: '项目金额', key: 'projectMoney', sortable: 'custom' },
        { title: '销售工单数', key: 'saleBillAmount', sortable: 'custom' },
        { title: '销售金额', key: 'saleMoney', sortable: 'custom' },
        { 
          title: '操作', 
          width: 80,
          render: (h, {row}) => {
            if (!permiss.check) return ['--']
            return h('i-button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push('/datareport/performance/detail?id=' + row.userId + '&subStoreId=' + this.formData.subStoreId);
                }
              }
            }, '查看');
          } 
        },
      ],

      tableList: [],
      pieList: [],
      lineList: [],
      pieOption: null,
      lineOption: null,
      LineTitle: '单',
      storeList: [],
      storeItem: {}
    }
  },

  watch: {
    tableData (data) {
      if (data.rows) this.tableList = data.rows;
      // if (data.percentage) this.pieList = data.percentage;
      // if (data.trend) this.lineList = data.trend;
      // if (this.page === 1) {
      //   this.initPie(this.pieTarget);
      //   this.initLine(this.lineTarget);
      // }
    },
    storeAdminList (to) {
      if (to.length > 0) {
        this.storeList = to;
        let userInfo = storage.get('USER');
        let data = to.find(elm => elm._id === userInfo.storeId);
        this.storeAdminSelectChange(data._id || to[0]._id);
      }
    }
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getAllTableData',
      storeAdminList: 'getStoreAdminList'
    })
  },

  activated () {
    this.search();
  },

  mounted () {
    this.$store.dispatch('actionStoreAdminList');
  },

  methods: {
    storeAdminSelectChange (v) {
      this.formData.subStoreId = v;
      let data = this.storeList.find(elm => elm._id === v);
      this.storeItem = data || this.storeList[0];
      this.getRoleList();
      this.search();
    },
    // 初始化饼图
    initPie (target) {
      let list =  [];
      this.pieList.forEach(elm => {
        // let targetData = this.targetList.find(v => v.value === target);
        let obj =  {
          value: Number(elm[target]),
          name: elm.userName
        }
        if (obj.value) {
          list.push(obj);
        }
      });

      if (list.length === 0) {
        this.pieOption = null;
        return;
      }

      let allCount = 0; // 总数量
      let allPercent = 0;
      let count = 0;
      list.forEach(elm => ((allCount += elm.value)));
      list = list.map((elm, index) => {
        let percent = (elm.value / allCount) * 100;
        if (allCount === 0) percent = 0; 
        // if (index === list.length - 1) {
        //   percent  = 100 - allPercent;
        // }
        if (percent > 0) count++;
        allPercent += percent;
        elm.percent = percent.toFixed(2) + '%';
        elm.userName = elm.name;
        elm.name = elm.percent;
        return elm;
      });
      this.pieOption = this.getPieOptions(list, count);
    },

    // 获取饼图配置
    getPieOptions (list, count) {
      return {
        legend: {
          type: 'plain',
          bottom: 0,
          left: '10%',
          width: '100%',
          algin: 'left',
          formatter: (name) => {
            // 拿到员工姓名
            let data = list.find(v => v.name === name);
            return data.userName;
          }
        },
        tooltip: {
          trigger: 'item',
          // formatter: "{a}<br>名称：{b}<br>数值：{c}<br>占比：{d}%"
          formatter: "{c}"
        },
        series: [
          {
            name: '',
            type: 'pie',
            // selectedMode: 'single',
            label: {
              normal: { position: 'inner' }
            },
            itemStyle: count === 1 ? {} : { borderColor: 'white' },
            data: list
          }
        ]
      }
    },

    // 初始化折线图
    initLine (target) {
      this.LineTitle = this.targetList.find(item => item.value === target).title
      let xAxisData = [];
      let values = [];
      this.lineList.forEach(elm => {
        // let targetData = this.targetList.find(v => v.value === target);
        xAxisData.push(elm.axisX);
        values.push(Number(elm[target]));
      });
      if (values.length === 0) {
        this.lineOption = null;
        return;
      }
      this.lineOption = this.getLineOptions(xAxisData, values);
    },

    // 获取折线图配置
    getLineOptions (xAxisData, values) {
      return {
        title: {
          text: this.LineTitle,
        },
        backgroundColor: '#FFF',
        tooltip: {
          trigger: 'axis',
          label: {
            show: true
          }
        },
        xAxis: {
          boundaryGap: true, // 默认，坐标轴留白策略
          axisLine: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisTick: {
            show: false,
            alignWithLabel: true
          },
          data: xAxisData
        },
        yAxis: {
          axisLine: {
            show: false
          },
          splitLine: {
            show: true,
            lineStyle: {
              type: 'dashed',
              color: '#ddd'
            }
          },
          axisTick: {
            show: false
          },
          splitArea: {
            show: false
          }
        },
        series: [
          {
            type: 'line',
            // symbol: 'circle',
            symbolSize: 7,
            lineStyle: {
              color: '#ff8000',
              width: 1
            },
            itemStyle: {
              color: '#ff8800'
            },
            label: {
              show: false,
              distance: 1
            },
            data: values
          }
        ]
      }
    },

    // 获取岗位列表
    async getRoleList () {
      let res = await this.$store.dispatch({
        type: 'actionGet',
        name: 'staffJobTitles',
        params: {
          subStoreId: this.formData.subStoreId
        }
      });
      let list = res.data.result.rows;
      list.unshift({jobTitle: '全部职位', _id: 'all'})
      list = list.filter(elm => elm.jobTitle);
      this.roleList = list.map(elm => {
        return {
          name: elm.jobTitle,
          value: '',  // elm._id
        }
      });
      this.formData.jobTitle = '全部职位';
    },

    // 获取员工产值占比
    async getPercentage (formData) {
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'staffOutputsPercentage',
          params: formData
        });
        if (res.code === '0') {
          this.pieList = res.data.rows;
        }
        if (this.page === 1) {
          this.initPie(this.pieTarget);
        }
      } catch (error) {
        console.log(error)
      }
    },
    
    // 获取员工产值占比
    async getTrend (formData) {
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'staffOutputsTrend',
          params: formData
        });
        if (res.code === '0') {
          this.lineList = res.data.rows;
        }
        if (this.page === 1) {
          this.initLine(this.lineTarget);
        }
      } catch (error) {
        console.log(error)
      }
    },

    // 格式化请求参数
    searchFormat (formData) {
      this.page = formData.page;
      formData.range = this.formData.range;
      if (this.formData.start) formData.start = formatTime(this.formData.start, 'yyyy-MM-dd');
      if (this.formData.end) formData.end = formatTime(this.formData.end, 'yyyy-MM-dd');
      formData.jobTitle = this.formData.jobTitle;
      formData.subStoreId = this.formData.subStoreId;
      if (this.formData.jobTitle === '全部职位' || !this.formData.jobTitle) delete formData.jobTitle;
      this.getPercentage(formData);
      this.getTrend(formData);
    },

    onRadioChange () {
      this.formData.start = "";
      this.formData.end = "";
      this.search();
    },

    onPickerChange () {
      if (this.formData.start === "" && this.formData.end === "") {
        this.formData.range = this.rangeList[0].value;
      } else {
        this.formData.range = "";
      }
      this.search();
    },

    search () {
      this.$refs.table.init();
    }
  }
}
</script>

<style lang="less">
  .perf-list {
    .perf-container {
      padding: 20px;
      background: white;

      &__title {
        font-weight:500;
        text-align: left;
        font-size: 18px;
        color: #332E29;
        border-bottom: 1px solid #E5E2DF;
        padding: 10px 0 30px;
        margin-bottom: 20px;
      }
      .perf-header {
        display: flex;
        margin-bottom: 20px;
        align-items: center;
        .title {
          flex-grow: 1;
          color: #332E29;
          font-size: 14px;
          font-weight: normal;
        }
        .right {
          display: inline-block;
          >span {
            font-size: 14px;
            color: #888;
            margin-right: 5px;
          }
        }
        &__item {
          display: inline-block;
          width: auto;
          margin-right: 20px;
          &.ivu-select {
            width: 200px;
          }
        }
      }
      .perf-content {
        padding: 0;
        box-shadow: none;
      }
    }

    .perf-flex-wrap {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      .perf-container {
        flex-grow: 1;
        width: 50%;
        .perf-header__item {
          margin-right: 0;
          width: 120px;
        }
      }
      >:first-child {
        margin-right: 20px;
      }
    }
    .chart {
      width: 100%;
      height: 400px;
    }
    .no-data {
      text-align: center; 
      line-height: 200px; 
      font-size: 14px; 
      color: #666;
    }
  }
</style>
