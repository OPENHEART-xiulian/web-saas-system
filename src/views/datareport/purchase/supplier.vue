<template>
  <!-- 供应商采购统计 -->
  <div class="datareport-list">
    <saas-bread title="供应商采购统计">
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
        placeholder="开始时间"
        :class="{'active': isDateFrom}"
        @on-change="changeTimeFrom">
      </DatePicker>
      <DatePicker type="date"
        v-model="params.dateTo"
        placeholder="结束时间"
        :class="{'active': isDateTo}"
        @on-change="changeTimeTo">
      </DatePicker>
    </div>
    <list-detail :list="dataList"></list-detail>
    <w-table
      ref="table"
      request="supplierReport"
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
import { PURCHASE_SUPPLIER_EXPORT } from '@/https/api';
import '@/styles/views/datareport/list.less';

export default {
  data () {
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
        { title: '采购金额合计', value: '0', unit: '元' },
        { title: '采购数量合计', value: '0', unit: '件' }
      ],
      btns: [
        { name: '一个月', value: '30days' },
        { name: '三个月', value: '90days' },
        { name: '半年', value: '183days' },
        { name: '一年', value: '365days' }
      ],
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { title: '供应商名称', key: 'supplierName' },
        { title: '采购数量', key: 'totalQuantity' },
        { title: '采购金额', key: 'totalCost' },
        { 
          title: '采购数量占比', 
          key: 'totalQuantityPercent',
          render: (h, { row }) => {
            return h('div', (Math.round(parseFloat(row.totalQuantityPercent) * 10000) / 100).toFixed(2) + '%');
          } 
        },
        { 
          title: '采购金额占比', 
          key: 'totalCostPercent', 
          width: 120,
          render: (h, { row }) => {
            return h('div', (Math.round(parseFloat(row.totalCostPercent) * 10000) / 100).toFixed(2) + '%');
          } 
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
        this.dataList[0].value = value.totalCost || 0;
        this.dataList[1].value = value.totalQuantity || 0;
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
      const url = PURCHASE_SUPPLIER_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
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
    }
  },

  components: { btnGroup, listDetail }
}
</script>
