<template>
  <!-- 试算单-报价单 -->
  <div>
    <div class="print-form">
      <div>
        <h2 class="title">{{store.storeName}}{{title}}</h2>
        <p class="statement-no" style="padding: 0 4px">
          <span>报价时间：{{formData.createdAt || '--'}}</span>
        </p>
      </div>
      <table style="border-top: 1px solid #000;">
        <tr class="no-height">
          <td colspan="2" style="width: 80px;"></td>
          <td colspan="2" style="width: 160px;"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">企业地址</td>
          <td colspan="6">{{getCityText(store.provinceCode) + getCityText(store.cityCode) + getCityText(store.countyCode) + store.address}}</td>
          <td colspan="2" class="print-form__label">客服电话</td>
          <td colspan="2">{{businessInfo ? businessInfo.serviceTelList.join('、') : '--'}}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">客户名称</td>
          <td colspan="2">{{formData.vehicleOwner || '--'}}</td>
          <td colspan="2" class="print-form__label">联系电话</td>
          <td colspan="2">{{formData.ownerMobile || '--'}}</td>
          <td colspan="2" class="print-form__label">服务顾问</td>
          <td colspan="2">{{formData.billUser && (formData.billUser.userName) || '--'}}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">VIN(车架号)</td>
          <td colspan="2">{{formData.VINCode || '--'}}</td>
          <td colspan="2" class="print-form__label">车牌号码</td>
          <td colspan="2">{{formData.plateNo || '--'}}</td>
          <td colspan="2" class="print-form__label">品牌型号</td>
          <td colspan="2">{{formData.vehicleBrand || '--'}}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">故障描述</td>
          <td colspan="10">{{formData.description || '--'}}</td>
        </tr>
        <!-- 维修项目 start -->
        <template v-if="formData.repairItems && formData.repairItems.length">
        <tr>
          <td colspan="2" class="print-form__label">工时费用</td>
          <td colspan="10" class="no-padding">
            <table>
              <tr>
                <td class="index">序号</td>
                <td colspan="3">维修项目</td>
                <td colspan="2" style="width: 40px;">工时</td>
                <td colspan="2" style="width: 60px;">工时单价</td>
                <td colspan="2" style="width: 60px;">工时费用</td>
                <!-- <td>服务技师</td> -->
                <td colspan="2" :style="{ width: hasRemark ? '170px' : '100px' }">备注</td>
              </tr>
              <tr v-if="!formData.repairItems || formData.repairItems.length === 0">
                <td colspan="7"></td>
              </tr>
              <tr v-else v-for="(item,index) in formData.repairItems" :key="index">
                <td class="index">{{index+1}}</td>
                <td colspan="3">{{item.name}}</td>
                <td colspan="2">{{item.hours || 0}}</td>
                <td colspan="2">{{item.price | getFixed}}</td>
                <td colspan="2">{{item.cost | getFixed}}</td>
                <!-- <td>{{getUsers(item.technicians)}}</td> -->
                <td colspan="2">{{ item.remark || '无'}}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="border-top">
          <td colspan="12" class="no-padding">
            <div style="display: flex;">
              <div style="flex-grow: 1; text-align: right; padding: 2px 4px; border-right: 1px solid #000;">小计（元）：</div>
              <div :style="{width: hasRemark ? '169px' : '99px', padding: '2px 4px'}">{{formData.totalItemCost | getFixed}}</div>
            </div>
          </td>
        </tr>
        </template>
        <!-- 维修项目 end -->

        <!-- 维修配件 start -->
        <template v-if="formData.repairParts && formData.repairParts.length">
        <tr>
          <td colspan="2" class="print-form__label">材料费用</td>
          <td colspan="10" class="no-padding">
            <table>
              <tr>
                <td class="index">序号</td>
                <td>材料名称</td>
                <td style="width: 110px">配件编码</td>
                <!-- <td style="width: 120px">原厂编码</td> -->
                <td style="width: 70px;">品牌</td>
                <td style="width: 40px;">数量</td>
                <td style="width: 60px;">单价</td>
                <td style="width: 60px;">金额</td>
                <td style="width: 100px">托修方自备配件</td>
              </tr>
              <tr v-if="!formData.repairParts || formData.repairParts.length==0">
                <td colspan="8"></td>
              </tr>
              <tr v-for="(item,index) in formData.repairParts" :key="index">
                <td class="index">{{index+1}}</td>
                <td>{{item.partName || '--'}}</td>
                <td>{{item.partNo || '--'}}</td>
                <!-- <td>{{item.partFactoryNo || '--'}}</td> -->
                <td>{{item.brand || '--'}}</td>
                <td>{{item.quantity || '0'}}</td>
                <td>{{item.retailPrice | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td>
                <td>{{item.stockOutType === '3' ? '是' : '否'}}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="border-top">
          <td colspan="12" class="no-padding">
            <div style="display: flex;">
              <div style="flex-grow: 1; text-align: right; padding: 2px 4px; border-right: 1px solid #000;">小计（元）：</div>
              <div style="width: 70px; padding: 2px 4px; border-right: 1px solid #000;">{{formData.totalPartCost | getFixed}}</div>
              <div style="width: 99px; position: relative; overflow: hidden;">
                <div class="diagonal"></div>
              </div>
            </div>
          </td>
        </tr>
        </template>
        <!-- 维修配件 end -->

        <!-- 其他项目 start -->
        <template v-if="formData.others && formData.others.length">
        <tr>
          <td colspan="2" class="print-form__label">其他费用</td>
          <td colspan="10" class="no-padding">
            <table>
              <tr>
                <td class="index">序号</td>
                <td>项目</td>
                <td style="width: 170px">金额（元）</td>
              </tr>
              <tr v-for="(item,index) in formData.others" :key="index">
                <td class="index">{{index+1}}</td>
                <td>{{item.name || '--'}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr class="border-top">
          <td colspan="12" class="no-padding">
            <div style="display: flex;">
              <div style="flex-grow: 1; text-align: right; padding: 2px 4px; border-right: 1px solid #000;">小计（元）：</div>
              <div style="width: 169px; padding: 2px 4px;">{{formData.totalOtherCost | getFixed}}</div>
            </div>
          </td>
        </tr>
        </template>
        <!-- 其他项目 end -->

        <!-- 费用说明 start -->
        <tr>
          <td colspan="2" class="print-form__label">费用说明</td>
          <td colspan="10" class="no-padding">
            <table>
              <tr class="no-border" v-if="formData.totalItemCost * 1 > 0">
                <td colspan="4">维修项目</td>
                <td class="index"></td>
                <td></td>
                <td style="width: 170px">{{formData.totalItemCost | getFixed}}</td>
              </tr>
              <tr class="no-border" v-if="formData.totalPartCost * 1 > 0">
                <td colspan="4">维修配件</td>
                <td class="index"></td>
                <td></td>
                <td style="width: 170px">{{formData.totalPartCost | getFixed}}</td>
              </tr>
              <tr class="no-border" style="border-bottom: 1px solid #000;" v-if="formData.totalOtherCost * 1 > 0">
                <td colspan="4">其他费用</td>
                <td class="index"></td>
                <td></td>
                <td style="width: 170px">{{formData.totalOtherCost | getFixed}}</td>
              </tr>
              <tr class="no-border">
                <td class="index"></td>
                <td colspan="5" class="all-count">应付总金额</td>
                <td>{{formData.receivable | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 费用说明 end -->
        <tr>
          <td class="no-padding" colspan="12">
            <table>
              <tr class="no-border">
                <td colspan="6" class="print-form__label">客户签名：</td>
              </tr>
              <tr class="no-border">
                <td colspan="6" class="print-form__label">
                  <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import mixins from './mixins.js'
import { getCityText } from '@/store/json/city.js'
import { storage } from '@/assets/js/utils.js'
export default {
  mixins: [mixins],
  props: {
    formData: {
      type: Object
    },
    title: {
      type: String,
      default: "维修报价单"
    },
    statementName: {
      type: String,
      default: "维修结算清单编号"
    }
  },
  data () {
    return {
      getCityText,
      store: {},
      businessInfo: null,
      advanceCost: 0,
      realCost: 0
    }
  },
  watch: {
    formData () {
      this.computedCost()
    }
  },
  computed: {
    hasRemark () {
      let has = false;
      let repairItems = this.formData.repairItems;
      if (!repairItems || !repairItems.length) has = false;
      repairItems.forEach(elm => {
        if (elm.remark) has = true;
      });
      return has;
    }
  },

  mounted () {
    this.store = storage.get('STORE')
    this.businessInfo = this.store.businessInfo
    this.computedCost()
  },
  methods: {
    computedCost (formData) {
      if (this.formData.payStatus !== '2') return
      const payLog = this.formData.payLog.slice(0)
      const realPayInfo = payLog.pop().payInfo

      let realCost = 0
      let advanceCost = 0
      payLog.forEach(item => {
        const payInfo = item.payInfo
        payInfo.forEach(citem => {
          advanceCost += Number(citem.amount || 0)
        })
      })

      realPayInfo.forEach(item => {
        realCost += Number(item.amount)
      })

      this.advanceCost = advanceCost
      this.realCost = realCost
    },

    getUsers (arr = []) {
      if (arr.length === 0) return ''
      let users = []
      arr.map(itemc => {
        let name = this.billUsers.find(itemBill => itemBill._id === itemc)
          .username
        users.push(name)
      })
      return users.join(',')
    }
  }
}
</script>
