<template>
  <div>
    <div class="searchResult_info">共查询到 {{this.tableTotal}} 个相关结果：<span style="color:#ff9933">{{this.searchText}}</span> </div>
    <w-table
      class="car-table"
      ref="table"
      request="clientList"
      :params=params
      :tableData="tableData"
      :columns="columns"
    >
    </w-table>
  </div>

</template>
<script>
import { mapGetters, mapState } from 'vuex'
export default {
  data () {
    let permiss = this.$permission.data.customer;
    let columns = [
      {
        title: '客户编号',
        key: 'customerCode',
        width: 180
      },
      {
        title: '客户名称',
        key: 'name',
        maxWidth: 200
      },
      {
        title: '联系方式',
        key: 'mobile',
        maxWidth: 200,
        render: (h, { row }) => {
          return h('div', row.mobile || '--')
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
        sortable: 'custom'
      },
      {
        title: '消费总额',
        key: 'totalCost',
        sortable: 'custom'
      },
      {
        title: '车辆数量',
        key: 'vehicleCount',
        sortable: 'custom'
      },
      {
        title: '上次消费时间',
        key: 'lastConsumeAt',
        sortable: 'custom',
        minWidth: 170,
        render: (h, { row }) => {
          return h('div', row.lastConsumeAt || '--')
        }
      },
      {
        title: '操作',
        width: 90,
        render: (h, { row }) => {
          let elms = []
          if (permiss.check) {
            elms.push(
              h(
                'Button',
                {
                  props: { type: 'text' },
                  on: {
                    click: () => {
                      this.$router.push('/customer/detail/' + row.customerId)
                    }
                  }
                },
                '查看'
              )
            )
          } else {
            elms.push(
              h(
                'span', '--'
              )
            )
          }

          return elms
        }
      }
    ]
    return {
      permiss,
      columns,
      filter: '',
      formData: {},
      params: {
        filter: ''
      }
    }
  },
  props: {
    searchText: {
      type: String,
      default: ''
    }
  },

  created () {
    this.params.filter = this.searchText
  },

  watch: {
    searchText (nV) {
      if (nV === '') return
      this.params.filter = this.searchText
      this.$refs.table.init()
    }
  },

  computed: {
    ...mapState({ loading: state => state.global.isLoading }),
    ...mapGetters({
      tableData: 'getTableData',
      tableTotal: 'getTableDataTotal'
    })
  },

  methods: {}
}
</script>
