<template>
  <!-- 客户管理 -->
  <div class="customer-list">
    <saas-bread title="客户管理">
      <template slot="actions">
        <div class="flex ac" >
          <Button v-if="permissionData.import" type="default" @click="openUploadDialog">批量导入</Button>
          <Button v-if="permissionData.create" type="error" @click="toAdd">
            <i class="iconfont icon-xinzeng"></i>
            <span>新增客户</span>
          </Button>
          <saas-store-select v-model="isSelfStore" @on-change="storeChange"/>
        </div>
      </template>
    </saas-bread>

    <top-box tip="统计数据趋势实时更新，当天晚上12点恢复为0"></top-box>
    <div class="screen-top">
      <RadioGroup v-model="type" type="button" @on-change="changeType">
        <Radio :label="item.value" 
          v-for="item in typeList"
          :key="item.value">{{item.name}}</Radio>
      </RadioGroup>
      <i-input v-model="filter" placeholder="输入客户名称 / 联系电话 / 车牌号搜索">
        <span slot="append" @click="toSearch">搜索</span>
      </i-input>
      <Dropdown trigger="click" @on-click="exportData" style="float: right;margin-left: 10px">
        <Button type="error" style="display: flex;align-items: center">
          导出
          <i class="iconfont icon-sanjiaoxing-xia"></i>
        </Button>
        <DropdownMenu slot="list">
          <!-- <DropdownItem name="pdf">PDF</DropdownItem> -->
          <DropdownItem name="csv">CSV</DropdownItem>
          <DropdownItem name="excel">Excel</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <span class="screen-btn" @click="toggleForm">{{formShow ? '隐藏' : '展开'}}筛选条件
        <Icon :type="formShow ? 'arrow-up-b' : 'arrow-down-b'"></Icon>
      </span>
    </div>
    <search-form 
      v-show="formShow" 
      :inputData="inputData"
      @form-data="getFormData">
    </search-form>
    <w-table
      ref="table"
      request="shareClientList"
      :operate="permissionData.delete"
      :columns="columns"
      :tableData="tableData"
      :formData="formData"
      @del-all="delAll">
    </w-table>
    <remind-dialog 
      ref="remindDialog"
      title="删除客户"
      :content="delContent"
      @on-ok="delConfirm">
    </remind-dialog>
    <upload-dialog 
      v-if="permissionData.import"
      ref="uploadDialog" 
      templateName="批量导入客户模板.xlsx"
      :action="action"
      @on-cancel="search">
    </upload-dialog>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import topBox from './top-box';
import remindDialog from '@/components/dialog/remind-dialog';
import UploadDialog from '@/components/dialog/upload-dialog';
import { clientType, getObj } from '@/store/json/default';
import {getUri,Customer_List_EXPORT} from '@/https/api.js';
import '@/styles/views/customer/customer-list.less';

