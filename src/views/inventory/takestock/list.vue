<template>
  <!-- 库存盘点 -->
  <div class="deposit-list">
    <saas-bread title="库存盘点">
      <template slot="actions">
        <div class="flex ac" >
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <i-button v-if="permissionData.create" type="error" to="/inventory/takestock/add/create">
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新增盘点单</span>
          </i-button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>
    <search-form 
      ref="form"
      v-show="queryShow" 
      :inputData="inputData"
      @form-data="getFormData"
      :initForm="{
        checkStatus: ''
      }">
    </search-form>
    <w-table
      class="takestock-table"
      ref="table"
      request="takestockList"
      :columns="columns"
      :tableData="tableData"
      :formData="formData"
      :params="params">
    </w-table>
    <remind-dialog 
      ref="remindDialog"
      :title="remindTitle"
      :content="remindContent"
      @on-ok="remindOk">
    </remind-dialog>
    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import RemindDialog from '@/components/dialog/remind-dialog';
import { takeStatus, getObj } from '@/store/json/default';
import { formatTime } from '@/assets/js/utils.js';
import print from './print';

export default {
  components: { RemindDialog, print },
  data () {
    let permissionData = this.$permission.data.inventoryTakestock;
    let n = 0;
    for (const key in permissionData) {
      if (permissionData[key] && key !== 'create') n++;
    }
    let width = 220;
    if (n == 1) width = 70;
    else if (n == 2) width = 100;

    let columns = [
      { title: '序号', type: 'index', width: 64 },
      { title: '盘点单号', key: 'inventoryNo' },
      { title: '创建日期', key: 'created', width: 100, sortable: 'custom', sortType: 'desc' },
      { 
        title: '盘点状态', 
        key: 'checkStatus',
        filters: takeStatus,
        filterMultiple: false,
        filteredValue: [],
        filterRemote: (value) => {
          if (value.length > 0) {
            this.$refs.form.formData.checkStatus = value[0];
            this.formData.checkStatus = value[0];
          } else {
            this.$refs.form.formData.checkStatus = '';
            this.formData.checkStatus = undefined;
          }
          this.$refs.table.init();
        },
        render: (h, { row }) => {
          return h('div', getObj(takeStatus)[row.checkStatus]);
        }
      },
      { title: '盘点数量变化', key: 'totalQuantityChange', width: 140, sortable: 'custom' },
      { 
        title: '总成本变化(元)', 
        key: 'totalCostChange', 
        width: 145, 
        sortable: 'custom',
        render: (h, {row}) => {
          return h('div', Number(row.totalCostChange).toFixed(2))
        }
      },
      { title: '盘点人', key: 'createdBy' },
      { 
        title: '操作',
        width: 220,
        render: (h, { row }) => {
          let elms = [];
          if(!this.isSelfStore){
            if (permissionData.check) {
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.$router.push('/inventory/takestock/check/' + row.inventoryId);
                  }
                }
              }, '查看'));
            }
            if (permissionData.print) {
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.openPrint(row);
                  }
                }
              }, '打印'));
            }
          }else{
            if (row.checkStatus === '0') { 
              if (permissionData.update) {
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/inventory/takestock/add/' + row.inventoryId);
                    }
                  }
                }, '编辑'));
              }
  
              if (permissionData.confirm) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.inventoryId = row.inventoryId;
                      this.remindTitle = '盘点确认';
                      this.remindContent = '盘点确认后，库存将会相应变化，确认盘点？';
                      this.$refs.remindDialog.openModal();
                    }
                  }
                }, '盘点确认'));
              }
  
              if (permissionData.delete) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: () => {
                      this.inventoryId = row.inventoryId;
                      this.remindTitle = '盘点作废';
                      this.remindContent = '确认作废此盘点单？';
                      this.$refs.remindDialog.openModal();
                    }
                  }
                }, '作废'));
              }
            } else {
              if (permissionData.check) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/inventory/takestock/check/' + row.inventoryId);
                    }
                  }
                }, '查看'));
              }
            }
            if (permissionData.print) {
              if (elms.length) elms.push(h('span', ' | '));
              elms.push(h('Button', {
                props: { type: 'text' },
                on: {
                  click: () => {
                    this.openPrint(row);
                  }
                }
              }, '打印'));
            }
          }
          return elms;
        }
      }
    ];

    if (n === 0) columns.pop();
    return {
      permissionData,
      queryShow: false, // 是否收起筛选，默认收起
      inventoryId: '', // 当前选择的盘点单号
      remindTitle: '',
      remindContent: '',
      formData: {},
      params: {
        sortOrder: '-1',
        orderBy: 'created',
        shareStoreId:''
      },
      inputData: [
        { 
          type: 'text', 
          key: 'inventoryNo', 
          label: '盘点单号', 
          holder: '请输入盘点单号' 
        },
        { 
          type: 'select', 
          key: 'checkStatus', 
          label: '盘点状态', 
          holder: '请选择盘点状态',
          clearable: true,
          data: takeStatus
        },
        {
          type: "multipleDate",
          key1: "createdFrom",
          key2: "createdTo",
          // readonly1: false,
          // readonly2: true,
          // disabled2: true,
          label: "创建日期",
          holder1: "开始日期",
          holder2: "结束日期"
        },
        { 
          type: 'select', 
          key: 'operatorId', 
          label: '盘点人', 
          holder: '请选择盘点人',
          clearable: true,
          data: []
        }
      ],
      columns,
      isSelfStore:true
    }
  },

  // beforeRouteEnter (to, from, next) {
  //   if (to.query.refresh) {
  //     to.meta.keepAlive = false;
  //     next(to.path);
  //   } else {
  //     to.meta.keepAlive = true;
  //     next();
  //   }
  // },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  created () {
    this.getStaffList();
  },
  methods: {
    changeStore( id ){
      this.params.shareStoreId = id
      this.$refs.table.init();
    },
    // 获取员工数据
    async getStaffList () {
      const res = await this.$store.dispatch({
        type: 'actionGet',
        name: 'staffList'
      });
      if (res.code === '0') {
        this.inputData[3].data = res.data.rows.map(elm => {
          return {
            value: elm.userId,
            label: elm.username  
          }
        });
      }
    },

    getFormData (formData) {
      // inventoryDateFrom 
      // inventoryDateTo 
      if (formData.createdFrom) formData.createdFrom = formatTime(formData.createdFrom, 'yyyy-MM-dd HH:mm:ss');
      if (formData.createdTo) formData.createdTo = formatTime(formData.createdTo, 'yyyy-MM-dd HH:mm:ss');
      this.formData = formData;
      this.columns[3].filteredValue = formData.checkStatus ? [formData.checkStatus] : [];
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },

    openPrint (data) {
      this.$refs.print.openPrint(data);
    },

    remindOk () {
      let request = '';
      if (this.remindTitle === '盘点确认') {
        request = 'takestockConfirm';
      } else {
        request = 'takestockCancel';
      }

      this.$store.dispatch({
        type: 'toOperateTakestock',
        payload: {
          request: request,
          params: {
            inventoryId: this.inventoryId
          }
        }
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('操作成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    }
  }
}
</script>
