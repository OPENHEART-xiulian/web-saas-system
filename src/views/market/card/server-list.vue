<template>
  <!-- 服务卡列表 -->
  <div>
    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getServerCardList"
      :auto="true"
      :columns="columns"  
      :params="params"
      @on-before="onBefore"

      >
    </saas-table>
    <refund-dialog ref="refundDialog" @on-ok="search"></refund-dialog>
    <remind-dialog ref="remindDialog" :title="remindTitle" :content="remindContent" @on-ok="delConfirm"></remind-dialog>
  </div>
</template>

<script>
import refundDialog from '@/components/dialog/card-refund-dialog';
import remindDialog from '@/components/dialog/remind-dialog';
import poptipTable from './poptip-table';
import { memberCardOrderChannel, memberCardOrderStatus, getObj } from '@/store/json/default';
import { CARD_EXPORT } from '@/https/api';

export default { 
  components: { refundDialog, remindDialog },
  data () {
    let permissionData = this.$permission.data.marketCardService;
    let columns = [
      { title: '序号', type: 'index', width: 65,fixed: 'left' },
      { title: '单号', key: 'statementNo', width: 200 },
      { title: '客户', key: 'customerName', minWidth: 120 },
      { title: '手机号', key: 'mobile', minWidth: 120 },
      { 
        title: '会员卡名称', 
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
      {
        title: '剩余次数',
        width: 100,
        render: (h, { row }) => {
          return h('Poptip', {
            props: {
              trigger: 'click',
              placement: 'right-start',
              popperClass: 'card-poptip'
            },
            style: {
              cursor: 'pointer'
            }
          }, [
            h('div', '查看明细'),
            h('div', {
              slot: 'content'
            }, [
              h(poptipTable, {
                props: {
                  servictList: row.serviceList
                }
              })
            ])
          ])
        }
        // render: (h, { row }) => {
        //   return h(poptipTable, {
        //     props: {
        //       servictList: row.serviceList
        //     }
        //   })
        // }
      },
      { title: '销售人员', key: 'saleUserName', width: 100 },
      { title: '出售时间', key: 'saleAt', width: 110, sortable: 'custom' },
      { title: '实收金额', width: 100, key: 'totalCost' },
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
          if (row.status === '1') { // 未结算
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
                if (elms.length) elms.push(h("span", " | "));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/market/card/form/' + row._id);
                    }
                  }
                }, '修改'))
              }

              // if (permissionData.delete) {
                if (elms.length) elms.push(h("span", " | "));
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
                }, '作废'))
              // }
          } else if (row.status === '2') { // 有效
            if (permissionData.update) {
                if (elms.length) elms.push(h("span", " | "));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/market/card/form/' + row._id);
                    }
                  }
                }, '修改'))
              }

              if (permissionData.refund) {
                if (elms.length) elms.push(h("span", " | "));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$refs.refundDialog.openModal(row);
                    }
                  }
                }, '退卡'));
              }
          } else { // 无效
            elms.push(h('div', '--'));
          }
          return elms;
        }
      },
    ];
    return {
      permissionData,
      remindTitle: '',
      remindContent: '',
      currentId: '', // 当前操作的会员卡id
      params: { type: '0',sortOrder: -1,orderBy: 'saleAt'},
      columns,
      searchObj: {  }

    }
  },

  mounted() {
    this.searchObj = Object.assign({},this.params,{page:1,rows:10})
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

    exportCard(){
      const params = this.searchObj;
      const url = `${CARD_EXPORT}?token=${this.$storage.get("TOKEN")}`;
      let string = "";
      for (let i in params) {
        if (params[i]) {
          string += `&${i}=${params[i]}`;
        }
      }
      window.location.href = url + string;
    },

    onBefore(data){
      this.searchObj = data
    },

    search () {
      this.$refs.table.reset();
    }
  },
}
</script>
