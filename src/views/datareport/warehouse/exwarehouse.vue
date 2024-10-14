<template>
  <!-- 出库明细 -->
  <div class="datareport-list">
    <saas-bread title="出库明细">
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
      request="dataStockoutStat"
      :params="params"
      :columns="columns"
      :tableData="tableData">
    </w-table>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import btnGroup from '@/components/btn-group';
import listDetail from '../list-detail';
import { formatTime } from '@/assets/js/utils';
import { STOCKOUT_STAT_EXPORT } from '@/https/api';
import { outputWorkerType, getLabel } from '@/store/json/default';
import '@/styles/views/datareport/list.less';

export default {
  data () {
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '出库单号', key: 'stockOutNo' },
      { title: '供应商名称', key: 'supplierName' },
      { title: '配件名称', key: 'partName' },
      { title: '出库数量', key: 'usedQuantity' },
      { title: '成本价', key: 'purchasePrice' },
      { title: '成本小计', key: 'purchaseTotalCost' },
      { title: '售价', key: 'retailPrice' },
      { title: '销售小计', key: 'retailTotalCost' },
      { title: '领料人', key: 'createdBy' },
      { title: '出库类型', width: 80, key: 'orderType' },
      { title: '出库日期', key: 'stockOutDate', sortable: 'custom' },
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
        { title: '出库数量', value: '0', unit: '件' },
        { title: '出库总额', value: '0', unit: '元' }
      ],
      btns: [
        { name: '一个月', value: '30days' },
        { name: '三个月', value: '90days' },
        { name: '半年', value: '183days' },
        { name: '一年', value: '365days' }
      ],
      columns,
      tableData: []
    }
  },

  computed: {
    ...mapGetters({
      getAllTableData: 'getAllTableData'
    })
  },

  watch: {
    getAllTableData (value) {
      if (value.stat) {
        this.dataList[0].value = value.stat.usedQuantity;
        this.dataList[1].value = value.stat.stockoutCost;
      }
      if (value.rows) {
        this.tableData = value.rows.map(elm => {
          let components = elm.items;
          let supplierName;
          if (components && components.supplier && components.supplier[0]) {
            supplierName = components.supplier[0].supplierName;
          }

          return {
            orderType: getLabel(elm.orderType, outputWorkerType),
            stockOutNo: elm.stockOutNo || '--',
            supplierName: supplierName || '--',
            partName: components.partName || '--',
            usedQuantity: components.usedQuantity,
            purchasePrice: components.purchasePrice,
            // purchaseTotalCost: (components.purchasePrice * components.originQuantity).toFixed(2),
            purchaseTotalCost: components.totalPurchasePrice,
            retailPrice: components.retailPrice,
            // retailTotalCost: (components.retailPrice * components.usedQuantity).toFixed(2),
            retailTotalCost: components.totalRetailPrice,
            createdBy: elm.createdBy || '--',
            stockOutStatus: elm.stockOutStatus,
            stockOutDate: elm.stockOutDate ? formatTime(elm.stockOutDate, 'yyyy-MM-dd HH:mm:ss') : '--'
          }
        });
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
      const url = STOCKOUT_STAT_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
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
