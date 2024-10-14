<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area print-repair" ref="printForm">
          <h2 class="title">库存盘点</h2>
          <p class="statement-no">
            <span>盘点单号：{{formData.inventoryNo || '--'}}</span>
            <span>打印日期：{{now || '--'}}</span>
          </p>
          <div class="print-form">
            <table>
              <tr>
                <td style="width: 80px">盘点人</td>
                <td style="width: 140px">{{formData.createdBy || '--'}}</td>
                <td style="width: 80px">盘点状态</td>
                <td style="width: 140px">{{formData.checkStatus | getStatus}}</td>
                <td style="width: 80px">盘点时间</td>
                <td>{{formData.inventoryDate || '--'}}</td>
              </tr>
              <tr>
                <td>配件信息</td>
                <td colspan="5" style="padding: 0">
                  <table class="takestock-table">
                      <tr>
                        <td class="index" style="width: 60px">序号</td>
                        <td>配件名称</td>
                        <td>原厂编码</td>
                        <td>配件品牌</td>
                        <td>库存数量</td>
                        <td>实际数量</td>
                        <!-- <th>配件编号</th> -->
                        <td style="width: 60px">单位</td>
                        <td>数量变化</td>
                        <td>实际差额</td>
                      </tr>
                      <tr v-for="(item, index) in formData.items" :key="index">
                        <td class="index">{{index + 1}}</td>
                        <td>{{item.partName || '--'}}</td>
                        <td>{{item.partFactoryNo || '--'}}</td>
                        <td>{{item.brand || '--'}}</td>
                        <td>{{item.originQuantity || '--'}}</td>
                        <td>{{item.incQuantity || '--'}}</td>
                        <!-- <td>{{item.partNo || '--'}}</td> -->
                        <td><my-unit :unit="item.unit"></my-unit></td>
                        <td>{{item.quantityChange || '--'}}</td>
                        <td>{{item.costChange | getFixed}}</td>
                      </tr>
                      <tr>
                        <td colspan="7" style="text-align: right;padding-right: 20px">合计</td>
                        <td>{{ formData.totalQuantityChange || 0 }}</td>
                        <td>￥{{ formData.totalCostChange | getFixed }}</td>
                      </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td>备注</td>
                <td colspan="5">{{ formData.remark || '无' }}</td>
              </tr>
            </table>
            <!-- <div class="remark">
              备注：{{ formData.remark || '无' }}
              <div class="right" v-if="/takestock/.test($route.path)">
                <p>盘点量：<span>{{ formData.totalQuantity }}</span></p>
                <p>盘点数量总变化：<span>{{ formData.totalQuantityChange }}</span></p>
                <p>总成本变化：<span>￥{{ formData.totalCostChange | getFixed }}</span></p>
              </div>
              <div class="right" v-else-if="/deposit/.test($route.path)">
                <p>入库量：<span>{{ formData.totalQuantity }}</span></p>
                <p>进货总价：<span>￥{{ formData.totalCost | getFixed }}</span></p>
                <p>总零售价：<span>￥{{ formData.totalRetailCost | getFixed }}</span></p>
              </div>
              <div class="right" v-else>
                <p>出库量：<span>{{ formData.totalQuantity }}</span></p>
                <p>进货总价：<span>￥{{ formData.totalPurchaseCost | getFixed }}</span></p>
                <p>总零售价：<span>￥{{ formData.totalRetailSales | getFixed }}</span></p>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
    <div class="bottom-btn">
      <div>
        <i-button type="default" @click.stop="closePrint">取消</i-button>
        <i-button type="primary" @click.stop="print">打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
  import Print from '@/assets/js/print.js';
  import { getLabel, unit, takeStatus } from '@/store/json/default.js';
  import { formatTime } from '@/assets/js/utils.js';
  import '@/../public/css/print.css';
  export default {
    props: {

    },
    data () {
      return {
        show: false,
        formData: {},
        now: ""
      }
    },

    methods: {
      openPrint (value) {
        this.show = true;
        this.now = formatTime(new Date(), "yyyy.MM.dd");
        this.formData = value;
      },
      closePrint () {
        this.show = false;
      },
      print () {
        const newPrint = new Print(this.$refs.printForm, '/css/print.css');
      },
    },
    filters: {
      getFixed (v) {
        if (!v) return '0.00';
        return Number(v).toFixed(2);
      },
      getUnit (v) {
        return getLabel(v, unit);
      },
      getStatus (v) {
        return getLabel(v, takeStatus);
      },
    },
  }
</script>
