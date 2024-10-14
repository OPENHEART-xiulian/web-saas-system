<template>
  <!-- 入库明细 -->
  <div class="datareport-list">
    <saas-bread title="入库明细">
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
    <div class="search-item">
      <btn-group
        :chartBtns="btns"
        :curKey="curKey"
        :renewBtn="renewBtn">
      </btn-group>
      <DatePicker type="date"
        v-model="params.dateFrom"
        placeholder="开始日期"
        :class="{'active': isDateFrom}"
        @on-change="changeTimeFrom">
      </DatePicker>
      <DatePicker type="date"
        v-model="params.dateTo"
        placeholder="结束日期"
        :class="{'active': isDateTo}"
        @on-change="changeTimeTo">
      </DatePicker>
    </div>
    <list-detail :list="dataList"></list-detail>
    <w-table
      ref="table"
      request="dataStockinStat"
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
import { STOCKIN_STAT_EXPORT } from '@/https/api';
import { settleStatus, getLabel } from '@/store/json/default';
import '@/styles/views/datareport/list.less';

export default {
  data () {
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '采购单号', key: 'purchaseCode' },
      { title: '供应商名称', key: 'supplierName' },
      { 
        title: '配件名称', 
        key: 'components',
        render: (h, {row, column}) => {
          return row[column.key] && [row[column.key].partName || '--'];
        }
      },
      { 
        title: '仓库', 
        key: 'components',
        render: (h, {row, column}) => {
          return row[column.key] && [row[column.key].warehouseName || '--'];
        }
      },
      { title: '采购人', key: 'createdBy' },
      { 
        title: '结算状态', 
        key: 'settleStatus',
        render: (h, { row }) => {
          return h('span', getLabel(row.settleStatus, settleStatus));
        }
      },
      { 
        title: '入库日期', 
        key: 'createdAt',
        sortable: 'custom',
        render: (h, {row, column}) => {
          return row[column.key] && [formatTime(row[column.key], "yyyy-MM-dd HH:mm:ss")]
        }
      },
      { 
        title: '数量', 
        key: 'components',
        render: (h, {row, column}) => {
          return row[column.key] && [row[column.key].quantity || '--'];
        }
      },
      { 
        title: '单价', 
        key: 'components',
        render: (h, {row, column}) => {
          return row[column.key] && [row[column.key].purchasePrice || '--'];
        }
      },
      { title: '总额', key: 'totalCost' }
    ];
    return {
      curKey: '30days',
      btnCur: '30days',
      isDateFrom: false,
      isDateTo: false,
      params: {
        p: '30days',
        dateFrom: '',
        dateTo: '',
        subStoreId: this.$route.query.subStoreId
      },
      dataList: [
        { title: '入库数量', value: '0', unit: '件' },
        { title: '入库总额', value: '0', unit: '元' }
      ],
      btns: [
        { name: '一个月', value: '30days' },
        { name: '三个月', value: '90days' },
        { name: '半年', value: '183days' },
        { name: '一年', value: '365days' }
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
    tableData (value) {
      if (value.stat) {
        this.dataList[0].value = value.stat.totalQuantity;
        this.dataList[1].value = value.stat.totalCost;
      }
    },

    $route (to) {
      this.$destroy();
    }
  },

  methods: {
    goBack () {
      this.$router.go(-1);
      this.$destroy();
    },

    exportData (type) {
      const params = this.params;
      const url = STOCKIN_STAT_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
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
      this.$refs.table.init();
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
