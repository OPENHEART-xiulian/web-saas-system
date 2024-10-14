<template>
  <!-- 员工产值详情 -->
  <div class="perf-detail">
    <saas-bread title="员工产值详情">
      <template slot="actions">
        <Button type="default" @click="goBack">返回</Button>
      </template>
    </saas-bread>
    <div class="detail-top">
      <div class="top-head">
        <img
          :src="userInfo.avatar ? imgUrl + userInfo.avatar : '/images/icon_user_gray.png'"
          alt="员工头像"
        >
      </div>
      <div class="top-content">
        <div class="top-content__item">
          <p class="text">员工姓名</p>
          <p class="name">{{ userInfo.userName || '--' }}</p>
        </div>
        <div class="top-content__item">
          <p class="text">职位名称</p>
          <p class="name">{{ isRoot ? '店长' : (userInfo.jobTitle || '--')}}</p>
        </div>
        <div class="top-content__item">
          <p class="label">工作年限</p>
          <p class="name">{{ isRoot ? '--' : (userInfo.workSeniority || '0')}}</p>
        </div>
      </div>
    </div>
    
    <div class="detail-content">
      <div class="content-head">
        <RadioGroup class="content-head__item" v-model="formData.category" type="button" @on-change="onOrderChange">
          <Radio v-for="(item, index) in orderList" :key="index" :label="item.value">{{item.name}}</Radio>
        </RadioGroup>
        <RadioGroup class="content-head__item" v-model="formData.range" type="button" @on-change="onRadioChange">
          <Radio v-for="(item, index) in rangeList" :key="index" :label="item.value">{{item.name}}</Radio>
        </RadioGroup>
        <div class="content-head__item">
          <DatePicker v-model="formData.start" type="date" placeholder="开始时间" @on-change="onPickerChange" style="width: 140px"></DatePicker> -
          <DatePicker v-model="formData.end" type="date" placeholder="结束时间" @on-change="onPickerChange" style="width: 140px"></DatePicker>
        </div>
      </div>
      <div class="content-statis">
        <div v-for="(item, index) in headList" :key="index" class="content-statis__item">
          <p class="label">{{item.name}}</p>
          <p class="value">{{summary[item.value] || 0}}</p>
        </div>
      </div>
      <w-table
        ref="table"
        class="content-table"
        :request="tableRequest"
        :params="params"
        :columns="columns"
        :tableData="tableData"
        :formData="formData"
      >
      </w-table>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { getUri } from '@/https/api'
