<template>
  <!-- 充值卡列表 -->
  <div>
    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getServerCardList"
      :auto="true"
      :columns="columns"  
      :params="params">
    </saas-table>
    <recharge-dialog ref="rechargeDialog" @on-ok="search">
    </recharge-dialog>
    <refund-dialog ref="refundDialog" @on-ok="search"></refund-dialog>
    <remind-dialog 
      ref="remindDialog"
      :title="remindTitle"
      :content="remindContent"
      @on-ok="delConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import rechargeDialog from '@/components/dialog/card-recharge-dialog';
import refundDialog from '@/components/dialog/card-refund-dialog';
import remindDialog from '@/components/dialog/remind-dialog';
import { memberCardOrderChannel, memberCardOrderStatus, getObj } from '@/store/json/default';

export default {
  components: { rechargeDialog, refundDialog, remindDialog },
  data () {
    let permissionData = this.$permission.data.marketCardRecharge;
    return {
      permissionData,
      remindTitle: '',
      remindContent: '',
      currentId: '', // 当前操作的会员卡id
      params: { type: '1' },
      columns: [ // 充值卡
        { title: '序号', type: 'index', width: 65 },
        { title: '单号', key: 'statementNo', width: 200 },
        { title: '客户', key: 'customerName', minWidth: 120 },
        { 
          title: '名称', 
          minWidth: 120,
          render: (h, { row }) => {
            return h('div', row.memberCard && row.memberCard.name);
          } 
        },
        { 
          title: '销售渠道', 
          width: 100,
          render: (h, { row }) => {
            return h('div', getObj(memberCardOrderChannel)[row.channel]);
          } 
        },
        { title: '卡内余额', width: 100, key: 'amount' },
        { title: '实收金额', width: 100, key: 'totalCost' },
        { title: '销售人员', key: 'saleUserName', width: 100 },
        { title: '出售日期', key: 'saleAt', width: 110 },
        { 
          title: '状态', 
          width: 100,
          render: (h, { row }) => {
            return h('div', getObj(memberCardOrderStatus)[row.status])
          }
        },
        { 
          title: '操作',
          width: 150,
          fixed: "right",
          render: (h, { row }) => {
            let elms = [];
            if (row.status === '2') { // 有效
              if (permissionData.update) {
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/market/card/form/' + row._id);
                    }
                  }
                }, '修改'))
              }
              
              // 退卡
              if (permissionData.refund) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$refs.refundDialog.openModal(row);
                    }
                  }
                }, '退卡'));
              }

              // 充值
              if (permissionData.recharge) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$refs.rechargeDialog.openModal(row);
                    }
                  }
                }, '充值'));
              }
            } else if (row.status === '1') { // 未结算
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.currentId = row._id;
                    this.remindTitle = '确定收款';
                    this.remindContent = '确定收款该会员卡吗？';
                    this.$refs.remindDialog.openModal();
                  }
                }
              }, '收款'));

              if (permissionData.update) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/market/card/form/' + row._id);
                    }
                  }
                }, '修改'));
              }

              // if (permissionData.delete) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.currentId = row._id;
                      this.remindTitle = '作废会员卡';
                      this.remindContent = '确定要作废该会员卡吗？';
                      this.$refs.remindDialog.openModal();
                    }
                  }
                }, '作废'));
              // }
            } else { // 无效
              elms.push(h('div', '--'));
            }
            return elms;
          }
        }
      ],
    }
  },

  methods: {
    delConfirm () {
      let api;
      if (this.remindTitle === '作废会员卡') {
        api = 'memberCardOrderCancel';
      } else { // 收款
        api = 'memberCardOrderSettle';
      }
      this.$store.dispatch({
        type: 'actionPost',
        params: {
          _id: this.currentId
        },
        name: api
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('操作成功');
          this.$refs.remindDialog.onCancel();
          this.search();
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },
    search () { // 成功后的操作
      this.$refs.table.reset();
    },
  },
}
</script>
