<template>
  <!-- 收入报表 -->
  <div class="datareport-list">
    <saas-bread title="收入报表">
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
    <div class="search-item">
      <btn-group
        :chartBtns="btns"
        :curKey="params.by"
        :renewBtn="renewBtn">
      </btn-group>
    </div>
    <!-- <w-table
      ref="table"
      request="incomeReport"
      :params="params"
      :columns="columns"
      :tableData="tableData">
    </w-table> -->
    <saas-table
      ref="table"
      api="getIncomeReport"
      :columns="columns"  
      :params="params">
    </saas-table>
  </div>
</template>

<script>
import btnGroup from '@/components/btn-group';
import { INCOME_STAT_EXPORT } from '@/https/api';
import '@/styles/views/datareport/list.less';

export default {
  data () {
    return {
      params: {
        by: "day",
        subStoreId: this.$route.query.subStoreId
      },
      btns: [
        { name: '日报表', value: 'day' },
        { name: '月报表', value: 'month' },
        { name: '年报表', value: 'year' }
      ],
      columns: [
        { title: '序号', type: 'index', width: 60, fixed: "left" },
        { title: '时间', key: 'date', sortable: 'custom', width: 120 },
        // { title: '营业总额', key: 'turnover', sortable: 'custom', width: 120 },
        { title: '收入总额', key: 'totalIncome', sortable: 'custom', width: 120 },
        // { title: '应收金额', key: 'receivable', sortable: 'custom', width: 120 },
        { title: '工单结算', key: 'todaySettlementCost', sortable: 'custom', width: 120 },
        // { title: '实收金额', key: 'realCost', sortable: 'custom', width: 120 },
        { title: '挂账回款', key: 'differSettlementCost', sortable: 'custom', width: 120 },
        // { title: '未收金额', key: 'leftReceivable', sortable: 'custom', width: 120 },
        { title: '会员卡销售', key: 'memberCardCost', sortable: 'custom', width: 120 },
        // { title: '挂账金额', key: 'creditReceivable', sortable: 'custom', width: 120 },
        // { title: '工单数量', key: 'orderCount', sortable: 'custom', width: 120 },
        { title: '结算工单数量', key: 'orderCount', sortable: 'custom', width: 140 },
        { title: '项目收入', key: 'repairItemIncome', sortable: 'custom', width: 120 },
        { title: '配件收入', key: 'repairPartIncome', sortable: 'custom', width: 120 },
        { title: '其他收入', key: 'otherIncome', sortable: 'custom', width: 120 },
        { title: '总成本', key: 'totalCost', sortable: 'custom', width: 120 },
        { title: '总利润', key: 'profit', sortable: 'custom', width: 120 }
      ],
      subStoreId: ''
    }
  },

  watch: {
    $route (to) {
      this.$destroy();
    }
  },

  methods: {
    exportData (type) {
      const params = this.params;
      const url = INCOME_STAT_EXPORT + '?token=' + this.$storage.get('TOKEN') + '&t=' + type;
      let string = '';
      for (let i in params) {
        if (params[i]) {
          string = string + '&' + i + '=' + params[i];
        }
      }
      window.location.href = url + string;
    },
    
    renewBtn (index) {
      this.params.by = index;
      if (!this.params.settlementDateFrom) delete this.params.settlementDateFrom;
      if (!this.params.settlementDateTo) delete this.params.settlementDateTo;
      this.$refs.table.reset();
    }
  },

  components: { btnGroup }
}
</script>
