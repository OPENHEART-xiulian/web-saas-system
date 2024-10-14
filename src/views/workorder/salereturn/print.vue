<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <h2 class="title">销售退货单</h2>
          <p class="statement-no">
            <span>开单时间：{{formData.createdAt || '--'}}</span>
            <span>工单号：{{formData.statementNo || '--'}}</span>
          </p>
          <div class="print-form">
            <table>
              <tr>
                <td>客户名称</td>
                <td>{{formData.vehicleOwner || '--'}}</td>
                <td>联系电话</td>
                <td>{{formData.ownerMobile || '--'}}</td>
                <td>工单状态</td>
                <td>{{status || '--'}}</td>
              </tr>

              <!-- 维修配件 start -->
              <tr>
                <td>维修配件</td>
                <td colspan="5" class="no-padding">
                  <table>
                    <tr class="no-border">
                      <td class="index">序号</td>
                      <td>名称</td>
                      <td style="width: 125px">配件编号</td>
                      <td style="width: 120px">原厂编码</td>
                      <td>数量</td>
                      <td>单价</td>
                      <td class="last-td">金额</td>
                    </tr>
                    <tr class="no-border" v-if="!formData.refundParts || formData.refundParts.length==0">
                      <td colspan="7"></td>
                    </tr>
                    <tr class="no-border" v-for="(item,index) in formData.refundParts" :key="index">
                      <td class="index">{{index+1}}</td>
                      <td>{{item.partName || '--'}}</td>
                      <td>{{item.partNo || '--'}}</td>
                      <td>{{item.partFactoryNo || '--'}}</td>
                      <td>{{item.refundQuantity || '0'}}</td>
                      <td>{{item.refundPrice | getFixed}}</td>
                      <td class="last-td">{{item.refundCost | getFixed}}</td>
                    </tr>
                    <tr class="no-border border-top">
                      <td colspan="6" class="all-count">合计</td>
                      <td class="last-td">{{partTotal | getFixed}}元</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- 维修配件 end -->

              <!-- 其他项目 start -->
              <tr v-if="formData.refundOthers && formData.refundOthers.length > 0">
                <td>其他费用</td>
                <td colspan="5" class="no-padding">
                  <table>
                    <tr class="no-border">
                      <td class="index">序号</td>
                      <td colspan="5">项目</td>
                      <td class="last-td">金额</td>
                    </tr>
                    <!-- <tr class="bd-b-ddd" v-if="!formData.others || formData.others.length==0">
                      <td colspan="7"></td>
                    </tr> -->
                    <tr class="no-border" v-for="(item,index) in formData.refundOthers" :key="index">
                      <td class="index">{{index+1}}</td>
                      <td colspan="5">{{item.name || '--'}}</td>
                      <td class="last-td">{{item.refundCost | getFixed}}</td>
                    </tr>
                    <tr class="no-border border-top">
                      <td colspan="6" class="all-count">合计</td>
                      <td class="last-td">{{otherTotal | getFixed}}元</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- 其他项目 end -->
              <!-- 费用说明 start -->
              <tr>
                <td>费用说明</td>
                <td colspan="5" class="no-padding">
                  <table>
                    <tr class="no-border">
                      <!-- <td class="index"></td> -->
                      <td colspan="6" class="all-count">退货金额</td>
                      <td class="last-td">{{formData.refundTotal | getFixed}}元</td>
                    </tr>
                  </table>
                </td>
              </tr>      
              <!-- 费用说明 end -->  
              <tr>
                <td>备注</td>
                <td class="no-padding" colspan="5">
                  <table>
                    <tr class="no-border">
                      <td>1、本退货单一式两份，分别由购买方和销售方留存；</td>
                    </tr>
                    <tr class="no-border">
                      <td>2、退货单配件信息及退货金额经双方核实，客户签字后生效。</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr class="no-border-b">
                <td colspan="3">销售方（盖章）：</td>
                <td colspan="3">购买方：</td>
              </tr>
              <tr class="no-border-b">
                <td colspan="3">
                  <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
                </td>
                <td colspan="3">
                  <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
                </td>
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
  import Print from '@/assets/js/print.js';
  import { mapGetters } from 'vuex';
  import '@/../public/css/print.css';
  export default {
    props:{
      shareStoreId:{
        type:String,
        default:''
      }
    },
    data () {
      return {
        show: false,
        formData: {},
        status: '',
        partTotal: 0,
        otherTotal: 0
      }
    },

    watch: {
      detailData (to) {
        if (to) {
          this.formData = to;

          let partTotal = 0;
          let otherTotal = 0;
          to.refundParts.forEach(item => {
            partTotal = partTotal + item.refundCost;
          })
          to.refundOthers.forEach(item => {
            otherTotal = otherTotal + item.refundCost;
          })
          this.partTotal = partTotal;
          this.otherTotal = otherTotal;
        }
      }
    },

    methods: {
      openPrint (id, status) {
        const statusObj = {
          0: '待入库',
          1: '待结算',
          2: '已完成',
          3: '已作废'
        }
        this.show = true;
        this.$store.dispatch({
          type: 'toGetSaleRefundDetail',
          params: {
            _id: id,
            shareStoreId: this.shareStoreId
          }
        })
        this.status = statusObj[status];
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
      }
    },

    computed: {
      ...mapGetters({detailData: 'getSaleRefundDetail'})
    }
  }
</script>