import { formatTime, storage } from '@/assets/js/utils';
import { workType, getLabel } from '@/store/json/default'
export default {
  data () {
    let subStoreId = this.$route.query.subStoreId;
    return {
      isRoot: false,
      imgUrl: getUri('checkImg'),
      orderList: [
        { 
          name: '工单开单', 
          value: 'bill', 
          listKey: 'bills',
          head: [
            { name: '开单数量', value: 'amount' },
            { name: '开单数量占比', value: 'percentage' },
            { name: '工单总额', value: 'money' }
          ],
          columns: [
            { title: '序号', type: 'index', width: 65 },
            { 
              title: '客户名称', 
              key: 'customerName',
              render: (h, {row, column}) => {
                return [row[column.key] || '匿名用户'];
              }
            },
            { 
              title: '车牌号码', 
              key: 'plateNo',
              render: (h, {row, column}) => {
                return [row[column.key] || '--'];
              }
            },
            { title: '工单号', key: 'statementNo' },
            { 
              title: '工单类型', 
              key: 'orderType',
              render: (h, {row, column}) => {
                return [getLabel(row[column.key], workType)];
              }
            },
            { title: '工单总额', key: 'totalMoney' },
            { 
              title: '开单时间',
              key: 'createdAt',
              render: (h, {row, column}) => {
                return [formatTime(row[column.key], 'yyyy-MM-dd HH:mm:ss')];
              }
            },
            { 
              title: '操作', 
              width: 80,
              render: (h, {row}) => {
                return h('i-button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: () => {
                      let data = workType.find(elm => elm.value === row.orderType);
                      this.$router.push(`/workorder/${data.pathType}/detail/${row.statementNo}`);
                    }
                  }
                }, '查看工单');
              } 
            },
          ]
        },
        { 
          name: '服务项目', 
          value: 'serviceProject',
          listKey: 'serviceProjects',
          head: [
            { name: '项目数量', value: 'amount' },
            { name: '项目数量占比', value: 'percentage' },
            { name: '项目总额', value: 'money' }
          ],
          columns: [
            { title: '序号', type: 'index', width: 65 },
            { 
              title: '客户名称', 
              key: 'customerName',
              render: (h, {row, column}) => {
                return [row[column.key] || '匿名用户'];
              }
            },
            { 
              title: '车牌号码', 
              key: 'plateNo',
              render: (h, {row, column}) => {
                return [row[column.key] || '--'];
              }
            },
            { title: '工单号', key: 'statementNo' },
            { title: '项目数量', key: 'projectAmount' },
            { title: '项目总额', key: 'totalMoney' },
            { 
              title: '开单时间',
              key: 'createdAt',
              render: (h, {row, column}) => {
                return [formatTime(row[column.key], 'yyyy-MM-dd HH:mm:ss')];
              }
            },
            { 
              title: '操作', 
              width: 80,
              render: (h, {row}) => {
                return h('i-button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: () => {
                      let data = workType.find(elm => elm.value === row.orderType);
                      this.$router.push(`/workorder/${data.pathType}/detail/${row.statementNo}`);
                    }
                  }
                }, '查看工单');
              } 
            },
          ]
        },
        { 
          name: '配件销售', 
          value: 'partSale',
          listKey: 'partSales',
          head: [
            { name: '销售工单数', value: 'amount' },
            { name: '销售工单数占比', value: 'percentage' },
            { name: '销售总额', value: 'money' }
          ],
          columns: [
            { title: '序号', type: 'index', width: 65 },
            { 
              title: '客户名称', 
              key: 'customerName',
              render: (h, {row, column}) => {
                return [row[column.key] || '匿名用户'];
              }
            },
            { 
              title: '车牌号码', 
              key: 'plateNo',
              render: (h, {row, column}) => {
                return [row[column.key] || '--'];
              }
            },
            { title: '工单号', key: 'statementNo' },
            { title: '配件数量', key: 'partAmount' },
            { title: '销售总额', key: 'totalMoney' },
            { 
              title: '开单时间',
              key: 'createdAt',
              render: (h, {row, column}) => {
                return [formatTime(row[column.key], 'yyyy-MM-dd HH:mm:ss')];
              }
            },
            { 
              title: '操作', 
              width: 80,
              render: (h, {row}) => {
                return h('i-button', {
                  props: {
                    type: 'text'
                  },
                  on: {
                    click: () => {
                      let data = workType.find(elm => elm.value === row.orderType);
                      this.$router.push(`/workorder/${data.pathType}/detail/${row.statementNo}`);
                    }
                  }
                }, '查看工单');
              } 
            },
          ]
        },
      ],
      rangeList: [
        { name: '今日', value: 'today' },
        { name: '昨日', value: 'yesterday' },
        { name: '本周', value: 'thisWeek' },
        { name: '本月', value: 'thisMonth' },
        { name: '全部', value: 'all' }
      ],
      params: {
        userId: this.$route.query.id,
        subStoreId: subStoreId,
      },
      formData: {
        category: 'bill',
        range: 'today',
        start: '',
        end: ''
      },
      userInfo: {
        userName: '',
        avatar: '', // 员工头像
        workSeniority: '', // 工作年限
        roleName: '' // 岗位名称
      },
      requestApi: {
        bill: 'staffOutputsDetailBill',
        serviceProject: 'staffOutputsDetailService',
        partSale: 'staffOutputsDetailPart'
      },
      summary: {},
      // tableData: []
    }
  },

  watch: {
    tableData (to) {
      let cateItem = this.orderList.find(
        elm => elm.value === this.formData.category
      )
      this.tableList = to[cateItem.listKey]
    },

    $route (to) {
      this.$destroy();
    }
  },

  computed: {
    columns () {
      let item = this.orderList.find(elm => elm.value === this.formData.category);
      return item.columns;
    },
    headList () {
      let item = this.orderList.find(elm => elm.value === this.formData.category);
      return item.head;
    },
    tableRequest () {
      return this.requestApi[this.formData.category]
    },
    ...mapGetters({
      tableData: 'getTableData'
    })
  },

  mounted () {
    this.onOrderChange(this.orderList[0].value)
    this.getUserInfo()
  },

  methods: {
    goBack () {
      this.$router.go(-1);
      this.$destroy();
    },
    searchFormat (formData) {
      formData.range = this.formData.range
      formData.start = this.formData.start
      formData.end = this.formData.end
      // formData.category = this.formData.category
    },

    onOrderChange (v) {
      this.search()
    },

    onRadioChange () {
      this.formData.start = ''
      this.formData.end = ''
      this.search()
    },

    onPickerChange () {
      if (this.formData.start === '' && this.formData.end === '') {
        this.formData.range = this.rangeList[0].value
      } else {
        this.formData.range = ''
      }
      this.search()
    },

    search () {
      this.$nextTick(() => {
        this.getSummary()
        this.$refs.table.init()
      })
    },

    async getUserInfo () {
      let res = await this.$store.dispatch({
        type: 'actionGet',
        name: 'staffOutputsUserInfo',
        params: this.params
      })
      this.userInfo = res.data.userInfo
      let user = storage.get('USER');
      this.isRoot = user.isRoot && this.userInfo._id === user.userId;
    },

    async getSummary () {
      let res = await this.$store.dispatch({
        type: 'actionGet',
        name: 'staffOutputsSummary',
        params: Object.assign({}, this.formData, this.params)
      })
      this.summary = res.data
      if (this.summary.storeAmount == 0) this.summary.percentage = '0%';
      else {
        this.summary.percentage =
          ((this.summary.amount / this.summary.storeAmount) * 100).toFixed(2) + '%'
      }
    }
  }
}
</script>

<style lang="less">
.perf-detail {
  .detail-top {
    background: white;
    text-align: center;
    padding: 20px;
    margin-bottom: 20px;
    .top-head {
      width: 100px;
      height: 100px;
      margin: 0 auto 20px;
      border-radius: 50%;
      overflow: hidden;
      background: #fafafa;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .top-content {
      display: flex;
      justify-content: center;
      &__item {
        margin: 0 20px;
        font-size: 14px;
        .name {
          color: #332e29;
          margin-top: 5px;
        }
      }
    }
  }

  .detail-content {
    background: white;
    padding: 20px;
    .content-head {
      display: flex;
      margin-bottom: 20px;
      align-items: center;
      &__item {
        display: inline-block;
        width: auto;
        margin-right: 20px;
        &.ivu-select {
          width: 200px;
        }
      }
    }

    .content-statis {
      background: #fafafa;
      display: flex;
      justify-content: space-between;
      &__item {
        width: 33%;
        text-align: center;
        padding: 25px 0;
        .label {
          color: #888;
          font-size: 14px;
        }
        .value {
          margin-top: 10px;
          font-size: 18px;
          color: #332e29;
        }
      }
    }
  }

  .content-table {
    margin-top: 20px;
    padding: 0;
    box-shadow: none;
  }
}
</style>
