<template>
  <!-- 查看盘点 -->
  <div class="deposit-check">
    <saas-bread :title="breadName">
      <template slot="actions">
        <i-button class="shadow-btn" type="default" @click="back">返回</i-button>
        <i-button class="shadow-btn" type="error" @click="openPrint">打印</i-button>
      </template>
    </saas-bread>
    <div class="header">
      <span>盘点单号：{{ detail.inventoryNo }}</span> 
      <span v-if="detail.inventoryDate">盘点日期：{{ detail.inventoryDate || '--' }}</span>
      <span>盘点人：{{ detail.createdBy }}</span>
    </div>
    <div class="w-table">
      <Table
        stripe
        :columns="columns"
        :data="detail.items">
      </Table>
      <div class="remark">
        备注：{{ detail.remark || '无' }}
        <div class="right">
          <p>盘点量：<span>{{ detail.totalQuantity }}</span></p>
          <p>盘点数量总变化：<span>{{ detail.totalQuantityChange }}</span></p>
          <p>总成本变化：<span>￥{{ detail.totalCostChange | getFixed }}</span></p>
        </div>
      </div>
    </div>
    <Spin fix v-if="loading"></Spin>
    <print ref="print"></print>
  </div>
</template>

<script>
  import { mapGetters, mapState } from 'vuex';
  import print from './print';
  import { unit, getObj } from '@/store/json/default';
  import '@/styles/views/inventory/deposit-check.less';
  import '@/styles/components/table.less';
  export default {
    components: { print },
    data () {
      return {
        columns: [
          { title: '序号', type: 'index', width: 65 },
          { title: '配件编号', key: 'partNo' },
          { title: '原厂编码', key: 'partFactoryNo' },
          { title: '配件名称', key: 'partName' },
          { title: '配件品牌', key: 'brand' },
          { title: '原有库存', key: 'originQuantity' },
          { title: '盘点库存', key: 'incQuantity' },
          { 
            title: '单位', 
            key: 'unit',
            render: (h, { row }) => {
                return h("my-unit", {
                  props: {
                    unit: row.unit
                  }
                });
              }
          },
          { title: '盘点数量变化', key: 'quantityChange', minWidth: 40 },
          { 
            title: '总成本变化(元)', 
            key: 'costChange', 
            minWidth: 40,
            render: (h, {row}) => {
              return h('div', Number(row.costChange).toFixed(2))
            }
          }
        ],
        breadName: '',
        id: this.$route.params.id
      }
    },

    created () {
      this.breadName = '查看盘点单';
      this.$store.dispatch({
        type: 'toGetInventoryCheck',
        payload: {
          request: "takestockCheck",
          params: {
            inventoryId: this.id
          }
        }
      })
    },

    computed: {
      ...mapGetters({
        detail: 'getInventoryCheck'
      }),

      ...mapState({ loading: (state) => state.global.isLoading })
    },

    methods: {
      back () {
        this.$router.go(-1)
      },
      openPrint () {
        this.$refs.print.openPrint(this.detail);
      }
    },
    filters: {
      getFixed (v) {
        if (!v) return '0.00';
        return Number(v).toFixed(2);
      },
    }
  }
</script>
