<template>
  <!-- 配件出库 -->
  <div>
    <w-table
      ref="table"
      :auto-init="false"
      request="outputList"
      :formData="formData"
      :params="params"
      :columns="columns"
      :tableData="tableData">
    </w-table>
    <print ref="print"></print>
  </div>
</template>

<script>
import "@/styles/views/inventory/output-list.less";
import { mapGetters } from 'vuex';
import { outputStatus, outputWorkerType, getObj } from '@/store/json/default';
import { formatTime } from "@/assets/js/utils";
import print from "../print";
export default {
  components: { print },
  props: {
    isSelfStore: {
      type: Boolean,
      default: true
    }
  },
  data () {
    let tabList = this.$permission.getPermissionTab('inventoryOutputList');
    let tabIndex = tabList.findIndex(elm => elm.path === this.$route.path);
    let permissionData = this.$permission.data.inventoryOutput;
    const that = this
    let columns = [
      { title: '序号', type: 'index', width: 50 },
      { title: '出库单号', key: 'stockOutNo', minWidth: 140 },
      { 
        title: '工单号', 
        key: 'statementNo', 
        minWidth: 180,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || "--");
        }
      },
      { 
        title: '车牌号', 
        key: 'plateNo', 
        minWidth: 100,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || "--");
        }},
      { title: '出库数量', key: 'totalQuantity', width: 80 },
      { title: '出库总额', key: 'totalRetailSales', width: 80 },
      { 
        title: '出库状态', 
        width: 80,
        key: 'stockOutStatus',
        render: (h, { row, column }) => {
          return h('div', getObj(outputStatus)[row[column.key]]);
        }
      },
      { 
        title: '出库类型', 
        width: 80,
        key: 'orderType',
        render: (h, { row, column }) => {
          return h('div', getObj(outputWorkerType)[row[column.key]] || "--");
        }
      },
      { 
        title: '操作时间', 
        width: 150,
        key: 'updatedAt', 
        sortable: 'custom',
        sortType: 'desc',
        render: (h, { row }) => {
          return h('div', formatTime(row.updatedAt, "yyyy-MM-dd HH:mm:ss"));
        } 
      },
      { 
        title: '负责人', 
        width: 80,
        key: 'createdBy',
        render: (h, { row, column }) => {
            let user = this.userList.find(elm => elm._id == row.billUserId);
            return h('div', user ? user.username : "--");
        }
      },
      { 
        title: '操作',
        width: 160,
        render: (h, { row }) => {
          let elms = [];
          // 已退料状态且出库状态为2的时候才会显示按钮
          if (permissionData.confirm && !row.isAffirmRefund && row.stockOutStatus == '2'&& that.isSelfStore ) {
            elms.push(h('Button', {
              props: { type: 'text' },
              style: { marginRight: "10px" },
              on: {
                click: () => {
                  this.$store.dispatch({
                    type: "actionPost",
                    name: "updateIsAffirm",
                    params: {
                      id: row.stockOutId,
                      isAffirmRefund: true,
                    }
                  }).then(res => {
                    if (res.code == 0) {
                      this.$Message.success({
                        content: "退料成功",
                        onClose: () => {
                          row.isAffirmRefund = true;
                        }
                      });
                    } else {
                      this.$Message.error("退料失败");
                    }
                  }).catch(err => {
                    this.$Message.error("退料失败");
                    console.log(err);
                  });
                }
              }
            }, '确认退料'));
          }
          if (permissionData.check) {
            elms.push(h('Button', {
              props: { type: 'text' },
            style: { marginRight: "10px" },
              on: {
                click: () => {
                  this.$router.push('/inventory/output/detail/' + row.stockOutNo);
                }
              }
            }, '查看'));
          }
          if (permissionData.print) {
            elms.push(h('Button', {
              props: { type: 'text' },
              on: {
                click: () => {
                  this.$refs.print.openPrint(row.stockOutNo);
                }
              }
            }, '打印'));
          }
          return elms;
        }
      }
    ];
    if (!permissionData.confirm && !permissionData.check && !permissionData.print) columns.pop();
    return {
      permissionData,
      tabList,
      tabIndex,
      userList: [],
      params: {
        sortOrder: '-1',
        orderBy: 'stockOutDate'
      }, // 除筛选表单外的参数 
      formData: {
        stockOutNo: ""
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
