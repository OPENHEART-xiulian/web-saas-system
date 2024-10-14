<template>
  <!-- 配件出库明细 -->
  <div>
    <w-table
      ref="table"
      :auto-init="false"
      request="outUsedParts"
      :formData="formData"
      :params="params"
      :columns="columns"
      :tableData="tableData">
    </w-table>
  </div>
</template>

<script>
import "@/styles/views/inventory/output-list.less";
import { mapGetters } from 'vuex';
import { outputStatus, outputWorkerType, getObj } from '@/store/json/default';
import { formatTime } from "@/assets/js/utils";
export default {
  data () {
    let tabList = this.$permission.getPermissionTab('inventoryOutputList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    let permissionData = this.$permission.data.inventoryOutputInfo;
    let inventoryOutput = this.$permission.data.inventoryOutput;
    let columns = [
      { title: '序号', type: 'index', width: 50 },
      { 
        title: '原厂编码', 
        key: 'partFactoryNo',
        minWidth: 100,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || '--');
        } 
      },
      { title: '配件名称', key: 'partName', minWidth: 120 },
      { title: '出库数量', key: 'usedQuantity', minWidth: 80 },
      { title: '出库总额', key: 'retailPrice', minWidth: 80 },
      { title: '车牌号', key: 'plateNo', minWidth: 100 },
      { title: '出库单号', key: 'stockOutNo', minWidth: 140 },
      { 
        title: '供应商', 
        key: 'supplierStr', 
        minWidth: 80,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || '--');
        }  
      },
      { 
        title: '出库状态', 
        minWidth: 80,
        key: 'stockOutStatus',
        render: (h, { row }) => {
          return h('div', getObj(outputStatus)[row.stockOutStatus]);
        }
      },
      { 
        title: '出库类型', 
        minWidth: 80,
        key: 'orderType',
        render: (h, { row, column }) => {
          return h('div', getObj(outputWorkerType)[row[column.key]] || "--");
        }
      },
      { 
        title: '操作时间', 
        minWidth: 160,
        key: 'stockOutDate', 
        sortable: 'custom',
        sortType: 'desc',
        render: (h, { row }) => {
          return h('div', row.stockOutDate);
        } 
      },
      { 
        title: '调拨负责人', 
        width: 80,
        key: 'createdBy',
        render: (h, { row, column }) => {
          let user = this.userList.find(elm => elm._id == row.billUserId);
          return h('div', user ? user.username : "--");
        }
      },
      { 
        title: '操作',
        width: 70,
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push('/inventory/output/detail/' + row.stockOutNo);
                }
              }
            }, '查看')
          ])
        }
      }
    ];
    if (!permissionData.check) columns.pop();
    return {
      inventoryOutput,
      tabList,
      tabIndex,
      userList: [],
      params: {
        sortOrder: '-1',
        orderBy: 'stockOutDate'
      }, // 除筛选表单外的参数 
      formData: {
        partName: ""
      },
      columns
    };
  },
  
  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  created () {
    this.getData();
  },

  methods: {
    async getData () {
      let data = await this.$store.dispatch({
        type: "getBillUsersList"
      });
      this.userList = data;
      this.$refs.table.init();
    },

    tabChange (index, data) {
      this.$router.push(data.path);
    },
    search () {
      this.$refs.table.init();  
    },
  }
};
</script>
