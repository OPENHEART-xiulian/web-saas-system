<template>
	<!-- 打印模板 -->
  <div class="print-model-bg  print-repair-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area print-repair" ref="printForm">
          <div class="print-header" v-if="/takestock/.test($route.path)">
            <span>盘点单号：{{formData.inventoryNo || '--'}}</span>
            <span> 盘点日期：{{formData.inventoryDate || '--'}}</span>
            <span>盘点人：{{formData.createdBy || '--'}}</span>
          </div>
          <div class="print-header" v-else-if="/deposit/.test($route.path)">
            <span>入库单号：{{formData.stockInNo || '--'}}</span>
            <span>入库日期：{{formData.stockInDate || '--'}}</span>
            <span>录单人：{{formData.createdBy || '--'}}</span>
          </div>
          <div class="print-header" v-else>
            <span>出库单号：{{formData.stockOutNo || '--'}}</span>
            <span>工单号：{{formData.statementNo || '--'}}</span>
            <span>车牌号码：{{formData.plateNo || '--'}}</span>
            <span>出库日期：{{formData.stockOutDate || '--'}}</span>
          </div>
          <div class="print-form">
            <table style="border-bottom: 1px solid #000">
              <thead>
                <tr v-if="!/takestock/.test($route.path)">
                  <th class="index" style="width: 60px">序号</th>
                  <th>配件编号</th>
                  <th>原厂编码</th>
                  <th>配件名称</th>
                  <th>配件品牌</th>
                  <th>现有库存</th>
                  <th style="width: 60px">单位</th>
                  <th v-if="this.$parent.type === 'deposit'">入库量</th>
                  <th v-else>出库量</th>
                  <th>进货价 (元)</th>
                  <th>零售价 (元)</th>
                </tr>
                <tr v-else>
                  <th class="index" style="width: 60px">序号</th>
                  <th>配件编号</th>
                  <th>原厂编码</th>
                  <th>配件名称</th>
                  <th>配件品牌</th>
                  <th>原有库存</th>
                  <th>盘点库存</th>
                  <th style="width: 60px">单位</th>
                  <th>盘点数量变化</th>
                  <th>总成本变化(元)</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(item, index) in formData.items">
                  <tr :key="index" v-if="!/takestock/.test($route.path)">
                    <td class="index">{{index + 1}}</td>
                    <td>{{item.partNo || '--'}}</td>
                    <td>{{item.partFactoryNo || '--'}}</td>
                    <td>{{item.partName || '--'}}</td>
                    <td>{{item.brand || '--'}}</td>
                    <td>{{item.originQuantity || '--'}}</td>
                    <td><my-unit :unit="item.unit"></my-unit></td>
                    <td>{{(/deposit/.test($route.path) ? item.incQuantity : item.usedQuantity) || '--'}}</td>
                    <td>{{item.purchasePrice | getFixed}}</td>
                    <td>{{item.retailPrice | getFixed}}</td>
                  </tr>
                </template>
                <template v-for="(item, index) in formData.items">
                  <tr :key="index" v-if="/takestock/.test($route.path)">
                    <td class="index">{{index + 1}}</td>
                    <td>{{item.partNo || '--'}}</td>
                    <td>{{item.partFactoryNo || '--'}}</td>
                    <td>{{item.partName || '--'}}</td>
                    <td>{{item.brand || '--'}}</td>
                    <td>{{item.originQuantity || '--'}}</td>
                    <td>{{item.incQuantity || '--'}}</td>
                    <td>{{item.unit | getUnit}}</td>
                    <td>{{item.quantityChange || '--'}}</td>
                    <td>{{item.costChange | getFixed}}</td>
                  </tr>
                </template>
              </tbody>
            </table>
            <div class="remark">
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
            </div>
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
  import { getLabel, unit } from '@/store/json/default.js';
  import '@/../public/css/print.css';
  export default {
    props: {

    },
    data () {
      return {
        show: false,
        formData: {}
      }
    },
    watch: {
      detailData (to) {
        this.formData = to;
      }
    },

    methods: {
      openPrint (value) {
        this.show = true;
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
    },
  }
</script>
