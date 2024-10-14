<template>
  <div class="workorder-detail">
    <saas-bread title="试算单详情">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
        <i-button v-if="print" type="error" @click="openPrint">打印</i-button>
      </template>
    </saas-bread>
    <div class="top">
      <span>试算单号：{{ workDetail.statementNo }}</span>
      <span>开单时间：{{ workDetail.createdAt }}</span>
      <span v-if="workDetail.settlementDate">结算时间：{{ workDetail.settlementDate }}</span>
      <span v-if="workDetail.billUser && workDetail.billUser.userName">开单人：{{workDetail.billUser.userName}}</span>
    </div>
    <div class="content">
      <h4 class="title">客户信息</h4>
      <p
        class="msg"
        v-if="workDetail.vehicleOwner"
      >
        <span>车辆所有人：{{ workDetail.vehicleOwner }}</span>
        <span>联系电话：{{ workDetail.ownerMobile || '无' }}</span>
        <span>送修人姓名：{{ workDetail.repairName || '无' }}</span>
        <span>送修人联系电话：{{ workDetail.repairMobile || '无' }}</span>
      </p>
      <p
        class="msg"
        v-else
      >
        <span>匿名用户</span>
      </p>
    </div>
    <div
      class="content"
      v-if="workDetail.vehicleOwner"
    >
      <h4 class="title">车辆信息</h4>
      <p class="msg">
        <span>车牌号码：{{ workDetail.plateNo }}</span>
        <span class="auto-w">车型品牌：{{ workDetail.vehicleBrand }}<span
            v-if="workDetail.vehicleBrand !== '其他品牌'"
            style="width: auto;"
          >-</span>{{ workDetail.carSeries }} {{ workDetail.carStyle }}</span>
      </p>
      <p class="msg">
        <span>VIN码（车架号）：{{ workDetail.VINCode }}</span>
        <span>发动机号：{{ workDetail.engineNo || '--' }}</span>
        <span>车辆类型：{{ getObj(vehicleType)[workDetail.vehicleType] || '无' }}</span>
      </p>
    </div>
    <div
      class="content"
      v-if="type !== 'sparepart'"
    >
      <h4 class="title">接车信息</h4>
      <p class="msg">
        <span>送修日期：{{ workDetail.deliveryDate | formatTime }}</span>
        <span>送修里程：{{ workDetail.deliveryMileage || '--' }}KM</span>
        <span>维修类型：{{ getObj(repairTypeArr)[workDetail.repairType] || '无' }}</span>
        <span v-if="workDetail.serviceAdvisor && workDetail.serviceAdvisor.userId && billUsers.length>0">服务顾问：{{billUsers.find(item=>item._id===workDetail.serviceAdvisor.userId).username}}</span>
        <span v-if="workDetail.repairFuel">送修油量：{{workDetail.repairFuel}}</span>
        <span class="wd-auto">故障信息：{{ workDetail.description || '无' }}</span>
      </p>
      <div class="msg tag-item">外观问题：{{ appearArr && (appearArr.length > 0 ? '有' : '无') }}
        <div
          class="appear-item"
          v-for="(item, index) in appearArr"
          :key="index"
        >
          <Tag>{{ item.desc }}</Tag>
          <my-img
            v-if="item.imgs"
            :src="getUri('checkImg') + item.imgs"
          ></my-img>
        </div>
      </div>
      <p class="msg tag-item">随车装备：{{ workDetail.stuff && (workDetail.stuff.length > 0 ? '有' : '无') || '无' }}
        <Tag
          v-for="(item, index) in workDetail.stuff"
          :key="index"
        >{{ getObj(vehicleEquipment)[item] }}
        </Tag>
      </p>
      <p class="msg tag-item">功能异常：{{ workDetail.malfunction && (workDetail.malfunction.length > 0 ? '有' : '无') || '无' }}
        <Tag
          v-for="(item, index) in workDetail.malfunction"
          :key="index"
        >{{ getObj(term)[item] }}
        </Tag>
      </p>
    </div>
    <div
      class="content"
      v-if="type !== 'sparepart'"
    >
      <h4 class="title">出厂信息</h4>
      <p class="msg">
        <span>出厂日期：{{ workDetail.factoryDate | formatTime }}</span>
        <span>出厂里程：{{ workDetail.factoryMileage || '--' }}</span>
        <span>质量保证时间：{{ workDetail.warranty || '--' }}日</span>
        <span>质量保证里程：{{ workDetail.warrantyMileage || '--' }}KM</span>
      </p>
    </div>
    <div
      class="content"
      v-if="type !== 'sparepart'"
    >
      <h4 class="title">项目信息</h4>
      <Table
        no-data-text="暂无项目信息"
        :columns="projectColumns"
        :data="workDetail && workDetail.repairItems"
      >
      </Table>
      <p class="total-part">合计：<span class="price">¥ {{ workDetail.totalItemCost }}</span></p>
    </div>
    <div class="content">
      <h4 class="title">配件信息</h4>
      <Table
        no-data-text="暂无配件信息"
        :columns="partsColumns"
        :data="workDetail && workDetail.repairParts"
      >
      </Table>
      <p class="total-part">合计：<span class="price">¥ {{ workDetail.totalPartCost }}</span></p>
    </div>
    <div class="content">
      <h4 class="title">其他费用信息</h4>
      <Table
        no-data-text="暂无其他费用信息"
        :columns="otherColumns"
        :data="workDetail && workDetail.others"
      >
      </Table>
      <p class="total-part">合计：<span class="price">¥ {{ workDetail.totalOtherCost }}</span></p>
    </div>
    <div class="content bottom">
      <div class="bottom-box">
        <p class="price">工单总金额：<span>￥{{ workDetail.receivable }}</span></p>
        <p>
          <template v-if="type !== 'sparepart'">
            <span>工时费￥{{ workDetail.totalItemCost }}</span>
            <span>+</span>
          </template>
          <span>材料费￥{{ workDetail.totalPartCost }}</span>
          <span>+</span>
          <span>其他费用￥{{ workDetail.totalOtherCost }}</span>
        </p>
        <p>+ 税收：￥{{ workDetail.tax }}</p>
        <p>- 抹零：￥{{ workDetail.smallChange }}</p>
        <p>- 优惠：￥{{ workDetail.discountCost }}</p>
        <!-- <p class="price">应收：<span>￥{{ workDetail.receivable }}</span></p> -->
        <p class="price">实收总额：<span>￥{{ workDetail.realCost }}</span></p>
        <p>支付方式：
          <span
            v-for="(item, index) in workDetail.payInfo"
            :key="index"
          >{{ item.name }} ¥{{ item.amount }}
            <span v-if="workDetail.payInfo && workDetail.payInfo.length !== (index + 1)">+ </span>
          </span>
          <span v-if="workDetail.payInfo && workDetail.payInfo.length === 0">--</span>
        </p>
        <p v-if="workDetail.memberCardPayInfo && workDetail.memberCardPayInfo.discount">- 会员卡折扣：{{ Math.round(workDetail.memberCardPayInfo.discount * 1000) / 100 }}折</p>
        <p v-if="workDetail.memberCardPayInfo">- 会员卡支付： ¥{{workDetail.memberCardPayInfo.amount}}</p>
        <!-- <p>找零：￥{{ workDetail.change }}</p> -->
      </div>
    </div>
    <Spin
      fix
      v-if="loading"
    ></Spin>
    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import print from './print'
