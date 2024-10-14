<template>
  <!-- 配件调拨 -->
  <div>
    <saas-bread title="配件调拨">
      <i class="iconfont icon-bg-wenhao tip" @click="toTip"></i>
      <template slot="actions">
        <div class="flex" style="align-items:center;">
          <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
          <Button v-if="permissionData.create" to="/inventory/allocation/form/create" type="error" >
            <i class="iconfont icon-xinzeng left-icon"></i>
            <span>新建调拨单</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="changeStore"/>
        </div>
      </template>
    </saas-bread>
    
    <!-- 筛选表格 -->
    <saas-query-table
      ref="table"
      api="getComponentAllotList"
      :query-show="queryShow"
      :query-data="inputData"
      :defaultParams="params"
      :columns="columns">
    </saas-query-table>

    <remind-dialog 
      ref="remindDialog"
      :title="dialogData.title"
      :content="dialogData.content"
      :showCancel="dialogData.showCancel"
      :confirmBtn="dialogData.confirmBtn"
      :isGantan="dialogData.isGantan"
      @on-ok="remindOk"
      :loading="btnLoading">
    </remind-dialog>

    <print ref="print"></print>
  </div>
</template>

<script>
import allocationInputs from "@/commons/inputs/allocation-input";          // 筛选表单 -> 配件调拨
import allocationColumns from "@/commons/columns/allocation-column";       // 表格的列 -> 配件调拨

import RemindDialog from '@/components/dialog/remind-dialog';
import print from './print';

export default {
  data () {
    let permissionData = this.$permission.data.inventoryAllocation;
    let n = 0;
    for (const key in permissionData) {
      if (permissionData[key] && key !== 'create') n++;
    }
    let width = 220;
    if (n == 1) width = 70;
    else if (n == 2) width = 100;

    let columns = [
      allocationColumns.allotCode(),                            // 单号
      allocationColumns.createdBy(),                            // 制单人
      allocationColumns.operatedBy(),                           // 调拨人
      allocationColumns.totalQuantity(),                        // 调拨数量
      allocationColumns.createdAt(),                            // 开单时间
      allocationColumns.status(),                               // 状态
      {
        title: '操作',
        width: 200,
        fixed: "right",
        render: (h, { row }) => {
          let elms = [];
          if(this.isSelfStore){
            if (row.status === '0') { 
              if (permissionData.confirm) {
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.curId = row._id;
                      this.dialogData.title = '调拨确认';
                      this.dialogData.content = '确定调拨后将不能编辑，确定调拨吗？';
                      this.dialogData.showCancel = true;
                      this.dialogData.confirmBtn = "确定";
                      this.dialogData.isGantan = true;
                      this.$refs.remindDialog.openModal();
                    }
                  }
                }, '确定'));
              }
  
              if (permissionData.update) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/inventory/allocation/form/' + row._id);
                    }
                  }
                }, '编辑'));
              }
  
              if (permissionData.delete) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.curId = row._id;
                      this.dialogData.title = '作废调拨单';
                      this.dialogData.content = '调拨单作废后将不能恢复，确定作废吗？';
                      this.dialogData.showCancel = true;
                      this.dialogData.confirmBtn = "确定";
                      this.dialogData.isGantan = true;
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
                      this.$router.push('/inventory/allocation/detail/' + row._id);
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
                    this.$refs.print.openPrint(row._id);
                  }
                }
              }, '打印'));
            }
          }else{
            if (row.status === '0') { 

            } else {
              if (permissionData.check) {
                if (elms.length) elms.push(h('span', ' | '));
                elms.push(h('Button', {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/inventory/allocation/detail/' + row._id+"?shareStoreId="+this.params.shareStoreId);
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
                    this.$refs.print.openPrint(row._id ,this.params.shareStoreId);
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
      queryShow: false,
      btnLoading: false,
      dialogData: {
        title: '',
        content: '',
        showCancel: '',
        confirmBtn: '',
        isGantan: true
      },
      curId: '',
      inputData: [
        allocationInputs.allotCode(),          // 单号
        allocationInputs.creatorId(),          // 制单人
        allocationInputs.operatorId(),         // 调拨人
        allocationInputs.status(),             // 状态,
        allocationInputs.createdAtFrom(),      // 开单时间
        allocationInputs.createdAtTo(),        // 结束时间
      ],
      columns,
      isSelfStore:true,
      params:{
        shareStoreId:''
      }
    }
  },

  created () {
    this.getStaffList();
  },

  methods: {
    changeStore(id){
      this.params.shareStoreId = id
      this.$refs.table.init()
    },
    // 获取门店员工列表，设置筛选数据
    async getStaffList () {
      let data = await this.$ajax.getStaffList();
      const arr = data.rows.map(v => ({ label: v.username, value: v.userId }));
      this.inputData[1].data = arr;
      this.inputData[2].data = arr;
      this.staffList = data;
    },
    toTip () {
      this.dialogData.title = '关于配件调拨';
      this.dialogData.content = '配件调拨是指仓库之间的配件相互调配。调拨单是记录配件在同一企业不同仓库之间移动的凭据，将减少调出仓库的库存，增加调入仓库的库存。';
      this.dialogData.showCancel = false;
      this.dialogData.confirmBtn = "我知道了";
      this.dialogData.isGantan = false;
      this.$refs.remindDialog.openModal();
    },

    remindOk () {
      let request = '';
      switch (this.dialogData.title) {
        case '调拨确认': 
          request = 'componentAllotConfirm';
          break;
        case '作废调拨单':
          request = 'componentAllotCancel';
          break;
        default:
          this.$refs.remindDialog.onCancel();
          return;
      }

      this.btnLoading = true;
      this.$store.dispatch({
        type: 'actionPost',
        params: {
          _id: this.curId
        },
        name: request
      }).then((res) => {
        this.btnLoading = false;
        if (res.code === '0') {
          this.$Message.success('操作成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        }
      }).catch((err) => {
        this.btnLoading = false;
      })
    }
  },

  components: { RemindDialog, print }  
}
</script>
