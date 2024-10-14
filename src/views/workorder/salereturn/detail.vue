<template>
  <div class="workorder-detail">
    <saas-bread title="工单详情">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
        <Button v-if="workerSalereturn.print" type="error" @click="openPrint">打印</Button>
      </template>
    </saas-bread>
    <div class="top">
      <span>退货单号：{{ detail.statementNo }}</span>
      <span>退货时间：{{ detail.createdAt }}</span>
      <span>退货人：{{ detail.createdBy }}</span>
    </div>
    <div class="content">
      <h4 class="title">客户信息</h4>
      <p class="msg" v-if="detail.vehicleOwner">
        <span>车辆所有人：{{ detail.vehicleOwner }}</span>
        <span>联系电话：{{ detail.ownerMobile }}</span>
        <span>送修人姓名：{{ detail.repairName || '--' }}</span>
        <span>送修人电话：{{ detail.repairMobile || '--' }}</span>
      </p>
      <p class="msg" v-else>
        <span>匿名用户</span>
      </p>
    </div>
    <div class="content" v-if="detail.vehicleOwner">
      <h4 class="title">车辆信息</h4>
      <p class="msg">
        <span>车牌号码：{{ detail.plateNo || '--' }}</span>
        <span class="auto-w">车型品牌：{{ detail.vehicleBrand }}<span v-if="detail.vehicleBrand !== '其他品牌'" style="width: auto;">-</span>{{ detail.carSeries }} {{ detail.carStyle }}</span>
      </p>
      <p class="msg">
        <span>VIN码（车架号）：{{ detail.VINCode || '--' }}</span>
        <span>发动机号：{{ detail.engineNo || '--' }}</span>
        <span>车辆类型：{{ getObj(vehicleType)[detail.vehicleType] || '--' }}</span>
      </p>
    </div>
    <div class="content">
      <h4 class="title">配件信息</h4>
      <Table no-data-text="暂无配件信息" 
        :columns="partsColumns" 
        :data="detail && detail.refundParts">
      </Table>
      <p class="total-part">合计：<span class="price">¥ {{ partTotal }}</span></p>
    </div>
    <div class="content">
      <h4 class="title">其他费用信息</h4>
      <Table no-data-text="暂无其他费用信息" 
        :columns="otherColumns" 
        :data="detail && detail.refundOthers">
      </Table>
      <p class="total-part">合计：<span class="price">¥ {{ otherTotal }}</span></p>
    </div>
    <div class="content bottom">
      <div class="bottom-box">
        <p class="price">退货金额：<span>￥{{ detail.refundTotal }}</span></p>
        <p v-if="detail.payInfo">支付方式：
          <span v-for="(item, index) in detail.payInfo" :key="index">{{ item.name }} ¥{{ item.amount }}
            <span v-if="detail.payInfo && detail.payInfo.length !== (index + 1)">+ </span>
          </span>
          <span v-if="detail.payInfo && detail.payInfo.length === 0">--</span>
        </p>
      </div>
    </div>
    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import print from '../print';
import { vehicleType, stockOutType, getObj } from '@/store/json/default';
import '@/styles/views/workorder/detail.less';

export default {
  data () {
    let { workerSalereturn } = this.$permission.data;
    return {
      workerSalereturn,
      vehicleType,
      getObj,
      id: this.$route.params.id,
      partTotal: 0.00, // 配件信息合计
      otherTotal: 0.00, // 其他费用合计
      partsColumns: [
        { title: '序号', type: 'index' },
        { title: '配件编号', key: 'partNo' },
        { 
          title: '原厂编码', 
          key: 'partFactoryNo',
          render: (h, { row }) => {
            return h('div', row.partFactoryNo || '--');
          }
        },
        { 
          title: '名称', 
          key: 'partName',
          render: (h, { row }) => {
            return h('div', row.partName || row.name || '--');
          }
        },
        { 
          title: '品牌', 
          key: 'brand',
          render: (h, { row }) => {
            return h('div', row.brand || '--');
          }
        },
        { 
          title: '出库方式', 
          key: 'stockOutType',
          render: (h, { row }) => {
            return h('div', getObj(stockOutType)[row.stockOutType] || '--');
          }
        },
        { title: '数量', key: 'refundQuantity' },
        { title: '单价', key: 'refundPrice' },
        { title: '金额', key: 'refundCost' }
      ],
      otherColumns: [
        { title: '序号', type: 'index' },
        { title: '项目', key: 'name' },
        { title: '金额 (元)', key: 'refundCost' }
      ]
    }
  },

  mounted () {
    this.$store.dispatch({
      type: 'toGetSaleRefundDetail',
      params: {
        _id: this.id
      }
    })
  },

  computed: {
    ...mapGetters({
      detail: 'getSaleRefundDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    detail (value) {
      if (value) {
        let partTotal = 0;
        let otherTotal = 0;
        value.refundParts.forEach(item => {
          partTotal = partTotal + item.refundCost;
        });

        value.refundOthers.forEach(item => {
          otherTotal = otherTotal + item.refundCost;
        })

        this.partTotal = partTotal.toFixed(2);
        this.otherTotal = otherTotal.toFixed(2);
      }
    }
  },

  methods: {
    openPrint () { // 打印
      this.$refs.print.openPrint(this.detail, 6);
    }
  },

  components: { print }
}
</script>
