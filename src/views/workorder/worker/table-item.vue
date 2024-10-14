<template>
  <div class="workorder-table-item">
    <div class="td-detail">
      <div class="text">
        <span>维修工单</span>
        <span>工单号：{{ tableItem.statementNo }}</span>
        <span v-if="!isEdit || (isEdit && getWorkStatus() !== '待施工')">开单时间：{{ tableItem.createdAt }}</span>
        <span v-if="getWorkStatus() === '待结算' && !isEdit">施工完成时间：{{ tableItem.finishDate }}</span>
        <span v-if="getWorkStatus() === '已挂账'&& !isEdit">挂账时间：{{ tableItem.creditDate }}</span>
        <span v-if="getWorkStatus() === '待出厂' && !isEdit">结算时间：{{ tableItem.settlementDate }}</span>
        <span v-if="getWorkStatus() === '已完成' && !isEdit">出厂时间：{{ tableItem.factoryDate }}</span>
        <span v-if="tableItem.billUser.userName">开单人：{{tableItem.billUser.userName}}</span>
      </div>

      <!-- <i class="iconfont icon-bianji1" 
        v-if="!isEdit && (getWorkStatus() === '待施工' || 
        getWorkStatus() === '待结算' || 
        getWorkStatus() === '待出厂' || 
        getWorkStatus() === '已完成')"
        @click="editTime">
      </i> -->
      <!-- <div class="edit-time" v-if="isEdit">
        <span class="time-text" v-if="getWorkStatus() === '待施工'">开单时间：</span>
        <span class="time-text" v-if="getWorkStatus() === '待结算'">施工完成时间：</span>
        <span class="time-text" v-if="getWorkStatus() === '待出厂'">结算时间：</span>
        <span class="time-text" v-if="getWorkStatus() === '已完成'">出厂时间：</span>
        <DatePicker type="datetime" 
          placeholder="选择时间" 
          style="width: 180px"
          v-model="time"
          :clearable="false"
          :editable="false"
          :options="timeOptions">
        </DatePicker>
        <Button type="primary" @click="editConfirm">确定</Button>
        <Button type="default" @click="isEdit = false">取消</Button>
      </div> -->

      <div class="pos-right">
        <Tag v-if="Number(type) === 6">{{ getWorkStatus() }}</Tag>
        <Tag v-if="getWorkStatus() === '已挂账' && Number(type) === 2">已挂账</Tag>
        <div
          v-if="tableItem.uploadStatus === '1'"
          class="advance"
        >已上传汽车健康档案</div>
        <div
          v-if="(tableItem.payStatus === '1' || tableItem.payStatus === '3') && tableItem.workStatus !== '0' && parseFloat(tableItem.realCost) > 0"
          class="advance"
        >已预收 ¥ {{tableItem.realCost}}</div>
      </div>
    </div>
    <table class="first-table">
      <tbody>
        <tr>
          <td>
            <p
              v-if="tableItem.plateNo"
              class="plate-no"
            >{{ tableItem.plateNo }}</p>
            <span
              v-else
              style="margin-right: 10px; color: #888;"
            >暂无车牌号</span>
            <my-img :src="GET_BRAND_LOGO + tableItem.brandId" />
            <div class="img-block">
              <p>{{ tableItem.vehicleBrand }}<span v-if="tableItem.vehicleBrand !== '其他品牌'">-</span>{{ tableItem.carSeries }} {{ tableItem.carStyle }}</p>
            </div>
          </td>
          <td style="width: 136px;">{{ tableItem.vehicleOwner || '--' }}</td>
          <td style="width: 120px;">{{ tableItem.ownerMobile || '--' }}</td>
          <!-- <td style="width: 149px">{{ getObj(repairTypeArr)[tableItem.repairType] }}<br />应收金额：<span class="price">￥{{ tableItem.leftReceivable > 0 ? tableItem.leftReceivable : 0}}</span></td> -->
          <td style="width: 100px">
            <div @click="toggleTable">
              <span>{{ !showTable ? '展开' : '收起' }}费用明细</span>
              <Icon :type="!showTable ? 'arrow-down-b': 'arrow-up-b'"></Icon>
            </div>
          </td>
          <td
            class="last-td"
            v-if="getWorkStatus() === '已作废'"
          >
            <span>工单金额：</span>
            <span class="price">￥{{ tableItem.receivable }}</span>
          </td>
          <td
            class="last-td"
            v-else
          >
            <span v-if="getWorkStatus() === '待施工'">应收金额：</span>
            <span v-else-if="getWorkStatus() === '待结算' || getWorkStatus() === '已挂账'">未收金额：</span>
            <span v-else>实收金额：</span>
            <span
              class="price"
              v-if="getWorkStatus() === '待施工' || getWorkStatus() === '待结算' || getWorkStatus() === '已挂账'"
            >￥{{ tableItem.leftReceivable }}</span>
            <span
              class="price"
              v-else
            >￥{{ tableItem.realCost }}</span>
          </td>
        </tr>
        <tr v-if="getWorkStatus() === '已作废'">
          <td style="padding-top: 15px">
            <span>作废原因：</span>
            <span>{{ tableItem.cancelReason || "无" }}</span></td>
        </tr>
        <tr>
          <td style="padding-top: 15px;color: #807d7c;">
            <span>备注：</span>
            <span>{{ tableItem.workOrderRemark  || "无" }}</span></td>
        </tr>
      </tbody>
    </table>
    <expand-table
      :tableItem="tableItem"
      :is-show="showTable"
    ></expand-table>
    <!-- 不是总店只可以查看和打印 -->
    <div class="opt-btn" v-if="isSelfStore">
      <!-- 待施工 -->
      <div
        style="display: inline-block;"
        v-if="getWorkStatus() === '待施工'"
      >
        <Button
          v-if="permissionData.finish"
          type="warning"
          @click="toComplete"
        >施工完成</Button>
        <Button
          v-if="permissionData.picking"
          type="default"
          @click="getMaterial(tableItem.statementNo)"
        >领料</Button>
        <Button
          v-if="permissionData.advance"
          type="default"
          @click="toBalance(tableItem.statementNo, 1)"
        >预收</Button>
        <Button
          v-if="permissionData.update"
          type="default"
          @click="edit(tableItem.statementNo)"
        >编辑</Button>
        <Button
          v-if="permissionData.delete"
          type="default"
          @click="toCancel"
        >作废</Button>
      </div>
      <!-- 待结算 -->
      <div
        style="display: inline-block;"
        v-if="getWorkStatus() === '待结算'"
      >
        <Button
          v-if="permissionData.settle"
          type="warning"
          @click="toBalance(tableItem.statementNo)"
        >结算</Button>
        <Button
          v-if="permissionData.credit"
          type="default"
          @click="toAccount"
        >挂账</Button>
        <Button
          v-if="permissionData.delete"
          type="default"
          @click="toCancel"
        >作废</Button>
      </div>
      <!-- 待出厂（包含已挂账的工单） -->
      <Button
        type="warning"
        v-if="permissionData.factory && (Number(type) === 2 || Number(type) === 6 && getWorkStatus() === '待出厂')"
        @click="toVerb(tableItem.payStatus)"
      >出厂</Button>
      <!-- 已挂账 -->
      <Button
        type="warning"
        v-if="permissionData.settle && (Number(type) === 3 || Number(type) === 6 && getWorkStatus() === '已挂账')"
        @click="toBalance(tableItem.statementNo)"
      >结算</Button>
      <!-- 已取消、已完成 -->
      <Button
        type="warning"
        v-if="permissionData.check && (getWorkStatus() === '已作废' || getWorkStatus() === '已完成')"
        @click="toDetail(tableItem.statementNo)"
      >查看</Button>
      <Button
        @click="remark(tableItem._id,tableItem.workOrderRemark)"
      >备注</Button>
      <!-- 打印所有状态下都有 -->
      <Dropdown
        trigger="click"
        v-if="permissionData.print"
      >
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(tableItem.statementNo, 2)">委托书</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 1)">派工单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 0)">结算清单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 7)">结算清单(简)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!-- <Button type="default" 
        v-if="getWorkStatus() === '待结算'">•••</Button> -->
      <!-- 有取消预收，重新施工，重新结算其中一个权限的时候显示 -->
      <Dropdown
        trigger="click"
        v-if="(permissionData.newWork || permissionData.newSettle || permissionData.cancelAdvance) && 
          (getWorkStatus() !== '待施工' && getWorkStatus() !== '已作废')"
      >
        <Button type="default">•••</Button>
        <DropdownMenu slot="list">
          <DropdownItem
            v-if="permissionData.newWork"
            @click.native="resetWork(tableItem)"
          >重新施工</DropdownItem>
          <DropdownItem
            v-if="permissionData.cancelAdvance && (tableItem.payStatus === '1' && parseFloat(tableItem.realCost) > 0)"
            @click.native="cancelAdvance"
          >取消预收</DropdownItem>
          <DropdownItem
            v-if="permissionData.newSettle && getWorkStatus() === '待出厂'"
            @click.native="resettlement"
          >重新结算</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="opt-btn" v-else>
      <!-- 已取消、已完成 -->
      <Button
        type="warning"
        v-if="permissionData.check && (getWorkStatus() === '已作废' || getWorkStatus() === '已完成')"
        @click="toDetail(tableItem.statementNo)"
      >查看</Button>
      <!-- 打印所有状态下都有 -->
      <Dropdown
        trigger="click"
        v-if="permissionData.print"
      >
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(tableItem.statementNo, 2)">委托书</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 1)">派工单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 0)">结算清单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 7)">结算清单(简)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <!-- <Button type="default" 
        v-if="getWorkStatus() === '待结算'">•••</Button> -->
      <!-- 有取消预收，重新施工，重新结算其中一个权限的时候显示 -->
      <Dropdown
        trigger="click"
        v-if="isSelfStore && (permissionData.newWork || permissionData.newSettle || permissionData.cancelAdvance) && 
          (getWorkStatus() !== '待施工' && getWorkStatus() !== '已作废')"
      >
        <Button type="default">•••</Button>
        <DropdownMenu slot="list">
          <DropdownItem
            v-if="permissionData.newWork"
            @click.native="resetWork"
          >重新施工</DropdownItem>
          <DropdownItem
            v-if="permissionData.cancelAdvance && (tableItem.payStatus === '1' && parseFloat(tableItem.realCost) > 0)"
            @click.native="cancelAdvance"
          >取消预收</DropdownItem>
          <DropdownItem
            v-if="permissionData.newSettle && getWorkStatus() === '待出厂'"
            @click.native="resettlement"
          >重新结算</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <Modal class="resetModal" v-model="resetModal" title="重新施工" width="668" @on-ok="resetWorkerFn">
      <div class="title">
        原施工项目
      </div>
      <table cellspacing="0" cellpadding="0" border="0" >
        <thead>
          <tr class="theadBg">
            <td>名称</td>
            <td>单价</td>
            <td>工时/数量</td>
            <td>金额</td>
          </tr>
        </thead>
        <tbody class="ivu-table-tbody">
          <tr v-for="(item,index) in resetWorkFormData.repairItems" :key="index">
            <td>{{item.name || '--'}}</td>
            <td>{{item.price || '--'}}</td>
            <td>{{item.hours || '--'}}</td>
            <td>{{item.cost || '--'}}</td>
          </tr>
          <tr v-for="(item,index) in resetWorkFormData.repairParts" :key="index">
            <td>{{item.partName || '--'}}</td>
            <td>{{item.retailPrice || '--'}}</td>
            <td>{{item.quantity || '--'}}</td>
            <td>{{item.cost || '--'}}</td>
          </tr>
          <tr v-for="(item,index) in resetWorkFormData.others" :key="index">
            <td>{{item.name || '--'}}</td>
            <td>--</td>
            <td>--</td>
            <td>{{item.cost || '--'}}</td>
          </tr>
          <tr>
            <td colspan="3">金额合计</td>
            <td>{{resetWorkFormData.receivable}}</td>
          </tr>
        </tbody>
      </table>
      <div class="title mT20">
        已收款项
        <span class="tips">(重新施工后，已收款项将作为预收款缴纳于工单中)</span>
      </div>
      <div class="payType">
        <ul class="flex">
          <li class="flex" v-for="item in payWay" :key="item.title">
            <div class="flex left"><i :class="['iconfont', item.icon]"></i>{{item.name}}</div>
            <format-input style="width:158px;" v-model="item.amount" :min="0" reg="PRECISION"></format-input>
          </li>
        </ul>
      </div>
      <p class="red_color">注：会员卡支付或项目次数抵扣，重新施工后将会退回至支付会员卡中；</p>
      <template slot="footer">
        <div class="footer">
          <i-button class="btn" @click="resetModal=false">取消</i-button>
          <i-button type="primary" class="btn" @click="resetWorkerFn">确定</i-button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import expandTable from './../components/expand-table'
