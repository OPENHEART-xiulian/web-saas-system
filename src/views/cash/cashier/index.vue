<template>
  <!-- 收银台 -->
  <div class="deposit-list">
    <saas-bread title="收银台">
      <template slot="actions">
        <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
      </template>
    </saas-bread>

    <search-form 
      v-show="queryShow" 
      :inputData="inputData"
      @form-data="getFormData">
    </search-form>
    <w-table
      ref="table"
      request="cashList"
      :columns="columns"
      :tableData="tableData"
      :formData="formData">
    </w-table>
    <remind-dialog 
      ref="remindDialog"
      :title="title"
      :content="content"
      :showCancel="showCancel"
      @on-ok="remindConfirm">
    </remind-dialog>
    <print ref="print"></print>
    <sale-print ref="salePrint"></sale-print>
    <clean-print ref="cleanPrint"></clean-print>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import print from '@/views/workorder/print';
import salePrint from '@/views/workorder/sparepart/print';
import cleanPrint from '@/views/workorder/cleanout/print';
import remindDialog from '@/components/dialog/remind-dialog';
import { cashWorkStatus, workType, getObj } from '@/store/json/default';

export default {
  components: { print, salePrint, cleanPrint, remindDialog },
  data () {
    let { workerList, workerCleanout, workerSparepart, workerSaleretur, cashReceivable } = this.$permission.data;
    let n = 0;
    let width = 200;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { 
        title: '车牌', 
        key: 'plateNo',
        render: (h, { row }) => {
          return h('div', row.plateNo || '无车辆信息');
        }
      },
      { 
        title: '客户', 
        key: 'vehicleOwner',
        render: (h, { row }) => {
          return h('div', row.vehicleOwner || '匿名客户');
        } 
      },
      { 
        title: '联系方式', 
        key: 'ownerMobile',
        render: (h, { row }) => {
          return h('div', row.ownerMobile || '无联系方式');
        } 
      },
      { 
        title: '工单类型', 
        key: 'orderType',
        render: (h, { row }) => {
          return h('div', getObj(workType)[row.orderType]);
        }
      },
      { 
        title: '工单状态', 
        key: 'workStatus',
        render: (h, { row }) => {
          return h('div', this.getWorkStatus(row.workStatus, row.orderType));
        }
      },
      { 
        title: '应收金额', 
        key: 'leftReceivable', 
        render: (h, {row}) => {
          return h('span', Number(row.leftReceivable) < 0 ? 0.00 : parseFloat(row.leftReceivable).toFixed(2));
        } 
      },
      { 
        title: '操作',
        width: width,
        render: (h, { row }) => {
          let elms = [];
    //       orderType: {
    //     维修: '1' as '1',
    //     配件: '2' as '2',
    //     洗美: '3' as '3',
    //     退货: '4' as '4'
    // }
          let check = ((row.orderType == 1 && workerList.check) || 
            (row.orderType == 3 && workerCleanout.check) || 
            (row.orderType == 2 && workerSparepart.check) || 
            (row.orderType == 4 && workerSalereturn.check));
          if (check) { // 有查看权限
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/detail/' + row.statementNo });
                }
              }
            }, '查看'));
          }
          
          let advance = ((row.orderType == 1 && workerList.advance) || 
            (row.orderType == 3 && workerCleanout.advance) || 
            (row.orderType == 2 && workerSparepart.advance) || 
            (row.orderType == 4 && workerSalereturn.advance));
          if (advance && row.workStatus === '1') {  // 预收
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/balance/' + row.statementNo + '?advance=1&from=cashier' });
                }
              }
            }, '预收'));
          } else {
            let receipt = ((row.orderType == 1 && workerList.receipt) || 
              (row.orderType == 3 && workerCleanout.receipt) || 
              (row.orderType == 2 && workerSparepart.receipt) || 
              (row.orderType == 4 && workerSalereturn.receipt));
            if (receipt) {  // 收款
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/balance/' + row.statementNo });
                  }
                }
              }, '收款'));
            }

            let credit = ((row.orderType == 1 && workerList.credit) || 
              (row.orderType == 3 && workerCleanout.credit) || 
              (row.orderType == 2 && workerSparepart.credit) || 
              (row.orderType == 4 && workerSalereturn.credit));
            if (credit && cashReceivable.list) { // 挂账
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    if (parseFloat(row.leftReceivable) <= 0) {
                      this.showDialog('该工单金额为0，不能挂账。', false, '');
                    } else {
                      this.statementNo = row.statementNo;
                      this.checkType(row.orderType);
                      this.showDialog('工单挂账', true, '该工单确定挂账？');
                    }
                  }
                }
              }, '挂账'));
            }
          }

          let print = ((row.orderType == 1 && workerList.print) || 
            (row.orderType == 3 && workerCleanout.print) || 
            (row.orderType == 2 && workerSparepart.print) || 
            (row.orderType == 4 && workerSalereturn.print));
          if (print) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  if (row.orderType === '2') {
                    this.$refs.salePrint.openPrint(row.statementNo, this.setStatus(row.workStatus, row.payStatus));
                  } else if (row.orderType === '1') {
                    this.$refs.print.openPrint(row.statementNo);
                  } else {
                    this.$refs.cleanPrint.openPrint(row.statementNo);
                  }
                }
              }
            }, '打印'));
          }
          if (elms.length == 0) return h("div", "--");
          return elms;
        }
      }
    ];

    return {
      queryShow: false, // 是否收起筛选，默认收起
      orderType: '', // 工单类型 '1': '维修单','2': '销售单', '3': '洗美单'
      formData: {},
      statementNo: '',
      content: '该工单确定挂账？',
      title: '工单挂账',
      showCancel: true,
      inputData: [
        { 
          type: 'text', 
          key: 'plateNo', 
          label: '车牌号', 
          holder: '输入车牌号' 
        },
        { 
          type: 'text', 
          key: 'vehicleOwner', 
          label: '名称', 
          holder: '输入名称' 
        },
        { 
          type: 'text', 
          key: 'ownerMobile', 
          label: '手机号', 
          holder: '输入手机号' 
        },
        // { 
        //   type: 'select', 
        //   key: 'workStatus', 
        //   label: '工单状态', 
        //   holder: '选择工单状态',
        //   clearable: true,
        //   data: cashWorkStatus
        // }
      ],
      columns
    }
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  methods: {

    checkType (type) {
      switch (type) {
        case '1':
          this.orderType = 'worker';
          break;
        case '2': 
          this.orderType = 'sparepart';
          break;
        case '3':
          this.orderType = 'cleanout';
          break;
        default:
          break;
      }
      return this.orderType;
    },

    setStatus (workStatus, payStatus) {
      let status;
      if (workStatus === '1') status = 0; // 待出库
      if (workStatus === '2' && payStatus === '1') status = 1; // 待结算
      if (workStatus === '2' && payStatus === '3') status = 2; // 已挂账
      if (workStatus === '2' && payStatus === '2') status = 3; // 已完成
      return status;
    },

    getWorkStatus (workStatus, orderType) {
      let str = '';
      switch (workStatus) {
        case '1':
          if (orderType === '2') {
            str = '待出库';
          } else {
            str = '待施工';
          }
          break;
        case '2':
          str = '待结算';
          break;
        default:
          break;
      }

      return str;
    },

    showDialog (title, cancel, content) {
      this.content = content || '';
      this.title = title;
      this.showCancel = cancel;
      this.$refs.remindDialog.openModal();
    },

    getFormData (formData) {
      this.formData = formData;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },

    remindConfirm () {
      if (this.showCancel) {
        let request = '';
        switch (this.orderType) {
          case 'worker':
            request = 'workCredit';
            break;
          case 'sparepart': 
            request = 'saleCredit';
            break;
          case 'cleanout':
            request = 'careCredit';
            break;
          default:
            break;
        }
        const payload = {
          params: {
            statementNo: this.statementNo
          },
          request: request
        }

        this.$store.dispatch({
          type: 'toWorkOpt',
          payload
        }).then((res) => {
          if (res.code === '0') {
            this.$Message.success('操作成功');
            this.$refs.remindDialog.onCancel();
            this.$router.push('/cash/receivable');
          }
        }).catch((err) => {
          this.$store.commit('REQUEST_ERROR', { err });
        });
      } else {
        this.$refs.remindDialog.onCancel();
      }
    },
  },
}
</script>
