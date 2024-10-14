<template>

  <!-- 应付账款 -->
  <div class="deposit-list">
    <saas-bread title="应付账款">
    </saas-bread>
    <saas-search-input v-model="formData.supplierName" placeholder="输入供应商名称/联系方式" class="pd-20" @on-search="getFormData"></saas-search-input>
    <w-table
      ref="table"
      request="supplierToSettle"
      :columns="columns"
      :tableData="tableData"
      :formData="formData">
    </w-table>
    <remind-dialog 
      ref="remindDialog"
      title="确认付款"
      :content="content"
      :isHtml="true"
      @on-ok="remindConfirm">
    </remind-dialog>
    <print ref="print"></print>
    <sale-print ref="salePrint"></sale-print>
  </div>
  
</template>

<script>
import { mapGetters } from 'vuex';
import print from '@/views/workorder/print';
import salePrint from '@/views/workorder/sparepart/print';
import remindDialog from '@/components/dialog/remind-dialog';
import { cashWorkStatus, workType, getObj } from '@/store/json/default';

export default {
  components: { print, salePrint, remindDialog },
  data () {
    let permissionData = this.$permission.data.inventoryPurchasePut;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '供应商', key: 'supplierName' },
      { 
        title: '联系方式', 
        key: 'tel',
        render: (h, { row }) => {
          return h('div', row.tel || '无联系方式');
        } 
      },
      { title: '待结款单数', key: 'toSettleCount' },
      { 
        title: '待结款金额', 
        key: 'toSettle', 
        render: (h, {row}) => {
          return h('span', this.formatMoney(row.toSettle));
        } 
      },
      { 
        title: '操作',
        width: 120,
        render: (h, { row }) => {
          let elms = [];
          // if (permissionData.check) {
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push('/cash/payable/detail/' + row.supplierId);
                }
              }
            }, '查看'));
          // }

          // if (permissionData.payment) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.content = '采购单数：' + row.toSettleCount + '<br />付款金额：' + row.toSettle;
                  this.curSupplierId = row.supplierId;
                  this.$refs.remindDialog.openModal();
                }
              }
            }, '付款'));
          // }
          return elms;
        }
      }
    ];
    // if (!(permissionData.check || permissionData.receipt)) columns.pop();
    return {
      orderType: '', // 工单类型 '1': '维修单','2': '销售单', '3': '洗美单'
      formData: {
        supplierName:''
      },
      content: '',
      curSupplierId: '',
      columns
    }
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {
    getFormData (formData) {
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },

    remindConfirm () {
      this.$router.push('/cash/payable/pay/' + this.curSupplierId);
    },

    formatMoney( money ){
      return (money+ '').replace(/(\d{1,3})(?=(\d{3})+(?:$|\.))/g,'$1,');
    },
  }
}
</script>
