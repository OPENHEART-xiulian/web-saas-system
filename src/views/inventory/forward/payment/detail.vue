<template>
  <!-- 采购单详情 -->
  <div class="forward-detail">
    <saas-bread title="采购单详情">
      <template slot="actions">
        <Button type="error" @click="print">打印</Button>
      </template>
    </saas-bread>
    <div class="detail-top">
      <p><span>单号</span>{{ detail.purchaseCode  }}</p>
      <p><span>供应商</span>{{ detail.supplierName || '--' }}</p>
      <p><span>采购人</span>{{ detail.operatedBy || '--' }}</p>
      <p><span>开单日期</span>{{ detail.orderAt }}</p>
      <!-- <p><span>备注</span>{{ detail.remark || '--' }}</p> -->
      <Spin fix v-if="loading"></Spin>
    </div>
    <p class="text">已选配件（{{ detail.components && detail.components.length }}）</p>
    <div class="w-table">
      <Table :columns="columns" :data="detail.components"></Table>
      <Spin fix v-if="loading"></Spin>
    </div>
    <bottom-submit>
      <div class="bottom-detail">
        <p>采购金额：<span class="price">￥{{ detail.totalCost }}</span></p>
        <p>已选配件：{{ detail.components && detail.components.length }} 种共计 {{ detail.totalQuantity }} 件</p>
      </div>
      
      <Button type="default" @click="$router.go(-1)">返回</Button>
    </bottom-submit>

    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import print from './print';
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
        { title: '采购数量', key: 'quantity' },
        { title: '采购单价', key: 'purchasePrice' },
        { title: '金额', key: 'totalCost' },
        { title: '零售价', key: 'retailPrice' }
      ]
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetPurchaseDetail',
      params: {
        purchaseId: this.id
      }
    })
  },

  computed: {
    ...mapGetters({
      detail: 'getPurchaseDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  methods: {
    print () {
      this.$refs.print.openPrint(this.id);
    }
  },

  components: { print }
}
</script>
