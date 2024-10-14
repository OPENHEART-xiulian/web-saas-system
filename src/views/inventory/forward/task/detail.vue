<template>
  <!-- 采购任务 查看任务 -->
  <div class="forward-detail">
    <saas-bread title="查看任务">
      <template slot="actions">
        <Button type="default" @click="back">返回</Button>
      </template>
    </saas-bread>
    <div class="detail-top">
      <p><span>工单号</span>{{ detail.statementNo || '--' }}</p>
      <p><span>客户</span>{{ detail.vehicleOwner || '--' }} | {{ detail.ownerMobile || '--' }} | {{ detail.plateNo || '--' }}</p>
      <p><span>开单日期</span>{{ detail.orderAt || '--' }}</p>
      <Spin fix v-if="loading"></Spin>
    </div>
    <p class="text">已选配件（{{ detail.components && detail.components.length || 0 }}）</p>
    <div class="w-table">
      <Table :columns="columns" :data="detail.components"></Table>
      <Spin fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { unit, getObj } from '@/store/json/default';
import '@/styles/components/table.less';
import '@/styles/views/inventory/forward-detail.less';

export default {
  data () {
    return {
      id: this.$route.params.id,
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { 
          title: '配件编号', 
          key: 'partNo',
          render: (h, { row }) => {
            return h('div', row.partNo || '--');
          } 
        },
        { 
          title: '原厂编码', 
          key: 'partFactoryNo',
          render: (h, { row }) => {
            return h('div', row.partFactoryNo || '--');
          } 
        },
        { title: '名称', key: 'partName' },
        { 
          title: '品牌', 
          key: 'brand',
          render: (h, { row }) => {
            return h('div', row.brand || '--');
          }  
        },
        { 
          title: '单位', 
          key: 'unit',
          width: 80,
          render: (h, { row }) => {
              return h("my-unit", {
                props: {
                  unit: row.unit
                }
              });
            }
        },
        { 
          title: '分类', 
          key: 'cateStr',
          render: (h, { row }) => {
            return h('div', (row.cateStr && row.cateStr.split('/').pop()) || '--')
          } 
        },
        { title: '供应商', key: 'supplierName' },
        { title: '采购人', key: 'operatedBy' },
        { title: '采购数量', key: 'quantity' },
        { title: '采购单价', key: 'purchasePrice' },
        { title: '金额', key: 'totalCost' }
      ]
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetTaskDetail',
      params: {
        statementNo: this.id
      }
    })
  },

  computed: {
    ...mapGetters({
      detail: 'getTaskDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    detail (val) {
      if (val) {
        val.components.forEach(item => {
          item.totalCost = Math.round(parseFloat(item.quantity * item.purchasePrice) * 1000) / 1000
        })
      }
    }
  },

  methods: {
    back () {
      this.$router.push('/inventory/forward/list');
    }
  },
}
</script>
