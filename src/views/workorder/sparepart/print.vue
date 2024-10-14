<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <h2 class="title">配件销售单</h2>
          <p class="statement-no">
            <span>下单时间：{{formData.createdAt || '--'}}</span>
            <span>维修结算清单编号：{{formData.statementNo || '--'}}</span>
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
                    <tr class="no-border" v-if="!formData.repairParts || formData.repairParts.length==0">
                      <td colspan="8"></td>
                    </tr>
                    <tr class="no-border" v-for="(item,index) in formData.repairParts" :key="index">
                      <td class="index">{{index+1}}</td>
                      <td>{{item.partName || '--'}}</td>
                      <td>{{item.partNo || '--'}}</td>
                      <td>{{item.partFactoryNo || '--'}}</td>
                      <td>{{item.quantity || '0'}}</td>
                      <td>{{item.retailPrice | getFixed}}</td>
                      <td class="last-td">{{item.cost | getFixed}}</td>
                    </tr>
                    <tr class="no-border border-top">
                      <td colspan="6" class="all-count">合计</td>
                      <td class="last-td">{{formData.totalPartCost | getFixed}}元</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <!-- 维修配件 end -->

              <!-- 其他项目 start -->
              <tr v-if="formData.others && formData.others.length > 0">
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
                    <tr class="no-border" v-for="(item,index) in formData.others" :key="index">
                      <td class="index">{{index+1}}</td>
                      <td colspan="5">{{item.name || '--'}}</td>
                      <td class="last-td">{{item.cost | getFixed}}</td>
                    </tr>
                    <tr class="no-border border-top">
                      <td colspan="6" class="all-count">合计</td>
                      <td class="last-td">{{formData.totalOtherCost | getFixed}}元</td>
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
                      <td colspan="5">工单金额</td>
                      <td></td>
                      <td class="last-td">{{formData.receivable | getFixed}}</td>
                    </tr>
                    <tr class="no-border" v-if="formData.tax > 0">
                      <td colspan="5">税费</td>
                      <td class="align-r">+</td>
                      <td class="last-td">{{formData.tax | getFixed}}</td>
                    </tr>
                    <tr class="no-border" v-if="formData.discountCost > 0">
                      <td colspan="5">优惠</td>
                      <td class="align-r">-</td>
                      <td class="last-td">{{formData.discountCost | getFixed}}</td>
                    </tr>
                    <tr class="no-border" v-if="formData.smallChange > 0">
                      <td colspan="5">抹零</td>
                      <td class="align-r">-</td>
                      <td class="last-td">{{formData.smallChange | getFixed}}</td>
                    </tr>
                    <tr class="no-border-r bd-b-ddd" v-if="advanceCost > 0">
                      <td colspan="5">预付金额</td>
                      <td class="align-r">-</td>
                      <td class="last-td">{{advanceCost | getFixed}}</td>
                    </tr>
                    <tr class="no-border">
                      <td class="index"></td>
                      <td colspan="5" class="all-count">实收金额</td>
                      <td class="last-td">{{realCost | getFixed}}元</td>
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
                      <td>1、本结算清单一式两份，分别由购买方和销售方留存；</td>
                    </tr>
                    <tr class="no-border">
                      <td>2、结算清单配件信息及应付金额经双方核实，客户签字后生效。</td>
                    </tr>
                    <tr class="no-border" v-if="needRemark">
                      <td >
                        <div v-if="!isRemark">3、{{formData.workOrderRemark}}</div>
                        <div style="display:flex;align-items:center;" v-else >
                          <span>3、</span>
                          <i-input :maxlength="50" style="width:65%;" placeholder="输入备注文案，限制50字以内" v-model="remarkText"></i-input>
                          <i-button style="margin:0 10px 0 20px;width:80px;" type="primary" @click="requireRemark">确定</i-button>
                          <i-button @click="cancelRemark" style="width:80px;">取消</i-button>
                        </div>
                      </td>
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
        <i-button
          type="default"
          @click.stop="remark"
        >备注</i-button>
        <i-button type="primary" @click.stop="print">打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
  import Print from '@/assets/js/print.js';
  import mixins from '../print-temp/mixins.js'
  import { mapGetters } from 'vuex';
  import '@/../public/css/print.css';
  export default {
    mixins: [mixins],
    props:{
      shareStoreId:{
        type:String,
        default:''
      }
    },
    data () {
      return {
        show: false,
        type: 0,
        formData: {},
        status: '',
        advanceCost: 0,
        realCost: 0,
      }
    },
    watch: {
      detailData (to) {
        this.formData = to;
        this.isRemarkFromData()
        
        if (to.payStatus !== '2') return;
        const payLog = to.payLog.slice(0);
        const realPayInfo = payLog.pop().payInfo;
        
        let realCost = 0;
        let advanceCost = 0;
        payLog.forEach(item => {
          const payInfo = item.payInfo;
          payInfo.forEach(citem => {
            advanceCost += Number(citem.amount || 0);
          });
        });

        realPayInfo.forEach(item => {
          realCost += Number(item.amount);
        })

        this.advanceCost = advanceCost;
        this.realCost = realCost;

        
      }
    },
    mounted () {

    },
    methods: {
      openPrint (value, status) {
        const statusObj = {
          '0': '待出库',
          '1': '待结算',
          '2': '已挂账',
          '3': '已完成'
        }
        this.show = true;
        this.$store.dispatch({
          type: 'toGetWorkDetail',
          params: {
            params: {
              statementNo: value,
              shareStoreId: this.shareStoreId
            },
            request: 'saleDetail'
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
      remark(){
        this.toogleRemark()
      }
    },

    filters: {
      getFixed (v) {
        if (!v) return '0.00';
        return Number(v).toFixed(2);
      }
    },

    computed: {
      ...mapGetters({detailData: 'getWorkDetail'})
    }
  }
</script>
