<template>
  <div>
    <div class="searchResult_info">共查询到 {{this.tableTotal}} 个相关结果：<span style="color:#ff9933">{{this.searchText}}</span> </div>
    <w-table
      class="car-table"
      ref="table"
      request="customerVehicleList"
      :params=params
      :tableData="tableData"
      :columns="columns"
    >
    </w-table>
  </div>

</template>
<script>
import { mapGetters, mapState } from 'vuex'
import { GET_BRAND_LOGO } from '@/https/api';
import { formatTime } from '@/assets/js/utils';
export default {
  data () {
    let permiss = this.$permission.data.customerVehicle;
    let columns = [
      { title: '序号', type: 'index', width: 65 },
      { 
        title: '车牌号', 
        key: 'plateNo',
        className: 'plate-no',
        minWidth: 50,
        render: (h, { row }) => {
          return row.plateNo ? h('span', (row.plateNo)) : h("span", {
            attrs: {
              class: "none"
            }
          }, "暂无车牌号");
        }
      },
      { 
        title: '车型', 
        key: 'vehicleBrand',
        minWidth: 150,
        render: (h, { row }) => {
          return h('div', [
            h('my-img', {
              props: {
                src: GET_BRAND_LOGO + row.brandId
              },
              style: {
                width: '33px',
                height: '33px',
                verticalAlign: 'middle',
                marginRight: '8px'
              }
            }),
            h('span', row.vehicleBrand ? (row.vehicleBrand === '其他品牌' ? row.vehicleBrand : (row.vehicleBrand + ' / ' + row.carSeries + ' / ' + row.carStyle)) : '--')
          ]);
        }
      },
      { title: '消费次数', key: 'consumptionCount', sortable: 'custom' },
      { title: '消费总额', key: 'totalCost', sortable: 'custom' },
      { 
        title: '年检到期时间', 
        key: 'annualSurveyDate',
        sortable: 'custom',
        render: (h, { row }) => {
          return h('div', row.annualSurveyDate || '--');
        }
      },
      { 
        title: '保险到期时间', 
        key: 'compulsoryInsuranceExpireDate', 
        sortable: 'custom',
        render: (h, { row }) => {
          return h('div', (row.compulsoryInsuranceExpireDate && formatTime(row.compulsoryInsuranceExpireDate, 'yyyy-MM-dd')) || '--');
        }
      },
      { 
        title: '客户姓名', 
        key: 'customerName', 
      },
      { 
        title: '操作',
        width: 65,
        render: (h, { row }) => {
          return h('div', permiss.check ? [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push('/customer/car/detail/' + row.vehicleId);
                }
              }
            }, '查看')
          ] : '--')
        }
      }
    ];
    return {
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