export default {
  data () {
    let permissionData = this.$permission.data.customer;
    let width = 110;
    if (!permissionData.check || !permissionData.delete) width = 70;
    let columns = [
      { type: 'selection', width: 65 },
      { 
        title: '客户编号', 
        key: 'customerCode',
        width: 150
      },
      { 
        title: '客户名称', 
        key: 'name',
        minWidth: 120
      },
      { 
        title: '联系方式', 
        key: 'mobile',
        width: 130,
        render: (h, { row }) => {
          return h('div', row.mobile || '--');
        } 
      },
      { 
        title: '客户类型', 
        key: 'customerType',
        width: 100,
        render: (h, { row }) => {
          return h('div', getObj(clientType)[row.customerType]);
        }
      },
      { 
        title: '客户标签', 
        key: 'tagList',
        minWidth: 160,
        render: (h, { row }) => {
          return h('div', this.getTagString(row.tagList) || '--');
        }
      },
      // { 
      //   title: '客户来源', 
      //   key: 'leftReceivable', 
      //   width: 100
      // },
      { 
        title: '消费次数', 
        key: 'consumptionCount', 
        width: 120,
        sortable: 'custom'
      },
      { 
        title: '消费总额', 
        key: 'totalCost', 
        width: 120,
        sortable: 'custom'
      },
      { 
        title: '车辆数量', 
        key: 'vehicleCount', 
        width: 120,
        sortable: 'custom'
      },
      { 
        title: '上次消费时间', 
        key: 'lastConsumeAt', 
        width: 170,
        render: (h, { row }) => {
          return h('div', row.lastConsumeAt || '--');
        }
      },
      { 
        title: '操作',
        width: width,
        fixed: 'right',
        render: (h, { row }) => {
          let elms = [];
          if (permissionData.check) {
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$router.push({path:"/customer/detail/"+ row.customerId,query:{storeId :this.formData.storeId||this.$storage.get("USER").storeId,isSelfStore:this.isSelfStore}} );
                }
              }
            }, '查看'));
          }

          if (permissionData.delete&&this.isSelfStore) {
            if (elms.length) elms.push(h('span', ' | '));
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.delContent = '确认要删除这1个客户吗？';
                  this.selection = [row.customerId];
                  this.$refs.remindDialog.openModal();
                }
              }
            }, '删除'));
          }
          return elms;
        }
      }
    ];
    if (!permissionData.delete) columns.shift();
    if (!(permissionData.check || permissionData.delete)) columns.pop();
    return {
      permissionData,
      formShow: false,
      type: '', 
      filter: '', // 搜索
      formData: {},
      delContent: '',
      selection: [],
      action: getUri('clientUpload'),
      typeList: [
        { name: '全部', value: '' },
        { name: '个人', value: 'personal' },
        { name: '单位', value: 'company' }
      ],
      inputData: [
        { 
          type: 'select', 
          key: 'customerTagId', 
          label: '客户标签', 
          clearable: true,
          data: []
        },
        // { 
        //   type: 'text', 
        //   key: 'vehicleOwner', 
        //   label: '客户来源', 
        //   data: []
        // },
        { 
          type: 'number', 
          key1: 'consumptionCountFrom', 
          key2: 'consumptionCountTo',
          label: '消费次数'
        },
        { 
          type: 'money', 
          key1: 'totalCostFrom', 
          key2: 'totalCostTo',
          label: '消费总额' 
        }
      ],
      columns,
      isSelfStore:true,
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetCustomerTagList'
    })
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      list: 'getCustomerTagList'
    })
  },

  watch: {
    list (value) {
      if (value) {
        const arr = [];
        value.forEach((item) => {
          arr.push({
            label: item.name,
            value: item._id
          })
        })

        this.inputData[0].data = arr;
      }
    }
  },

  methods: {
    exportData(type) {
      const params = this.formData;
      const url = Customer_List_EXPORT + '?token=' + this.$storage.get('TOKEN') +'&t=' + type;
      let string = '';
      for (let i in params) {
        if (params[i]) {
          string = string + '&' + i + '=' + params[i];
        }
      }
      window.location.href = url + string;
    },
    storeChange(value){
      this.formData.storeId=value;
      this.search();
    },
    search () {
      this.$refs.table.init();
    },

    openUploadDialog () {
      this.$refs.uploadDialog.openModal();
    },

    toAdd () {
      this.$router.push('/customer/form/create');
    },

    getFormData (formData) {
      this.formData = formData;
      this.formData.customerType = this.type;
      this.formData.filter = this.filter;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },
    
    toggleForm () {
      this.formShow = !this.formShow;
    },

    changeType (value) { // 点击客户类型按钮
      this.formData.customerType = value;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },

    toSearch () { // 点击搜索
      this.formData.filter = this.filter;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },

    getTagString (value) { // 拼接标签
      let str = '';
      if (value) {
        value.forEach((item, index) => {
          if (index) {
            str = str + ' / ' + item.name;
          } else {
            str = item.name;
          }
        });
      }
      return str;
    },

    delAll (selection) { // 批量删除
      const arr = [];
      selection.forEach((item) => {
        arr.push(item.customerId);
      });
      this.selection = arr;
      this.delContent = '确认要删除所选客户吗？';
      this.$refs.remindDialog.openModal();
    },

    delConfirm () { // 删除客户请求
      this.$store.dispatch({
        type: 'toDelClient',
        params: {
          customerIdList: this.selection
        }
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('删除成功');
          this.$refs.remindDialog.onCancel();
          this.$refs.table.init();
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    }
  },

  components: { topBox, remindDialog, UploadDialog }
}
</script>

<style lang="less" scoped>
  /deep/ .ivu-table-fixed-right {
    box-shadow: none;
    &::before {
      display: none;
    }
  }
</style>
