<template>
  <!-- 车辆管理 -->
  <div class="car-list">
    <saas-bread title="车辆管理">
      <template slot="actions">
        <div class="flex ac" >
          <saas-store-select v-model="isSelfStore" @on-change="storeChange"/>
        </div>
      </template>
    </saas-bread>
    <p class="top-box box-tip">
      <!-- <Icon type="help-circled"></Icon> -->
      <span>提示：统计数据趋势实时更新，当天晚上12点恢复为0</span>
    </p>
    <div class="top-box">
      <div class="box-item" 
        v-for="item in carStat" 
        :key="item.name">
        <p>{{ item.name }}</p>
        <p>{{ item.count }}</p>
        <p style="color: #59C871;" v-if="item.inc > 0">{{ item.inc }}<i class="iconfont icon-jiantou-shang"></i></p>
        <p v-else-if="item.inc === 0">{{ item.inc }}<i class="iconfont icon-jiantou-you"></i></p>
        <p style="color: #F22D00;" v-else>{{ Math.abs(item.inc) }}<i class="iconfont icon-jiantou-xia"></i></p>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>
    <div class="filter-input screen-top">
      <i-input v-model="filter" 
        placeholder="输入客户名称 / 联系电话 / 车牌号 / 车型搜索">
        <span slot="append" @click="toSearch">搜索</span>
      </i-input>
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
      class="car-table"
      ref="table"
      request="customerVehicleList"
      :columns="columns"
      :tableData="tableData"
      :formData="formData">
    </w-table>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { GET_BRAND_LOGO } from '@/https/api';
import { formatTime, storage } from '@/assets/js/utils';
import '@/styles/views/customer/top-box.less';
import '@/styles/views/customer/car-list.less';

export default {
  data () {
    let permissionData = this.$permission.data.customerVehicle;
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
                minWidth: '33px',
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
        render: (h, { row }) => {
          return h('div', row.annualSurveyDate || '--');
        }
      },
      { 
        title: '保险到期时间', 
        key: 'compulsoryInsuranceExpireDate', 
        render: (h, { row }) => {
          return h('div', (row.compulsoryInsuranceExpireDate && formatTime(row.compulsoryInsuranceExpireDate, 'yyyy-MM-dd')) || '--');
        }
      },
      { 
        title: '客户姓名', 
        key: 'customerName', 
      },
      { 
        title: '联系电话', 
        key: 'mobile',
        render: (h, {row, column}) => {
          return [row[column.key] || '--'];
        }
      },
      { 
        title: '操作',
        width: 65,
        render: (h, { row }) => {
          return h('div', [
            h('Button', {
              props: {
                type: 'text'
              },
              on: {
                click: () => {
                  this.$router.push({path:'/customer/car/detail/' + row.vehicleId,query:{isSelfStore:this.isSelfStore,storeId:this.formData.storeId,customerId:row.customerId}} );
                }
              }
            }, '查看')
          ])
        }
      }
    ];

    if (!permissionData.check) columns.pop();
    return {
      formShow: false,
      permissionData,
      GET_BRAND_LOGO,
      filter: '',
      formData: {
        storeId: storage.get('USER').storeId || ''
      },
      columns,
      inputData: [
        { 
          type: 'select', 
          key: 'customerTagId', 
          label: '客户标签', 
          clearable: true,
          data: []
        },
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
      isSelfStore:true,
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetCarStat'
    })
    this.$store.dispatch({
      type: 'toGetCustomerTagList'
    })
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      carStat: 'getCarStat',
      list: 'getCustomerTagList'
    }),

    ...mapState({ loading: (state) => state.global.isLoading }),
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
    storeChange(value){
      this.formData.storeId=value;
      this.$refs.table.init();
    },
    toSearch () {
      this.formData.filter = this.filter;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },
    
    toggleForm () {
      this.formShow = !this.formShow;
    },

    getFormData (formData) {
      this.formData = formData;
      this.formData.customerType = this.type;
      this.formData.filter = this.filter;
      setTimeout(() => {
        this.$refs.table.init();
      }, 100);
    },
  },
}
</script>
