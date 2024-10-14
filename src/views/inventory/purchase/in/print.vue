<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <h2 class="title">采购单</h2>
          <p class="statement-no">工单号：{{detailData.stockInNo || '--'}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;开单时间：{{detailData.stockInDate || '--'}}</p>
          <div class="print-form">
            <table>
              <tr>
                <td style="width: 80px;">录单人</td>
                <td>{{detailData.operatedBy || '--'}}</td>
                <td>总金额</td>
                <td>{{detailData.totalCost || '--'}}</td>
                <td>数量</td>
                <td>{{detailData.totalQuantity || '--'}}</td>
              </tr>
              <tr>
                <td>供应商</td>
                <td colspan="5">{{detailData.supplierName || '--'}}</td>
              </tr>
            <!-- </table>

            <table class="no-border"> -->
              <tr>
                <td>配件信息</td>
                <td class="no-padding" colspan="5">
                  <table>
                    <tr class="no-border">
                      <td>配件编号</td>
                      <td>原厂编码</td>
                      <td>名称</td>
                      <td style="width: 100px">品牌</td>
                      <td style="width: 70px">数量</td>
                      <td style="width: 100px">单价(元)</td>
                      <td style="width: 100px">金额(元)</td>
                    </tr>
                    <tr class="no-border" v-if="!detailData.components || detailData.components.length==0">
                      <td colspan="6"></td>
                    </tr>
                    <tr class="no-border" v-for="(item,index) in detailData.items" :key="index">
                      <!-- <td class="index">{{index+1}}</td> -->
                      <td>{{item.partNo || '--'}}</td>
                      <td>{{item.partFactoryNo || '--'}}</td>
                      <td>{{item.partName || '--'}}</td>
                      <td>{{item.brand || '--'}}</td>
                      <td>{{item.quantity || '0'}}</td>
                      <td>{{item.purchasePrice | getFixed}}</td>
                      <td>{{item.totalCost | getFixed}}</td>
                    </tr>
                    <tr class="no-border border-top">
                      <td colspan="5"></td>
                      <td class="all-count">合计：</td>
                      <td>{{detailData.totalCost | getFixed}}元</td>
                    </tr>
                  </table>
                </td>
                <!-- <td style="width: 53px;">序号</td> -->
              </tr>
              <tr>
                <td>备注</td>
                <td colspan="5">{{ detailData.remark || '--' }}</td>
              </tr>
              <tr>
                <td>采购人</td>
                <td>{{ detailData.operatedBy || '--' }}</td>
                <td>打印日期</td>
                <td colspan="3">{{ time }}</td>
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
      detailData: 'getPurchaseDetail'
    })
  },

  methods: {
    openPrint (id, shareStoreId='') {
      this.$store.dispatch({
        type: 'toGetPartStockin',
        params: {
          stockInNo: id,
          shareStoreId: shareStoreId
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
