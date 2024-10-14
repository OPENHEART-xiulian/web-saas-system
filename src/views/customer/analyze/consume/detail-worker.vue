<template>
  <w-table
    ref="table"
    request="customerAnalyzeConsumeOrder"
    :params="params"
    :columns="columns"
    :tableData="tableData">
  </w-table>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { repairType, getLabel } from '@/store/json/default';
// import { formatTime } from '@/assets/js/utils';
export default {
  data () {
    let permissionData = this.$permission.data.worker;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { title: '工单号', key: 'statementNo',  minWidth: 195 },
      { title: '客户姓名', key: 'vehicleOwner',  width: 100 },
      { 
        title: '车牌号码', 
        key: 'plateNo',  
        width: 110,
        render: (h, { row }) => {
          return h('div', row.plateNo || '--');
        }
      },
      { 
        title: '工单类型', 
        key: 'repairType',  
        width: 100,
        render: (h, { row }) => {
          return [getLabel(repairType, row.repairType) || '--'];
        }
      },
      { title: '项目总额', key: 'totalItemCost',  width: 100 },
      { title: '配件总额', key: 'totalPartCost',  width: 100 },
      { title: '其他费用', key: 'totalOtherCost',  width: 100 },
      { title: '工单总额', key: 'receivable',  width: 100 },
      { 
        title: '操作',
        width: 90,
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                'click': () => {
                  this.$router.push({ path: '/workorder/' + this.checkType(row.orderType) + '/detail/' + row.statementNo });
                }
              }
            }, '查看工单')
          ])
        }
      }
    ];
    if (!permissionData.admin) columns.pop();
    return {
      params: this.$route.query,
      permissionData,
      columns,
    }
  },

  methods: {
    checkType (type) {
      let orderType = '';
      switch (type) {
        case '1':
          orderType = 'worker';
          break;
        case '2': 
          orderType = 'sparepart';
          break;
        case '3':
          orderType = 'cleanout';
          break;
        default:
          break;
      }
      return orderType;
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },
}
</script>
