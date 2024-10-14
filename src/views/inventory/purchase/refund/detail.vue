<template>
  <!-- 退货单详情-->
  <div class="refund-add">
    <saas-bread title="退货单详情">
      <template slot="actions">
        <i-button type="default" @click="goBack">返回</i-button>
      </template>
    </saas-bread>
    <div class="box-shadow">
      <div class="refund-form">
        <div class="form-item">
          <span class="item-key">单号</span>
          <span class="item-value">{{detail.returnFormCode || '--'}}</span>
        </div>
        <div class="form-item">
          <span class="item-key">供应商</span>
          <span class="item-value">{{detail.supplierName || '--'}}</span>
        </div>
        <div class="form-item">
          <span class="item-key">退货人</span>
          <span class="item-value">{{detail.operatedBy || '--'}}</span>
        </div>
        <div class="form-item">
          <span class="item-key">开单日期</span>
          <span class="item-value">{{detail.orderAt || '--'}}</span>
        </div>
        <div class="form-item">
          <span class="item-key">备注</span>
          <span class="item-value">{{detail.remark || '--'}}</span>
        </div>
      </div>
      <div class="title">已选配件</div>
      <w-table
        ref="table"
        :columns="columns"
        :is-pagination="false"
        :tableData="tableData">
      </w-table>
      <!-- <div class="no-data">暂无配件信息</div> -->
    </div>
    <bottom-submit>
      <div class="slot-left">
        <p class="price">采购金额：<span>￥{{detail.totalCost | toFixed}}</span></p>
        <p>
          <span>{{tableData.length}}种共计{{getCount}}件</span>
        </p>
      </div>
      <i-button type="error" v-if="detail.refundStatus === '1'" :loading="loading" @click="toSettle">退款</i-button>
    </bottom-submit>
    <!-- <remind-dialog 
      ref="remindDialog"
      title="确定付款吗？"
      content=""
      @on-ok="submit">
    </remind-dialog> -->
  </div>
</template>

<script>
  import '@/styles/views/inventory/refund-add.less';
  // import RemindDialog from '@/components/dialog/remind-dialog';

  import { formatTime, multiply } from '@/assets/js/utils.js';
  import { unit, getLabel } from '@/store/json/default';
  export default {
    data () {
      return {
        loading: false,
        id: '',
        detail: {},
        tableData: [],
        columns: [
          { title: '序号', type: 'index', width: 80 },
          { title: '编号', key: 'partNo' },
          { title: '名称', key: 'partName' },
          { title: '品牌', key: 'brand' },
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
          { title: '分类', key: 'cateStr' },
          { title: '仓库', key: 'warehouseName' },
          // { title: '货位', key: 'shelfName' },
          { title: '库存', key: 'originQuantity' },
          { title: '退货数量', key: 'quantity' },
          { title: '单价', key: 'price' },
          { title: '退货金额', key: 'cost' }
        ],
        shareStoreId: ''
      }
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.id = this.$route.params.id;
        this.shareStoreId = this.$route.query.shareStoreId || ''
        this.getTableData();
      },
      async getTableData () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'refundDetail',
            params: {
              returnFormId: this.id,
              shareStoreId: this.shareStoreId
            }
          });

          if (res.code === '0') {
            this.detail = res.data;
            this.tableData = this.detail.components;
          }

          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      toSettle () {
        this.$router.push('/inventory/purchase/refund/pay/' + this.id);
      },
      goBack () {
        this.$router.go(-1);
      }
    },
    computed: {
      getCount () {
        let count = 0;
        this.tableData.forEach(item => {
          count += Number(item.quantity);
        });
        return count;
      }
    },
    filters: {
      toFixed (v) {
        return v ? Number(v).toFixed(2) : 0;
      }
    }
  }
  </script>
