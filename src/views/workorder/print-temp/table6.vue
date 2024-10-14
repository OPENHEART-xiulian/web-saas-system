<template>
  <div>
    <h2 class="title">销售配件退货单</h2>
    <p class="statement-no">
      <span>开单时间：{{formData.createdAt || '--'}}</span>
      <span>退货单编号：{{formData.statementNo || '--'}}</span>
    </p>
    <div class="print-form">
      <table>
        <tr>
          <td style="width: 85px">车辆所有人</td>
          <td style="width: 95px">{{formData.vehicleOwner || '--'}}</td>
          <td style="width: 80px">送修人</td>
          <td style="width: 80px">{{formData.repairName || '--'}}</td>
          <td style="width: 80px">联系电话</td>
          <td style="width: 120px">{{formData.repairMobile || '--'}}</td>
          <td style="width: 80px">车牌号码</td>
          <td style="width: 95px">{{formData.plateNo || '--'}}</td>
        </tr>
        <tr>
          <td>车辆品牌</td>
          <td>{{formData.vehicleBrand || '--'}}</td>
          <td>车辆类型</td>
          <td>{{formData.vehicleType | getVehicleType }}</td>
          <td colspan="4"></td>
        </tr>
        <tr>
          <td>VIN码</td>
          <td colspan="3">{{formData.VINCode || '--'}}</td>
          <td>发动机号</td>
          <td colspan="3">{{formData.engineNo || '--'}}</td>
        </tr>
        <tr>
          <td>企业名称</td>
          <td colspan="3">{{store.storeName || '--'}}</td>
          <td>企业地址</td>
          <td colspan="3">{{getCityText(store.provinceCode) + getCityText(store.cityCode) + getCityText(store.countyCode) + store.address}}</td>
        </tr>
        <tr>
          <td>企业联系人</td>
          <td colspan="3">{{store.contactName || '--'}}</td>
          <td>联系电话</td>
          <td colspan="3">{{businessInfo ? businessInfo.serviceTelList.join('、') : '--'}}</td>
        </tr>
        <tr>
          <td>送修日期</td>
          <td>{{formData.deliveryDate | getDate}}</td>
          <td>送修里程</td>
          <td>{{formData.deliveryMileage || '--'}}km</td>
          <td>维修类别</td>
          <td>{{formData.repairType | getRepairType}}</td>
          <td>出厂日期</td>
          <td>{{formData.factoryDate | getDate}}</td>
        </tr>
        <tr>
          <td>出厂里程</td>
          <td colspan="3">{{formData.factoryMileage || '--'}}km</td>
          <td>故障描述</td>
          <td colspan="3">{{formData.description || '--'}}</td>
        </tr>

        <!-- 维修配件 start -->
        <tr>
          <td>维修配件</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td>名称</td>
                <td style="width: 125px">配件编号</td>
                <td style="width: 120px">原厂编码</td>
                <td>数量</td>
                <td>单价</td>
                <td style="width: 100px">金额</td>
              </tr>
              <tr class="no-border" v-if="!formData.repairParts || formData.repairParts.length==0">
                <td colspan="7"></td>
              </tr>
              <tr class="no-border" v-for="(item,index) in formData.repairParts" :key="index">
                <td class="index">{{index+1}}</td>
                <td>{{item.partName || '--'}}</td>
                <td>{{item.partNo || '--'}}</td>
                <td>{{item.partFactoryNo || '--'}}</td>
                <td>{{item.quantity || '0'}}</td>
                <td>{{item.retailPrice | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
              <tr class="no-border border-top">
                <td colspan="6" class="all-count">合计</td>
                <td>{{formData.totalPartCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 维修配件 end -->

        <!-- 其他项目 start -->
        <tr v-if="formData.others && formData.others.length > 0">
          <td>其他费用</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td colspan="5">项目</td>
                <td style="width: 100px">金额</td>
              </tr>
              <!-- <tr class="bd-b-ddd" v-if="!formData.others || formData.others.length==0">
                <td colspan="7"></td>
              </tr> -->
              <tr class="no-border" v-for="(item,index) in formData.others" :key="index">
                <td class="index">{{index+1}}</td>
                <td colspan="5">{{item.name || '--'}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
              <tr class="no-border border-top">
                <td></td>
                <td colspan="5" class="all-count">合计</td>
                <td>{{formData.totalOtherCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 其他项目 end -->

        <!-- 费用说明 start -->
        <tr>
          <td>费用说明</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td class="index"></td>
                <td colspan="5" class="all-count">退款金额</td>
                <td class="last-td" style="width: 100px">{{formData.refundTotal | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>      
        <!-- 费用说明 end -->  

        <tr>
          <td>备注</td>
          <td class="no-padding" colspan="7">
            <table>
              <tr class="no-border">
                <td>1、结算清单项目及应付金额经双方核实，客户签字后生效。</td>
              </tr>
              <tr class="no-border">
                <td>2、企业承诺本次维修质量保证期为车辆行驶<a class="unde">{{formData.warrantyMileage || 0}}</a>公里或者<a class="unde">{{formData.warranty || 0}}</a>日，里程和时间以先到者为准。</td>
              </tr>
            </table>
          </td>
        </tr>
        
        <tr class="no-border-b">
          <td colspan="4">承修方（盖章）：</td>
          <td colspan="4">托修方：</td>
        </tr>
        <tr class="no-border-b">
          <td colspan="4">
            <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
          </td>
          <td colspan="4">
            <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
          </td>
        </tr>
        <!-- <tr><td></td></tr> -->
      </table>
    </div>
  </div>
</template>

<script>
  import mixins from './mixins.js';
  import { getCityText } from '@/store/json/city.js';
  import { storage } from '@/assets/js/utils.js';
  export default {
    mixins: [mixins],
    props: {
      formData: {
        type: Object
      }
    },
    data () {
      return {
        getCityText,
        store: {},
        businessInfo: null,
        partTotal: 0,
        otherTotal: 0
      }
    },

    mounted () {
      if(storage.get('selectShareStore')){
        this.store= storage.get('selectShareStore')
      }else{
        this.store = storage.get('STORE')
      }
      this.businessInfo = this.store.businessInfo;
      this.computedCost();
    },
    methods: {
      computedCost () {
        let partTotal = 0;
        let otherTotal = 0;
        this.formData.refundParts.forEach(item => {
          partTotal = partTotal + item.refundCost;
        })
        this.formData.refundOthers.forEach(item => {
          otherTotal = otherTotal + item.refundCost;
        })
        this.partTotal = partTotal;
        this.otherTotal = otherTotal;
      }
    }
  }
</script>
