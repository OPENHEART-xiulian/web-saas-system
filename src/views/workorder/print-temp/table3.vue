<template>
  <!-- 维修工单-委托书 -->
  <div>
    <h2 class="title">{{title}}</h2>
    <p class="statement-no">
      <span>下单时间：{{formData.createdAt || '--'}}</span>
      <span>{{statementName}}：{{formData.statementNo || '--'}}</span>
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
          <td colspan="3">{{formData.repairType | getRepairType}}</td>
        </tr>
        <tr>
          <td>出厂日期</td>
          <td colspan="3">{{formData.factoryDate | getDate}}</td>
          <td>出厂里程</td>
          <td colspan="3">{{formData.factoryMileage || '--'}}km</td>
        </tr>
        <tr>
          <td>故障描述</td>
          <td colspan="7">{{formData.description || '--'}}</td>
        </tr>

        <tr>
          <td rowspan="3">接车信息</td>
          <td>车辆外观问题</td>
          <td colspan="6">{{getAppearance(formData.appearance)}}</td>
        </tr>
        <tr>
          <td>随车装备</td>
          <td colspan="6">{{getStuff(formData.stuff)}}</td>
        </tr>
        <tr>
          <td>功能异常</td>
          <td colspan="6">{{getMalfunction(formData.malfunction)}}</td>
        </tr>
        <!-- 维修项目 start -->
        <tr>
          <td>维修项目</td>
          <td
            colspan="7"
            class="no-padding"
          >
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td colspan="3">项目名称</td>
                <td>工时</td>
                <td>工时费</td>
                <td style="width: 100px">金额</td>
                <td>服务技师</td>
                <td>备注</td>
              </tr>
              <tr
                class="no-border"
                v-if="!formData.repairItems || formData.repairItems.length === 0"
              >
                <td colspan="7"></td>
              </tr>
              <tr
                class="no-border"
                v-else
                v-for="(item,index) in formData.repairItems"
                :key="index"
              >
                <td class="index">{{index+1}}</td>
                <td colspan="3">{{item.name}}</td>
                <td>{{item.hours || 0}}</td>
                <td>{{item.price | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td>
                <td>{{getUsers(item.technicians)}}</td>
                <td>{{ item.remark || '无'}}</td>
              </tr>
              <tr class="no-border border-top">
                <td
                  colspan="8"
                  class="all-count"
                >合计</td>
                <td>{{formData.totalItemCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 维修项目 end -->

        <!-- 维修配件 start -->
        <tr>
          <td>维修配件</td>
          <td
            colspan="7"
            class="no-padding"
          >
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
              <tr
                class="no-border"
                v-if="!formData.repairParts || formData.repairParts.length==0"
              >
                <td colspan="7"></td>
              </tr>
              <tr
                class="no-border"
                v-for="(item,index) in formData.repairParts"
                :key="index"
              >
                <td class="index">{{index+1}}</td>
                <td>{{item.partName || '--'}}</td>
                <td>{{item.partNo || '--'}}</td>
                <td>{{item.partFactoryNo || '--'}}</td>
                <td>{{item.quantity || '0'}}</td>
                <td>{{item.retailPrice | getFixed}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
              <tr class="no-border border-top">
                <td
                  colspan="6"
                  class="all-count"
                >合计</td>
                <td>{{formData.totalPartCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 维修配件 end -->

        <!-- 其他项目 start -->
        <tr v-if="formData.others && formData.others.length > 0">
          <td>其他费用</td>
          <td
            colspan="7"
            class="no-padding"
          >
            <table>
              <tr class="no-border">
                <td class="index">序号</td>
                <td colspan="5">项目</td>
                <td style="width: 100px">金额</td>
              </tr>
              <!-- <tr class="bd-b-ddd" v-if="!formData.others || formData.others.length==0">
                <td colspan="7"></td>
              </tr> -->
              <tr
                class="no-border"
                v-for="(item,index) in formData.others"
                :key="index"
              >
                <td class="index">{{index+1}}</td>
                <td colspan="5">{{item.name || '--'}}</td>
                <td>{{item.cost | getFixed}}</td>
              </tr>
              <tr class="no-border border-top">
                <td></td>
                <td
                  colspan="5"
                  class="all-count"
                >合计</td>
                <td>{{formData.totalOtherCost | getFixed}}元</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- 其他项目 end -->

        <tr>
          <td>配件处理</td>
          <td
            colspan="7"
            class="no-padding"
          >
            <table>
              <tr>
                <td colspan="2">
                  <label><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >带走</label>
                  <label style="margin-left: 8px;"><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >不带走,服务站处理</label>
                </td>
                <td>洗车需求</td>
                <td>
                  <label><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >是</label>
                  <label style="margin-left: 8px;"><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >否</label>
                </td>
                <td>在店等待</td>
                <td>
                  <label><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >是</label>
                  <label style="margin-left: 8px;"><input
                      style="position: relative; top: 2px; margin-right: 2px;"
                      type="checkbox"
                    >否</label>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td>备注</td>
          <td
            class="no-padding"
            colspan="7"
          >
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
import mixins from './mixins.js'
import { storage } from '@/assets/js/utils.js'
import { getCityText } from '@/store/json/city.js'
export default {
  mixins: [mixins],
  props: {
    formData: {
      type: Object
    },
    title: {
      type: String,
      default: "委托书"
    },
    statementName: {
      type: String,
      default: "维修结算清单编号"
    }
  },
  data () {
    return {
      getCityText,
      store: {},
      businessInfo: null
    }
  },
  mounted () {
    // this.company = storage.get('STORE');
    if(storage.get('selectShareStore')){
      this.store= storage.get('selectShareStore')
    }else{
      this.store = storage.get('STORE')
    }

    this.businessInfo = this.store.businessInfo
  },
  methods: {
    getUsers (arr = []) {
      if (arr.length === 0) return ''
      let users = []
      arr.map(itemc => {
        let obj=this.billUsers.find(itemBill => itemBill._id === itemc)
        if(obj&&obj.name){
          users.push(obj.username)
        }
      })
      return users.join(',')
    }
  }
}
</script>