import '@/styles/views/workorder/table-item.less'
import { formatTime, verify } from '@/assets/js/utils.js'
import { repairTypeArr, workStatus, getObj } from '@/store/json/default'
import { GET_BRAND_LOGO } from '@/https/api'
import selfModal  from '@/components/dialog/self-modal'

export default {
  components: { expandTable, selfModal },

  props: {
    tableItem: Object,
    tab: Object,
    isSelfStore:{
      type:Boolean,
      default:()=>{
        return true
      }
    },
    shareStoreId:''
  },

  data () {
    let permissionData = this.$permission.data.workerList
    return {
      permissionData,
      repairTypeArr,
      getObj,
      workStatus,
      GET_BRAND_LOGO,
      showTable: false,
      type: this.$parent.tabType,
      isEdit: false, // 是否编辑时间
      time: '',
      timeOptions: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now()
        }
      },
      show:true,
      payWay:[],
      initPayWay:[],
      resetModal: false,
      resetWorkFormData:{}
    }
  },

  watch: {
    tableItem (to) {
      this.type = this.$parent.tabType
    }
  },

  mounted() {
    this.getPayWay()
  },
  

  methods: {
    async getPayWay(){
      try{
        const res = await this.$store.dispatch({
          type: "actionGet",
          name: "paytypeList"
        });
        if(res.code === '0'){
          this.payWay = res.data.rows
          this.initPayWay = res.data.rows
          const value = res.data.rows
          this.payWay.forEach((item, index) => {
            if (item.name === "现金") item.icon = "icon-xianjin";
            if (item.name === "银行卡") item.icon = "icon-yinhangqia";
            if (item.name === "支付宝") item.icon = "icon-zhifubao";
            if (item.name === "微信") item.icon = "icon-weixin";
          });
          for(let i=value.length-1;i>-1;i--){
            if(this.payWay[i].status==='disabled'){
              this.payWay.splice(i,1);
            }
          }
          this.payWay.sort(item=>{
            if(item.isDefault!=='1'){
              return 1
            }else{
              return -1
            }
          })
        
        }

      }catch(error){
        console.log(error)
      }
    },
    async resetWorkerFn(){
      const params = {
        discountType: "nodiscount",
        isSettle: "0",
        statementNo: this.resetWorkFormData.statementNo,
        payInfo: []
      }
      let payInfo = []
      this.payWay.map(item=>{
        if(item.amount || item.amount =='0' ){
          payInfo.push(item)
        }
      })
      params.payInfo = payInfo

      this.loading = true
      try {
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'workRemaintain',
          params: params
        })
        if (Number(res.code) === 0) {
          this.$Message.success('重新施工成功')
          this.$parent.search()
        } else {
          this.$Message.error(res.msg)
        }
        this.loading = false
      } catch (error) {
        console.dir(error)
        this.loading = false
      }
      this.resetModal = false
    },

    toggleTable () {
      this.showTable = !this.showTable
    },

    edit (statementNo) {
      this.$router.push({
        path: '/workorder/worker/add/' + statementNo
      })
    },

    toBalance (id, isSettle) { 
      //realCost 预收金额   
      if (parseFloat(this.tableItem.leftReceivable) < 0) {
        // 重新施工编辑工单，当预收款大于工单金额时，不能结算
        this.$parent.openRemindModal(
          this.tableItem.statementNo,
          1,
          '暂时无法结算',
          '预收金额超过了工单金额，请先取消预收再进行结算',
          this.tableItem.realCost
        )
      } else {
        if (isSettle) {
          this.$router.push({
            path: '/workorder/worker/balance/' + id + '?advance=1'
          })
        } else {
          this.$router.push({ path: '/workorder/worker/balance/' + id })
        }
      }
    },

    toDetail (id) {
      this.$router.push({ path: `/workorder/worker/detail/${id}?shareStoreId=${this.shareStoreId}` })
    },

    // 判断状态
    getWorkStatus () {
      if (Number(this.tableItem.workStatus) === 0) {
        return '已作废'
      }

      if (
        Number(this.tableItem.workStatus) === 1 &&
        (Number(this.tableItem.payStatus) === 1 ||
          Number(this.tableItem.payStatus) === 2)
      ) {
        return '待施工'
      }

      if (
        Number(this.tableItem.workStatus) === 2 &&
        Number(this.tableItem.payStatus) === 1
      ) {
        return '待结算'
      }

      if (
        (Number(this.tableItem.workStatus) === 2 ||
          Number(this.tableItem.workStatus) === 3) &&
        Number(this.tableItem.payStatus) === 3
      ) {
        return '已挂账'
      }

      if (
        Number(this.tableItem.workStatus) === 2 &&
        Number(this.tableItem.payStatus) === 2
      ) {
        return '待出厂'
      }

      if (
        Number(this.tableItem.workStatus) === 3 &&
        Number(this.tableItem.payStatus) === 2
      ) {
        return '已完成'
      }
    },

    toCancel () {
      // 作废
      this.$parent.openRemoveModal(
        this.tableItem.statementNo,
        5,
        '作废工单',
        '工单作废后将不能恢复，确定作废工单？'
      )
    },

    toVerb (payStatus) {
      // 出厂
      let remindType
      if (payStatus === '3') {
        remindType = 3
      } else {
        remindType = 4
      }

      this.$parent.$refs.factoryDialog.openModal(this.tableItem, remindType)

      // this.$parent.openRemindModal(this.tableItem.statementNo, remindType, '出厂确认', '出厂确认后，工单信息将自动上传到电子健康档案系统；');
    },

    toAccount () {
      // 挂账
      if (this.tableItem.leftReceivable <= 0) {
        this.$parent.openRemindModal('', 1, '该工单金额为0，不能挂账。', '')
        return
      }

      this.$parent.openRemindModal(
        this.tableItem.statementNo,
        2,
        '工单挂账',
        '该工单确定挂账？'
      )
    },

    toComplete () {
      let { tableItem } = this;
      let tips = [];
      if(tableItem.integrity){
        this.$Modal.confirm({
          title: '提示',
          content: "请先完善工单信息后，再点击施工完成",
          okText: "完善工单",
          onOk: () => {
            this.edit(tableItem.statementNo)
          },
          onCancel: () => {

          }
        });
        return
      }
      // 验证客户姓名
      if (!tableItem.vehicleOwner) {
        tips.push({ key: "vehicleOwner", tip: "请完善客户姓名" });
      }

      // 验证VINCode
      if (!tableItem.VINCode) {
        tips.push({ key: "VINCode", tip: "请完善VIN码 (车架号)" });
      } else if (!verify("VINCODE", tableItem.VINCode)) {
        tips.push({ key: "VINCode", tip: "VIN码 (车架号)格式不正确" });
      }

      // 验证车牌号码
      if (!tableItem.plateNo) {
        tips.push({ key: "plateNo", tip: "请完善车牌号" });
      }

      // 验证送修日期
      if (!tableItem.deliveryDate) {
        tips.push({ key: "deliveryDate", tip: "请完善送修日期" });
      }  

      // 验证送修里程
      if (!tableItem.deliveryMileage && tableItem.deliveryMileage !== 0) {
        tips.push({ key: "deliveryMileage", tip: "请完善送修里程" });
      }

      if (tips.length) {
        this.$Modal.warning({
          title: "请先点击编辑完善工单信息",
          width: 500,
          render: (h, b, v) => {
            let elms = tips.map((elm, index) => {
              return h("p", {
                style: {
                  color: "#F22D00",
                  fontSize: "14px",
                  marginTop: index > 0 ? "4px" : "20px"
                }
              }, elm.tip);
            });
            return elms;
          }
        });
        return;
      }
      this.$parent.$refs.constructionDialog.openModal(this.tableItem)
    },

    print (statementNo, type) {      // 打印
      this.$parent.openPrint(statementNo, type)
    },

    resetWork (item) {
      // 重新施工
      this.openResetModal(item)
    },
    
    openResetModal(item){
      this.resetWorkFormData = item
      this.payWay = JSON.parse(JSON.stringify(this.initPayWay))
      item.payInfo.map(item=>{
        this.payWay.find(itemc=>{
          itemc.amount?'':itemc.amount=0
          if(itemc.payTypeId === item.payTypeId){
            itemc.amount += Number(item.amount)
          }
        })
        
      })
      this.resetModal = true
    },

    cancelAdvance () {
      // 取消预收
      this.$parent.openRemindModal(
        this.tableItem.statementNo,
        1,
        '取消预收',
        '取消预收后，需要返还客户￥' +
          this.tableItem.realCost +
          '，确定取消预收？'
      )
    },

    resettlement () {
      // 重新结算
      this.$parent.openRemindModal(
        this.tableItem.statementNo,
        1,
        '重新结算',
        '重新结算后，工单可重新结算，确定重新结算？'
      )
    },

    getMaterial (id) {
      this.$emit('getMaterial', id)
    },

    remark(id,text){
      console.log("900-----------")
      this.$emit('remark', {id,text})
    }
  }
}
</script>
<style lang="less" scoped>
.resetModal{
  .title{
    display: flex;
    align-items: center;
    font-size:14px;
    .car_logo{
      height:40px;
      margin:0 10px;
    }
    border-bottom:1px solid #f5f5f5;
    padding-bottom: 10px;
  }
  .theadBg{
    background: #FCFBFA;
  }
  table{
    width:100%;
    padding-bottom: 10px;
    thead{
      td{
        color:#332E29;
      }
    }
    td{
      padding:10px;
      border-bottom: 1px solid #E5E2DF;
    }
    th{
      border-bottom: 1px solid #E5E2DF;
    }
    tr:nth-child(2n){
      td{
        background: #FCFBFA;
      }
    }
  }
  .tips{
    font-size: 12px;
    line-height: 14px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #999999;
    margin-left: 6px;
  }
  .red_color{
    font-size: 12px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: justify;
    color: #de1f1f;
    margin-left:10px;
  }
  .payType{
    ul{
      flex-wrap:  wrap;
      padding:20px 0;
      padding-bottom: 10px;
      li{
        width:50%;
        align-items: center;
        margin-bottom: 20px;
        >.left{
          font-size: 14px;
          color: #332E29;
          align-items: center;
          width:114px;
          height: 32px;
        }
        .iconfont{
          font-size:32px;
          margin:0 8px;
        }
        .icon-xianjin{
          color:#FF8000;
        }
        .icon-yinhangqia{
          color:#317EF3;
        }
        .icon-zhifubao{
          color:#03AAEF;
        }
        .icon-weixin{
          color:#05AF10;
        }

      }
    }
  }
  .footer{
    padding-bottom:18px;
    .btn{
      width:140px;
      height:40px;
    }
  }
}
</style>