import { formatTime } from '@/assets/js/utils.js'
import {
  vehicleEquipment,
  term,
  vehicleType,
  appearance,
  repairTypeArr,
  getObj
} from '@/store/json/default'
import mixins from '../components/mixins.js'
import { getUri } from '@/https/api'

import '@/styles/views/workorder/detail.less'

export default {
  mixins: [mixins],
  data () {
    return {
      loading: true,
      workDetail: {},
      print: false,
      getObj,
      getUri,
      vehicleType,
      vehicleEquipment,
      term,
      appearance,
      repairTypeArr,
      id: this.$route.params.id,
      type: this.$route.path.split('/')[2],
      appearArr: [],
      projectColumns: [
        { title: '序号', type: 'index' },
        { title: '维修项目', key: 'name' },
        {
          title: '工时 (人·时)',
          key: 'hours',
          render: (h, { row }) => {
            return h('div', row.hours || '--')
          }
        },
        {
          title: '工时单价 (元/人·时)',
          key: 'price',
          render: (h, { row }) => {
            return h('div', row.price || '--')
          }
        },
        { title: '金额 (元)', key: 'cost' },
        {
          title: '服务技师',
          key: 'cost',
          render: (h, { row }) => {
            return h('div', this.getUsers(row.technicians))
          }
        },
        {
          title: '备注信息',
          key: 'remark',
          render: (h, { row }) => {
            return h('div', row.remark || '无')
          }
        }
      ],
      partsColumns: [
        { title: '序号', type: 'index' },
        {
          title: '配件名称',
          key: 'partName',
          render: (h, { row }) => {
            return h('div', row.partName || row.name || '--')
          }
        },
        { title: '配件编号', key: 'partNo' },
        {
          title: '原厂编码',
          key: 'partFactoryNo',
          render: (h, { row }) => {
            return h('div', row.partFactoryNo ? row.partFactoryNo : '--')
          }
        },
        {
          title: '品牌',
          key: 'brand',
          render: (h, { row }) => {
            return h('div', row.brand ? row.brand : '--')
          }
        },
        { title: '数量', key: 'quantity' },
        { title: '单价 (元)', key: 'retailPrice' },
        { title: '金额 (元)', key: 'cost' }
      ],
      otherColumns: [
        { title: '序号', type: 'index' },
        { title: '项目', key: 'name' },
        { title: '金额 (元)', key: 'cost' }
      ]
    }
  },

  created () {
    this.$store.dispatch('toGetBillUsers')
    let params  = {
      statementNo: this.id
    }
    this.$store.dispatch({
      type: 'actionGet',
      name: 'trialOrderDetail',
      params: params
    }).then((res) => {
      this.workDetail = res.data;
      this.loading = false;
    }).catch(err => {
      this.loading = false;
    })
  },

  methods: {
    openPrint () {
      this.$refs.print.openPrint(this.workDetail)
    },
    getUsers (arr = []) {
      let users = []
      if (arr.length === 0) return
      arr.map(itemc => {
        let name = this.billUsers.find(itemBill => itemBill._id === itemc)
          .username
        users.push(name)
      })
      return users.join(',')
    }
  },

  watch: {
    'workDetail.appearance' (value) {
      if (value) {
        const arr = []
        value.back.forEach((item, index) => {
          arr.push({
            desc: '正后:' + getObj(appearance)[item.desc],
            imgs: item.imgs[0] || ''
          })
        })

        value.front.forEach((item, index) => {
          arr.push({
            desc: '正前:' + getObj(appearance)[item.desc],
            imgs: item.imgs[0] || ''
          })
        })

        value.left.forEach((item, index) => {
          arr.push({
            desc: '左侧:' + getObj(appearance)[item.desc],
            imgs: item.imgs[0] || ''
          })
        })

        value.right.forEach((item, index) => {
          arr.push({
            desc: '右侧:' + getObj(appearance)[item.desc],
            imgs: item.imgs[0] || ''
          })
        })

        value.top.forEach((item, index) => {
          arr.push({
            desc: '车顶:' + getObj(appearance)[item.desc],
            imgs: item.imgs[0] || ''
          })
        })

        this.appearArr = arr
      }
    }
  },

  filters: {
    formatTime (time) {
      if (!time) return '--'
      return formatTime(time, 'yyyy-MM-dd')
    }
  },

  components: { print }
}
</script>
