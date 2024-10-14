<template>
  <div class="payment-wrap">
    <saas-bread title="支付设置">
      <template slot="actions">
        <Button v-if="permissionData.create" type="error" @click="toAdd">
          <i class="iconfont icon-xinzeng"></i>新增支付方式
        </Button>
      </template>
    </saas-bread>
    <w-table
      :operate="permissionData.operation"
      request="paytypeList"
      ref="table"
      :columns="columns"
      :tableData="tableData"
      :selectDisabled="selectDisabled"
      @del-all="delAll">
    </w-table>
    <w-dialog ref="paymentDialog"
      @add-success="addSuccess">
    </w-dialog>
    <remind-dialog 
      ref="remindDialog"
      title="删除支付设置"
      :content="remindContent"
      @on-ok="delConfirm">
    </remind-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import wDialog from '@/components/dialog/payment-dialog';
import remindDialog from '@/components/dialog/remind-dialog';

export default {
  data () {
    let permissionData = this.$permission.data.settingPayment;
    let columns = [
      { type: 'selection', width: 65 },
      { title: '序号', type: 'index' },
      { title: '支付方式', key: 'name' },
      { 
        title: '操作',
        width: 160,
        render: (h, { row }) => {
          return h('div', !Number(row.isDefault) ? [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.optPayment(row.payTypeId, row.status);
                }
              }
            }, row.status === 'enabled' ? '禁用' : '启用'),
            h('span', ' | '),
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.selection = [row.payTypeId];
                  this.remindContent = '确认要删除这1项支付设置吗？';
                  this.$refs.remindDialog.openModal();
                }
              }
            }, '删除')
          ] : '--')
        }
      }
    ];
    if (!permissionData.operation) {
      columns.shift();
      columns.pop();
    }
    return {
      permissionData,
      remindContent: '确认要删除这1项支付设置吗？',
      selection: [],
      selectDisabled: 0,
      columns
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  watch: {
    tableData (value) {
      let count = 0;
      value.forEach((item, index) => {
        if (item.isDefault === '1') {
          this.tableData[index]._disabled = true;
          count++;
        }
      })
      this.selectDisabled = count;
    }
  },

  methods: {
    toAdd () {
      this.$refs.paymentDialog.openModal();
    },

    delAll (selection) {
      const arr = [];
      selection.forEach((item) => {
        arr.push(item.payTypeId);
      });
      this.selection = arr;
      this.remindContent = '确认要删除所选支付设置吗？'
      this.$refs.remindDialog.openModal();
    },

    delConfirm () {
      this.$store.dispatch({
        type: 'toDelPayment',
        params: {
          payTypeIdList: this.selection
        }
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('删除成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        } else {
          this.$Message.warning('删除失败');
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    optPayment (id, status) {
      this.$store.dispatch({
        type: 'toOptPayment',
        payload: {
          params: {
            payTypeId: id,
          },
          status: status
        }
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('操作成功');
          this.$refs.table.init();
        } else {
          this.$Message.warning('操作失败');
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    addSuccess () {
      this.$refs.table.init();
    }
  },

  components: { wDialog, remindDialog }
}
</script>
