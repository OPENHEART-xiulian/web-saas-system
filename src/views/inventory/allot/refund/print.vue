<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <h2 class="title">退货单</h2>
          <p class="statement-no">工单号：{{detailData.returnFormCode || '--'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;退货时间：{{detailData.orderAt || '--'}}</p>
          <div class="print-form">
            <table>
              <tr>
                <td style="width: 100px;">退货人</td>
                <td>{{detailData.operatedBy || '--'}}</td>
                <td>总金额</td>
                <td>{{detailData.totalCost || '--'}}</td>
                <td>数量</td>
                <td>{{detailData.totalQuantity || '--'}}</td>
              </tr>
              <tr style="border-bottom: 1px solid #000">
                <td>供应商</td>
                <td colspan="5">{{detailData.supplierName || '--'}}</td>
              </tr>
            </table>

            <table style="border-bottom: 1px solid #000;">
              <tr style="background: #f5f5f5;border-bottom: none">
                <td style="width: 100px; background: white; " 
                  :rowspan="detailData.components ? (detailData.components.length > 1 ? detailData.components.length+2 : 3) : 3">配件信息</td>
                <td style="border-right: none">配件编号</td>
                <td style="border-right: none">原厂编码</td>
                <td style="border-right: none">名称</td>
                <td style="width: 100px;border-right: none">品牌</td>
                <td style="width: 70px;border-right: none">数量</td>
                <td style="width: 100px;border-right: none">单价(元)</td>
                <td style="width: 100px;border-right: none">金额(元)</td>
              </tr>
              <tr v-if="!detailData.components || detailData.components.length==0" style="border-bottom: none">
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr v-for="(item,index) in detailData.components" :key="index" style="border-bottom: none">
                <td style="border-right: none">{{item.partNo || '--'}}</td>
                <td style="border-right: none">{{item.partFactoryNo || '--'}}</td>
                <td style="border-right: none">{{item.partName || '--'}}</td>
                <td style="border-right: none">{{item.brand || '--'}}</td>
                <td style="border-right: none">{{item.quantity || '0'}}</td>
                <td style="border-right: none">{{item.price | getFixed}}</td>
                <td style="border-right: none">{{item.totalCost | getFixed}}</td>
              </tr>
              <tr style="border-bottom: 1px solid #000; border-top: 1px solid #000">
                <td colspan="5" style="border-right: none"></td>
                <td style="text-align: right;border-right: none">合计：</td>
                <td style="border-right: none">{{detailData.totalCost | getFixed}}元</td>
              </tr>
            </table>

            <table>
              <tr>
                <td style="width: 100px;">备注</td>
                <td colspan="3">{{ detailData.remark || '--' }}</td>
              </tr>
              <tr>
                <td>退货人</td>
                <td>{{ detailData.operatedBy || '--' }}</td>
                <td>打印日期</td>
                <td>{{ time }}</td>
              </tr>
            </table>
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
import { mapGetters } from 'vuex';
import Print from '@/assets/js/print.js';
import { formatTime } from '@/assets/js/utils';
import '@/../public/css/print.css';

export default {
  data () {
    return {
      show: false,
      time: formatTime(new Date(), 'yyyy-MM-dd')
    }
  },

  computed: {
    ...mapGetters({
      detailData: 'getRefundDetail'
    })
  },

  methods: {
    openPrint (id) {
      this.$store.dispatch({
        type: 'toGetRefundDetail',
        params: {
          returnFormId: id
        }
      })

      this.show = true;
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
  }
}
</script>
