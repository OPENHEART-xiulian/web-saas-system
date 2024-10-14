<template>
  <w-table
    ref="table"
    request="customerAnalyzeConsumeCustomer"
    :params="params"
    :columns="columns"
    :tableData="tableData">
  </w-table>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { clientType, getLabel } from '@/store/json/default';
// import { formatTime } from '@/assets/js/utils';
export default {
  data () {
    let permissionData = this.$permission.data.customer;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { 
        title: '客户编号', 
        key: 'customerCode',
        width: 150
      },
      { 
        title: '客户名称', 
        key: 'name',
        minWidth: 120,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || '--');
        } 
      },
      { 
        title: '联系方式', 
        key: 'mobile',
        width: 130,
        render: (h, { row, column }) => {
          return h('div', row[column.key] || '--');
        } 
      },
      { 
        title: '客户类型', 
        key: 'customerType',
        width: 100,
        render: (h, { row }) => {
          return [getLabel(row.customerType, clientType)];
        }
      },
      { 
        title: '客户标签', 
        key: 'tagList',
        minWidth: 160,
        render: (h, { row, column }) => {
          if (!row[column.key]) {
            return ['--']
          }
          let tagList = row[column.key].map(elm => elm.name);
          return h('div', tagList.join(' / ') || '--');
        }
      },
      { 
        title: '消费次数', 
        key: 'consumptionCount', 
        width: 120
      },
      { 
        title: '消费总额', 
        key: 'totalCost', 
        width: 120
      },
      { 
        title: '车辆数量', 
        key: 'vehicleCount', 
        width: 120
      },
      { 
        title: '操作',
        width: 80,
        render: (h, { row }) => {
        let elms = [];
          elms.push(h('Button', {
            props: { type: 'text' },
            on: {
              click: () => {
                this.$router.push('/customer/detail/' + row.customerId);
              }
            }
          }, '查看'));
          return elms;
        }
      }
    ];
    if (!permissionData.check) columns.pop();
    return {
      params: this.$route.query,
      permissionData,
      columns,
    }
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData'
    })
  },
}
</script>
