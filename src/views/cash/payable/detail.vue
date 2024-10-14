<template>
  <!-- 采购记录 -->
  <div class="payable-detail">
    <saas-bread title="采购记录"></saas-bread>
    <div class="detail-top">
      <div class="msg">
        <p>{{ toSettleDetail.supplierName }}</p>
        <p>{{ toSettleDetail.tel }}</p>
        <Button v-if="inventorySupplier.check" type="default" @click="toDetail">查看详情</Button>
      </div>
      <ul>
        <li v-for="(item, index) in dataList" :key="index">
          <p>{{ item.title }}</p>
          <p>{{ item.value || 0 }}</p>
          <p>{{ item.unit }}</p>
        </li>
      </ul>
      <Spin fix v-if="loading"></Spin>
    </div>

    <w-table
      ref="table"
      :params="{
        supplierId: id,
        purchaseStatus: '2',
        settleStatus: '1'
      }"
      request="purchaseList"
      :columns="columns"
      :tableData="tableData"
      @on-selection-change="selectChange">
    </w-table>

    <bottom-submit>
      <div class="detail-text">
        <p>付款金额：<span class="price">￥{{ totalCost }}</span></p>
        <p>{{ count }}个采购单共计{{ totalQuantity }}件配件</p>
      </div>
      <Button type="default" @click="$router.go(-1)">返回</Button>
      <Button type="error" @click="toPay">付款</Button>
    </bottom-submit>

    <remind-dialog 
      ref="remindDialog"
      :title="title"
      content=""
      @on-ok="remindConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import remindDialog from '@/components/dialog/remind-dialog';
import {getUri} from '@/https/api.js';
import { formatTime, storage } from '@/assets/js/utils';
import '@/styles/views/cash/payable-detail.less';

export default {
  components: { remindDialog },
  data () {
    let { inventoryPurchasePut, inventoryPurchaseRefund, inventorySupplier } = this.$permission.data;
    let columns = [
      { type: 'selection', width: 60 },
      { title: '单号', key: 'purchaseCode' },
      { title: '采购人', key: 'operatedBy' },
      { 
        title: '采购日期', 
        key: 'purchaseAt',
        render: (h, { row }) => {
          return h('div', (row.purchaseAt && formatTime(row.purchaseAt, 'yyyy-MM-dd HH:mm:ss')) || '--')
        } 
      },
      { title: '采购数量', key: 'totalQuantity' },
      { 
        title: '采购金额', 
        key: 'totalCost',
        render: (h, { row }) => {
          return h('div', row.totalCost && parseFloat(row.totalCost).toFixed(2));
        } 
      },
      {
        title: '操作',
        width: 110,
        render: (h, { row }) => {
          let check = (row.purchaseType === '0' && inventoryPurchaseRefund.check) || (row.purchaseType !== '0' && inventoryPurchasePut.check);
          return check ? h('div', [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  if (row.purchaseType === '0') {
                    this.$router.push('/inventory/purchase/put/detail/' + row.purchaseId);
                  } else {
                    this.$router.push('/inventory/forward/detail/' + row.purchaseId);
                  }
                }
              }
            }, '查看')
          ]) : h("span", "--");
        }
      }
    ];
    return {
      inventorySupplier,
      id: this.$route.params.id,
      totalCost: 0.00,  // 付款金额
      count: 0,         // 采购单数
      totalQuantity: 0, // 采购配件数
      selection: [],    // 选择付款的单
      title: '',
      dataList: [
        { title: '待付款单数', value: 0, unit: '单' },
        { title: '待付款金额', value: 0, unit: '元' },
      ],
      columns
    }
  },

  created () {
    this.init();
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      toSettleDetail: 'getToSettleDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    toSettleDetail (val) {
      if (val) {
        this.dataList[0].value = val.toSettleCount;
        this.dataList[1].value = val.toSettle;
      }
    }
  },

  methods: {
    init () {
      this.$store.dispatch({
        type: 'toGetToSettleDetail',
        params: {
          supplierId: this.id
        }
      })
    },

    toDetail () {
      this.$router.push('/inventory/supplier/detail/' + this.id);
    },

    showDialog (title) {
      this.title = title;
      this.$refs.remindDialog.openModal();
    },

    remindConfirm () {
      this.$refs.remindDialog.onCancel();
    },

    selectChange (selection) {
      let cost = 0;
      let quantity = 0;
      selection.forEach((item) => {
        cost += parseFloat(item.totalCost);
        quantity += parseFloat(item.totalQuantity);
      });
      this.totalCost = cost.toFixed(2);
      this.count = selection.length;
      this.totalQuantity = quantity;
      this.selection = selection;
    },

    toPay () {
      if (this.selection.length > 0) {
        storage.set('payItem', this.selection);
        this.$router.push('/cash/payable/pay/' + this.id);
      } else {
        this.$Message.warning('请先选择需要付款的采购单');
      }
    }
  },
}
</script>
