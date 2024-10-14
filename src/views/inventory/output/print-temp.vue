<template>
  <div>
    <h2 class="title">出库单</h2>
    <p class="statement-no">
      <span>出库单号：{{formData.stockOutNo || '--'}}</span>
      <span>打印时间：{{printDate | formatTime}}</span>
    </p>
    <div class="print-form">
      <table>
        <tr>
          <td style="width: 85px">车辆所有人</td>
          <td style="width: 95px">{{formData.vehicleOwner || '--'}}</td>
          <td style="width: 80px">联系电话</td>
          <td style="width: 120px">{{formData.ownerMobile || '--'}}</td>
          <td style="width: 80px">车牌号码</td>
          <td style="width: 95px">{{formData.plateNo}}</td>
          <td>车辆品牌</td>
          <td>{{formData.vehicleBrand}}</td>
        </tr>
        <tr>
          <td>出库日期</td>
          <td colspan="3">{{formData.stockOutDate | formatTime}}</td>
          <td>工单号</td>
          <td colspan="3">{{formData.statementNo || '--'}}</td>
        </tr>

        <!-- 维修配件 start -->
        <tr>
          <td>维修配件</td>
          <td colspan="7" class="no-padding">
            <table>
              <tr class="no-border">
                <td style="width: 100px">配件名称</td>
                <td style="width: 90px">原厂编码</td>
                <td style="width: 70px">供应商</td>
                <td style="width: 70px">出库类型</td>
                <td style="width: 70px">负责人</td>
                <td style="width: 70px">出库数量</td>
                <td style="width: 80px">售价</td>
                <td style="width: 80px">销售小计</td>
                <td style="width: 80px">成本小计</td>
              </tr>
              <tr class="no-border" v-if="!formData.items || formData.items.length==0">
                <td colspan="9"></td>
              </tr>
              <tr class="no-border" v-for="(item,index) in formData.items" :key="index">
                <td>{{item.partName || '--'}}</td>
                <td>{{item.partFactoryNo || '--'}}</td>
                <td>{{item.supplierStr || '--'}}</td>
                <td>{{formData.orderType | getOrderType}}</td>
                <td>{{formData.username || '--'}}</td>
                <td>{{item.usedQuantity || 0}}</td>
                <td>￥{{item.retailPrice || 0.00}}</td>
                <td>￥{{item.purchasePrice || 0.00}}</td>
                <td>￥{{item.totalPurchasePrice || 0.00}}</td>
              </tr>
              <tr class="no-border border-top">
                <td colspan="8" class="all-count">出库总额</td>
                <td>￥{{formData.totalRetailSales || 0.00}}元</td>
              </tr>
              <tr class="no-border">
                <td colspan="8" class="all-count">成本总额</td>
                <td>￥{{formData.totalPurchaseCost || 0.00}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 维修配件 end -->

        <tr>
          <td>备注</td>
          <td colspan="7">{{formData.remark || '无'}}</td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
  import { stockOutType, outputWorkerType, getObj } from '@/store/json/default';
  import { formatTime } from "@/assets/js/utils";
  export default {
    props: {
      formData: {
        type: Object
      }
    },
    data () {
      return {
        printDate: "",
      }
    },

    mounted () {
    },
    methods: {
    },

    filters: {
      getStockType (v) {
        return getObj(stockOutType)[v];
      },

      getOrderType (v) {
        return getObj(outputWorkerType)[v] || "--";
      },

      formatTime (value) {
        value = value || new Date();
        return formatTime(value, "yyyy-MM-dd");
      }
    }
  }
</script>
