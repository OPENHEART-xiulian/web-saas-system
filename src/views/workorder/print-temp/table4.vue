<template>
  <!-- 洗美工单 - 派工单 -->
  <div>
    <h2 class="title">派工单</h2>
    <p class="statement-no">
      <span>下单时间：{{formData.createdAt || '--'}}</span>
      <span>维修结算清单编号：{{formData.statementNo || '--'}}</span>
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
          <td colspan="3">{{formData.vehicleBrand || '--'}}</td>
          <td>车辆类型</td>
          <td colspan="3">{{formData.vehicleType | getVehicleType }}</td>
        </tr>
        <tr>
          <td>VIN码</td>
          <td colspan="3">{{formData.VINCode || '--'}}</td>
          <td>发动机号</td>
          <td colspan="3">{{formData.engineNo || '--'}}</td>
        </tr>
        
        <!-- 维修项目 start -->
        <tr>
          <td>维修项目</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td colspan="5">项目名称</td>
                <td>工时</td>
                <!-- <td>工时费</td>
                <td style="width: 100px">金额</td> -->
              </tr>
              <tr class="no-border" v-if="!formData.repairItems || formData.repairItems.length === 0">
                <td colspan="7"></td>
              </tr>
              <tr class="no-border" v-else v-for="(item,index) in formData.repairItems" :key="index">
                <td class="index">{{index+1}}</td>
                <td colspan="5">{{item.name}}</td>
                <td>{{item.hours || 0}}</td>
                <!-- <td>{{item.price | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td> -->
              </tr>
              <!-- <tr class="no-border border-top">
                <td colspan="6" class="all-count">合计</td>
                <td>{{formData.totalItemCost | getFixed}}元</td>
              </tr> -->
            </table>
          </td>
        </tr>
        <!-- 维修项目 end -->

        <!-- 维修配件 start -->
        <tr>
          <td>维修配件</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td>名称</td>
                <td colspan="2">配件编号</td>
                <td colspan="2">原厂编码</td>
                <td>数量</td>
                <!-- <td>单价</td>
                <td style="width: 100px">金额</td> -->
              </tr>
              <tr class="no-border" v-if="!formData.repairParts || formData.repairParts.length==0">
                <td colspan="7"></td>
              </tr>
              <tr class="no-border" v-for="(item,index) in formData.repairParts" :key="index">
                <td class="index">{{index+1}}</td>
                <td>{{item.partName || '--'}}</td>
                <td colspan="2">{{item.partNo || '--'}}</td>
                <td colspan="2">{{item.partFactoryNo || '--'}}</td>
                <td>{{item.quantity || '0'}}</td>
                <!-- <td>{{item.retailPrice | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td> -->
              </tr>
              <!-- <tr class="no-border border-top">
                <td colspan="6" class="all-count">合计</td>
                <td>{{formData.totalPartCost | getFixed}}元</td>
              </tr> -->
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
                <td colspan="6">项目</td>
                <!-- <td style="width: 100px">金额</td> -->
              </tr>
              <!-- <tr class="bd-b-ddd" v-if="!formData.others || formData.others.length==0">
                <td colspan="7"></td>
              </tr> -->
              <tr class="no-border" v-for="(item,index) in formData.others" :key="index">
                <td class="index">{{index+1}}</td>
                <td colspan="6">{{item.name || '--'}}</td>
                <!-- <td>{{item.cost | getFixed}}</td> -->
              </tr>
              <!-- <tr class="no-border border-top">
                <td></td>
                <td colspan="5" class="all-count">合计</td>
                <td>{{formData.totalOtherCost | getFixed}}元</td>
              </tr> -->
            </table>
          </td>
        </tr>
        <!-- 其他项目 end -->
        <tr class="no-border-b">
          <td colspan="4">主修人签名：</td>
          <td colspan="4">检验员签名：</td>
        </tr>
        <tr class="no-border-b">
          <td colspan="4">
            <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
          </td>
          <td colspan="4">
            <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import mixins from './mixins.js';
  export default {
    mixins: [mixins],
    props: {
      formData: {
        type: Object
      }
    }
  }
</script>
