<template>
  <!-- 洗美工单 - 结算清单 -->
  <div>
    <div class="print-form">
      <h2 class="title">机动车维修费用结算清单</h2>
      <p class="statement-no" style="padding: 0 4px">
        <!-- <span>下单时间：{{formData.createdAt || '--'}}</span> -->
        <span>维修结算清单编号：{{formData.statementNo || '--'}}</span>
      </p>
      <table style="border-top: 1px solid #000;">
        <tr>
          <td colspan="2" class="print-form__label" style="width: 85px;">机动车所有人</td>
          <td colspan="2">{{formData.vehicleOwner || '--'}}</td>
          <td colspan="2" class="print-form__label" style="width: 85px;">送修人</td>
          <td colspan="2">{{formData.repairName || '--'}}</td>
          <td colspan="2" class="print-form__label" style="width: 95px;">联系电话</td>
          <td colspan="2">{{formData.repairMobile || '--'}}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">品牌型号</td>
          <td colspan="2">{{formData.vehicleBrand || '--'}}</td>
          <td colspan="2" class="print-form__label">车牌号码</td>
          <td colspan="2">{{formData.plateNo || '--'}}</td>
          <td colspan="2" class="print-form__label">发动机号</td>
          <td colspan="2">{{formData.engineNo || '--'}}</td>
        </tr>
        <tr>
          <td colspan="4" class="print-form__label">车辆识别代码（VIN码）</td>
          <td colspan="4">{{formData.VINCode || '--'}}</td>
          <td colspan="2" class="print-form__label">车辆类型</td>
          <td colspan="2">{{formData.vehicleType | getVehicleType }}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">维修企业名称</td>
          <td colspan="6">{{store.storeName || '--'}}</td>
          <td colspan="2" class="print-form__label">维修企业联系人</td>
          <td colspan="2">{{store.contactName || '--'}}</td>
        </tr>
        <tr>
          <td colspan="2" class="print-form__label">企业地址</td>
          <td colspan="6">{{getCityText(store.provinceCode) + getCityText(store.cityCode) + getCityText(store.countyCode) + store.address}}</td>
          <td colspan="2" class="print-form__label">联系电话</td>
          <td colspan="2">{{businessInfo ? businessInfo.serviceTelList.join('、') : '--'}}</td>
        </tr>
        <tr>
          <td colspan="4" class="print-form__label">维修企业统一社会信用代码或机构代码</td>
          <td colspan="4">{{store.socialCode || '--'}}</td>
          <td colspan="2" class="print-form__label">送修里程</td>
          <td colspan="2">{{formData.deliveryMileage || '--'}}km</td>
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
          <!-- <td colspan="10" class="all-count"></td>
          <td colspan="2" style="width: 140px;"></td> -->
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
                <td style="width: 60px;">配件属性</td>
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
                <td>--</td>
                <td>{{item.stockOutType === '3' ? '是' : '否'}}</td>
              </tr>
              <!-- <tr class="border-top">
                <td
                  colspan="7"
                  class="all-count"
                >小计（元）：</td>
                <td>{{formData.totalPartCost | getFixed}}</td>
              </tr> -->
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
              <!-- <tr class="bd-b-ddd" v-if="!formData.others || formData.others.length==0">
                <td colspan="7"></td>
              </tr> -->
              <tr v-for="(item,index) in formData.others" :key="index">
                <td class="index">{{index+1}}</td>
                <td>{{item.name || '--'}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
              <!-- <tr class="border-top">
                <td></td>
                <td colspan="5" class="all-count">小计（元）：</td>
                <td>{{formData.totalOtherCost | getFixed}}</td>
              </tr> -->
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
          <td colspan="2" class="print-form__label">总费用</td>
          <td colspan="10" class="no-padding">
            <table>
              <tr class="no-border" style="border-bottom: 1px solid #000;">
                <td colspan="4">工单金额</td>
                <td class="index"></td>
                <td></td>
                <td style="width: 170px">{{formData.receivable | getFixed}}</td>
              </tr>
              <tr class="no-border" style="border-bottom: 1px solid #000;" v-if="formData.tax > 0">
                <td colspan="4">税费</td>
                <td class="index"></td>
                <td class="align-r">+</td>
                <td>{{formData.tax | getFixed}}</td>
              </tr>
              <tr class="no-border" style="border-bottom: 1px solid #000;" v-if="formData.discountCost > 0">
                <td colspan="4">优惠</td>
                <td class="index"></td>
                <td class="align-r">-</td>
                <td>{{formData.discountCost | getFixed}}</td>
              </tr>
              <tr class="no-border" style="border-bottom: 1px solid #000;" v-if="formData.smallChange > 0">
                <td colspan="4">抹零</td>
                <td class="index"></td>
                <td class="align-r">-</td>
                <td>{{formData.smallChange | getFixed}}</td>
              </tr>
              <tr class="no-border-r bd-b-ddd" style="border-bottom: 1px solid #000;" v-if="advanceCost > 0">
                <td colspan="4">预付金额</td>
                <td class="index"></td>
                <td class="align-r">-</td>
                <td>{{advanceCost | getFixed}}</td>
              </tr>
              <tr class="no-border">
                <td class="index"></td>
                <td colspan="5" class="all-count">实收金额</td>
                <td>{{realCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 费用说明 end -->
        <!-- 旧处理结果 -->
        <tr>
          <td colspan="2" class="print-form__label">旧件处理结果</td>
          <td colspan="10">
            <div style="display: flex; align-items: center; height: 22px;">
              <div style="flex-grow: 1; display: flex; align-items: center;">
                <span style="position:relative; bottom: -1px; display: inline-block; width: 12px; height: 12px; backgorund: white; border: 1px solid #000; border-radius: 2px; margin-right: 4px;"></span>
                <span>旧件已确认，由托修方收回</span>
              </div>
              <div style="flex-grow: 1; display: flex; align-items: center;">
                <span style="position:relative; bottom: -1px; display: inline-block; width: 12px; height: 12px; backgorund: white; border: 1px solid #000; border-radius: 2px; margin-right: 4px;"></span>
                <span>旧件已确认，由承修方收回</span>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <!-- <td class="print-form__label">备注</td> -->
          <td
            class="no-padding"
            colspan="12"
          >
            <table>
              <!-- <tr class="no-border">
                <td>1、结算清单项目及应付金额经双方核实，客户签字后生效。</td>
              </tr>
              <tr class="no-border">
                <td>2、企业承诺本次维修质量保证期为车辆行驶<a class="unde">{{formData.warrantyMileage || 0}}</a>公里或者<a class="unde">{{formData.warranty || 0}}</a>日，里程和时间以先到者为准。</td>
              </tr> -->
              <tr class="no-border">
                <td colspan="12">1、本结算清单一式两联，分别由托修方，承修方留存。</td>
              </tr>
              <tr class="no-border">
                <td colspan="12">2、结算清单项目及应付金额经双方核实，托修方签字后生效。</td>
              </tr>
              <tr class="no-border">
                <td colspan="12">3、承修方不承担托修方自备配件质量保证责任。</td>
              </tr>
              <tr class="no-border">
                <!-- <td colspan="12">4、企业承诺本次维修质量保证期为车辆行驶<a class="unde">{{formData.warrantyMileage || 0}}</a> 公里或者<a class="unde">{{formData.warranty || 0}}</a>日，里程和时间以先到者为准。</td> -->
              </tr>
              <tr class="no-border">
                <td colspan="12">4、企业承诺本次维修的新能源汽车专用部件__________________维修质量保证期为________。</td>
              </tr>
              <tr class="no-border" v-if="needRemark">
                <td colspan="12">
                  <div v-if="!isRemark">5、{{formData.workOrderRemark}}</div>
                  <div style="display:flex;align-items:center;" v-else >
                    <span>5、</span>
                    <i-input :maxlength="50" style="width:65%;" placeholder="输入备注文案，限制50字以内" v-model="remarkText"></i-input>
                    <i-button style="margin:0 10px 0 20px;width:80px;" type="primary" @click="requireRemark">确定</i-button>
                    <i-button @click="cancelRemark" style="width:80px;">取消</i-button>
                  </div>
                </td>
              </tr>
              <tr class="no-border">
                <td colspan="6" class="print-form__label">承修方（盖章）：</td>
                <td colspan="6" class="print-form__label">托修方：</td>
              </tr>
              <tr class="no-border">
                <td colspan="6" class="print-form__label">
                  <span>日期：&nbsp;&nbsp; &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;日</span>
                </td>
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
        advanceCost: 0,
        realCost: 0,
      }
    },
    watch: {
      formData () {
        this.computedCost();
        this.isRemarkFromData()
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
      if(storage.get('selectShareStore')){
        this.store= storage.get('selectShareStore')
      }else{
        this.store = storage.get('STORE')
      }
      this.businessInfo = this.store.businessInfo;
      this.computedCost();
    },
    methods: {
      computedCost (formData) {
        if (this.formData.payStatus !== '2') return;
        const payLog = this.formData.payLog.slice(0);
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
    }
  }
</script>
