<template>
  <!-- 抹零报表 -->
  <div class="datareport-list">
    <saas-bread title="抹零报表">
      <template slot="actions">
        <Button type="default" @click="goBack">返回</Button>
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
    <div class="search-item workdata-query">
      <div class="top">
        <btn-group
          :chartBtns="btns"
          :curKey="curKey"
          :renewBtn="renewBtn">
        </btn-group>
        <DatePicker type="date"
          v-model="params.dateFrom"
          placeholder="开始时间"
          :class="{'active': isDateFrom}"
          size="small"
          >
        </DatePicker>
        <DatePicker type="date"
          v-model="params.dateTo"
          placeholder="结束时间"
          :class="{'active': isDateTo}"
          size="small"
          >
        </DatePicker>
        <saas-toggle-btn style="float:right;" v-model="queryShow" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
      </div>
      <saas-query 
        v-show="queryShow"  
        ref="query"
        class="bottom"
        :data="queryData"
        @on-reset="onQueryReset"
        @on-query="onQuery">
      </saas-query>
    </div>
    <list-detail :list="dataList"></list-detail>
    <w-table
      ref="table"
      request="smallChangeReport"
      :params="params"
      :columns="columns"
      :tableData="tableData && tableData.rows">
    </w-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import btnGroup from '@/components/btn-group';
import listDetail from '../list-detail';
import { formatTime } from '@/assets/js/utils';
import { getLabel, customerType } from '@/store/json/default';
import { SMALL_CHANGE_EXPORT } from '@/https/api';
import '@/styles/views/datareport/list.less';

export default {
  data () {
    let permissionData = this.$permission.data.worker;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '车牌号', key: 'plateNo' },
      { title: '客户名称', key: 'vehicleOwner' },
      { title: '客户类型',
        render: (h, { row }) => {
           return h('div', getLabel(row.customerType,customerType) || '--')
        }
      },
      { title: '应收金额', key: 'receivable' },
      { title: '抹零金额', key: 'smallChange' },
      { title: '实收金额', key: 'realCost' },
      { title: '操作人', key: 'operatedBy' },
      { title: '操作时间', key: 'updatedAt' },
      {
        title: '操作',
        width: 90,
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                'click': () => {
                  this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/detail/' + row.statementNo });
                }
              }
            }, '查看工单')
          ])
        }
      }
    ];
    if (!permissionData.admin) columns.pop();
    return {
      curKey: 'today',
      btnCur: 'today',
      isDateFrom: false,
      isDateTo: false,
      params: {
        p: 'today',
        dateFrom: '',
        dateTo: '',
        subStoreId: this.$route.query.subStoreId,
        customerType:''
      },
      dataList: [
        { title: '抹零金额', value: '0', unit: '元' },
        { title: '实收金额', value: '0', unit: '元' }
      ],
      btns: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' },
        { name: '最近30天', value: '30days' }
      ],
      columns,
      customerType,
      queryShow: true,
      queryData: [
        { 
          type: "select", 
          key: "customerType", 
          label: "客户类型", 
          holder: "请选择客户类型",
          data: customerType
        }
      ]
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getAllTableData'
    })
  },

  watch: {
    tableData (value) {
      if (value) {
        this.dataList[0].value = value.smallChange;
        this.dataList[1].value = value.realCost;
      }
    },

    $route (to) {
      this.$destroy();
    }
  },

  methods: {
    onQueryReset () {
      this.params.dateFrom = "";
      this.params.dateTo = "";
      this.params.p = "today";
      this.params.customerType = ''
    },
    onQuery (params) {
      this.params.customerType = params.customerType;
      this.params.dateFrom = formatTime(this.params.dateFrom, 'yyyy-MM-dd');
      this.params.dateTo = formatTime(this.params.dateTo, 'yyyy-MM-dd');
      this.$refs.table.init();
    },
    goBack () {
      this.$router.go(-1);
      this.$destroy();
    },
    checkType (type) {
      let orderType = '';
      switch (type) {
        case '1':
          orderType = 'worker';
          break;
        case '2':
          orderType = 'sparepart';
          break;
        case '3':
          orderType = 'cleanout';
          break;
        default:
          break;
      }
      return orderType;
    },

    exportData (type) {
      const params = this.params;
      const url = SMALL_CHANGE_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
      let string = '';
      for (let i in params) {
        if (params[i]) {
          string = string + '&' + i + '=' + params[i];
        }
      }
      window.location.href = url + string;
    },

    renewBtn (index) {
      this.curKey = index;
      this.btnCur = index;
      this.params.p = index;
      this.params.dateFrom = '';
      this.params.dateTo = '';
      this.isDateFrom = false;
      this.isDateTo = false;
    },

    changeTimeFrom (value, oldvalue) {
      if (value) this.params.dateFrom = formatTime(this.params.dateFrom, 'yyyy-MM-dd');

      this.search();
    },

    changeTimeTo (value, oldvalue) {
      if (value) this.params.dateTo = formatTime(this.params.dateTo, 'yyyy-MM-dd');

      this.search();
    },

    search () {
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

      this.$refs.table.init();
    },
  },

  components: { btnGroup, listDetail }
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
