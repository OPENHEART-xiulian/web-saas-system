<template>
  <!-- 会员卡报表 -->
  <div class="datareport-list">
    <saas-bread title="会员卡报表">
      <template slot="actions">
        <i-button type="default" @click="goBack">返回</i-button>
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
      request="memberCardOrderStat"
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
import { memberCardType, memberCardOrderLogType, getObj } from '@/store/json/default';
import '@/styles/views/datareport/list.less';

export default {
  data () {
    return {
      curKey: 'today',
      btnCur: 'today',
      isDateFrom: false,
      isDateTo: false,
      params: {
        p: 'today',
        dateFrom: '',
        dateTo: '',
        subStoreId: this.$route.query.subStoreId
      },
      dataList: [
        { title: '开卡实收金额', value: '0', unit: '元' },
        { title: '开卡数量', value: '0', unit: '元' },
        { title: '退卡数量', value: '0', unit: '元' },
        { title: '退卡实收金额', value: '0', unit: '元' },
        { title: '充值金额', value: '0', unit: '元' },
      ],
      btns: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '最近7天', value: '7days' },
        { name: '最近30天', value: '30days' }
      ],
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { 
          title: '类型', 
          key: 'type',
          render: (h, { row }) => {
            return h('div', getObj(memberCardOrderLogType)[row.type]);
          } 
        },
        { 
          title: '卡类别', 
          key: 'memberCardType',
          render: (h, { row }) => {
            return h('div', getObj(memberCardType)[row.memberCardType]);
          }  
        },
        { title: '实际金额', key: 'money' },
        { title: '卡内金额', key: 'amount' },
        { title: '时间', key: 'at' },
        { title: '操作人员', key: 'saleUserName' }
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
      if (value && value.stat) {
        this.dataList[0].value = value.stat.buyCost;
        this.dataList[1].value = value.stat.buyCount;
        this.dataList[2].value = value.stat.refundCount;
        this.dataList[3].value = value.stat.refundMoney;
        this.dataList[4].value = value.stat.rechargeCost;
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
