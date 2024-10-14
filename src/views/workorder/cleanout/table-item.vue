<template>
  <div class="workorder-table-item">
    <div class="td-detail">
      <div class="text">
        <span>洗美工单</span>
        <span>工单号：{{ data.statementNo }}</span>
        <span>开单时间：{{ data.createdAt }}</span>
        <span v-if="data.billUser.userName">开单人：{{data.billUser.userName}}</span>
        <!-- <span v-if="status === 1">施工完成时间：{{ data.finishDate }}</span>
        <span v-if="status === 2">挂账时间：{{ data.creditDate }}</span>
        <span v-if="status === 3">结算时间：{{ data.settlementDate }}</span> -->
        <!-- <Tag v-if="$parent.tabType === 4">{{ status !== -1 ? $parent.tabList[status].name : '已作废' }}</Tag> -->
      </div>
      <div class="pos-right">
        <Tag v-if="$parent.tabType === 5">{{ status !== -1 ? $parent.tabList[status].name : '已作废' }}</Tag>
        <Tag v-if="getWorkStatus() === '已挂账'">已挂账{{data.diffCreditDate }}天</Tag>
        <div
          v-if="(status === 0 || status === 1 || status === 2) && parseFloat(itemData.realCost) > 0"
          class="advance"
        >已预收 ¥ {{itemData.realCost}}</div>
      </div>
    </div>
    <table class="first-table">
      <tbody>
        <tr>
          <td>
            <span
              class="plate-no"
              v-if="data.plateNo"
            >{{ data.plateNo }}</span>
            <span
              class="plate-no none"
              v-else
            >暂无车牌号</span>
            <my-img :src="GET_BRAND_LOGO + data.brandId" />
            <div
              class="img-block"
              v-if="data.vehicleBrand"
            >
              <p>{{ data.vehicleBrand }}<span v-if="data.vehicleBrand !== '其他品牌'">-</span>{{ data.carSeries }} {{ data.carStyle }}</p>
            </div>
            <div
              class="img-block"
              v-else
            >
              <p>无车辆信息</p>
            </div>
          </td>
          <td style="width: 136px;">{{ data.vehicleOwner || '匿名用户' }}</td>
          <td style="width: 120px;">{{ data.ownerMobile || '--' }}</td>
          <!-- <td style="width: 149px">{{ getObj(repairTypeArr)[data.repairType] }}<br />应收金额：<span class="price">￥{{ data.leftReceivable > 0 ? data.leftReceivable : 0}}</span></td> -->
          <td style="width: 100px">
            <div @click="toggleTable">
              <span>{{ !showTable ? '展开' : '收起' }}费用明细</span>
              <Icon :type="!showTable ? 'arrow-down-b': 'arrow-up-b'"></Icon>
            </div>
          </td>
          <!-- <td class="last-td">应收金额：<span class="price">￥{{ data.leftReceivable > 0 ? data.leftReceivable : 0}}</span></td> -->
          <td class="last-td">
            <span v-if="data.workStatus==='2' && data.payStatus==='2'">实收金额：</span>
            <span v-else>应收金额：</span>
            <span
              class="price"
              v-if="data.workStatus==='2'&& data.payStatus==='2'"
            >￥{{ data.realCost }}</span>
            <span
              class="price"
              v-else
            >￥{{ data.leftReceivable }}</span>

          </td>
        </tr>
        <tr v-if="status === -1">
          <td style="padding-top: 15px">
            <span>作废原因：</span>
            <span>{{ itemData.cancelReason || "无" }}</span></td>
        </tr>
        <tr>
          <td style="padding-top: 15px;color: #807d7c;">
            <span>备注：</span>
            <span>{{ itemData.workOrderRemark  || "无" }}</span></td>
        </tr>
      </tbody>
    </table>
    <expand-table
      :table-item="data"
      :is-show="showTable"
    ></expand-table>

    <div class="opt-btn" v-if="isSelfStore">
      <template v-if="status === 0">
        <i-button
          v-if="permissionData.finish"
          @click="completeHandle"
          type="primary"
        >施工完成</i-button>
        <Button
          v-if="permissionData.picking"
          type="default"
          @click="getMaterial(data.statementNo)"
        >领料</Button>
        <i-button
          v-if="permissionData.advance"
          type="default"
          @click="toBalance(1)"
        >预收</i-button>
        <i-button
          v-if="permissionData.update"
          type="default"
          @click="toEdit"
        >编辑</i-button>
        <i-button
          v-if="permissionData.delete"
          @click="cancelHandle"
          type="default"
        >作废</i-button>
      </template>
      <i-button
        v-if="permissionData.settle && (status === 1 || status === 2)"
        type="primary"
        @click="toBalance()"
      >结算</i-button>
      <i-button
        v-if="permissionData.credit && status === 1"
        @click="creditHandle"
        type="default"
      >挂账</i-button>
      <Button
        v-if="permissionData.delete && status === 1"
        type="default"
        @click="cancelHandle"
      >作废</Button>
      <i-button
        v-if="permissionData.check && (status === -1 || status === 3)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <Button
        @click="remark(itemData._id,itemData.workOrderRemark)"
      >备注</Button>
      <Dropdown
        v-if="permissionData.print"
        trigger="click"
      >
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(1)">派工单</DropdownItem>
          <DropdownItem @click.native="print(0)">结算清单</DropdownItem>
          <DropdownItem @click.native="print(8)">结算清单(简)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="opt-btn" v-else>
      <i-button
        v-if="permissionData.check && (status === -1 || status === 3)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <Dropdown
        v-if="permissionData.print"
        trigger="click"
      >
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(1)">派工单</DropdownItem>
          <DropdownItem @click.native="print(0)">结算清单</DropdownItem>
          <DropdownItem @click.native="print(8)">结算清单(简)</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import expandTable from './../components/expand-table'
import '@/styles/views/workorder/table-item.less'
import { formatTime } from '@/assets/js/utils.js'
import { repairTypeArr, workStatus, getObj } from '@/store/json/default'
import { GET_BRAND_LOGO } from '@/https/api'

export default {
  components: { expandTable },
  props: {
    data: {
      type: Object,
      default () {
        return {}
      }
    },
    isSelfStore:{
      type:Boolean,
      default:()=>{
        return true
      }
    },
    shareStoreId:''
  },
  data () {
    let permissionData = this.$permission.data.workerCleanout
    return {
      /**
       * 已取消：workStatus=0
       * 待出库：workStatus=1
       * 待结算：workStatus=2&payStatus=1
       * 已挂账：workStatus=2&payStatus=3
       * 已完成：workStatus=2&payStatus=2
       */
      permissionData,
      itemData: {},
      repairTypeArr,
      getObj,
      workStatus,
      GET_BRAND_LOGO,
      showTable: false,
      type: this.$parent.tabType,
      status: 0 // 0 待施工， 1 待结算， 2：已挂账， 3：已完成 -1: 已作废
    }
  },
  created () {
    this.init()
  },
  watch: {
    data () {
      this.init()
    }
  },

  methods: {
    init () {
      this.itemData = Object.assign({}, this.$props.data)
      this.setStatus()
    },

    setStatus () {
      const data = this.itemData
      if (data.workStatus === '0') this.status = -1 // 已作废
      if (data.workStatus === '1') this.status = 0 // 待施工
      if (data.workStatus === '2' && data.payStatus === '1') this.status = 1 // 待结算
      if (data.workStatus === '2' && data.payStatus === '3') this.status = 2 // 已挂账
      if (data.workStatus === '2' && data.payStatus === '2') this.status = 3 // 已完成
    },

    toggleTable () {
      this.showTable = !this.showTable
    },

    cancelHandle () {
      this.$emit('item-emit', {
        title: '作废工单',
        content: '工单作废后将不能恢复，确定作废工单？',
        statementNo: this.itemData.statementNo,
        cancel: true,
        tabType: 4,
        type: 0
      })
    },

    creditHandle () {
      if (this.itemData.leftReceivable <= 0) {
        this.$emit('item-emit', {
          title: '该工单金额为0，不能挂账。',
          content: '',
          cancel: false,
          tabType: 1,
          type: 2
        })
        return
      }

      this.$emit('item-emit', {
        title: '工单挂账',
        content: '该工单确定挂账？',
        statementNo: this.itemData.statementNo,
        cancel: true,
        tabType: 2,
        type: 2
      })
    },

    completeHandle () {
      if(this.itemData.integrity){
        this.$Modal.confirm({
          title: '提示',
          content: "请先完善工单信息后，再点击施工完成",
          okText: "完善工单",
          onOk: () => {
            this.toEdit()
          },
          onCancel: () => {

          }
        });
        return
      }
      this.$emit('item-emit', {
        title: '请确认是否施工完成',
        content: '',
        statementNo: this.itemData.statementNo,
        cancel: true,
        tabType: 1,
        type: 1
      })
    },

    print (type) {
      this.$emit('print-emit', this.itemData.statementNo, type)
    },

    toEdit () {
      this.$router.push('/workorder/cleanout/add/' + this.itemData.statementNo)
    },

    toBalance (isSettle) {
      if (isSettle) {
        this.$router.push({
          path:
            '/workorder/cleanout/balance/' +
            this.itemData.statementNo +
            '?advance=1'
        })
      } else {
        this.$router.push({
          path: '/workorder/cleanout/balance/' + this.itemData.statementNo
        })
      }
    },

    toDetail (id) {
      this.$router.push(
        `/workorder/cleanout/detail/${this.itemData.statementNo}?shareStoreId=${this.shareStoreId}`
      )
    },

    getMaterial (id) {
      this.$emit('getMaterial', id)
    },

    getWorkStatus () {
      if (Number(this.data.workStatus) === 0) {
        return '已作废'
      }

      if (
        Number(this.data.workStatus) === 1 &&
        (Number(this.data.payStatus) === 1 || Number(this.data.payStatus) === 2)
      ) {
        return '待施工'
      }

      if (
        Number(this.data.workStatus) === 2 &&
        Number(this.data.payStatus) === 1
      ) {
        return '待结算'
      }

      if (
        (Number(this.data.workStatus) === 2 ||
          Number(this.data.workStatus) === 3) &&
        Number(this.data.payStatus) === 3
      ) {
        return '已挂账'
      }

      if (
        Number(this.data.workStatus) === 2 &&
        Number(this.data.payStatus) === 2
      ) {
        return '待出厂'
      }

      if (
        Number(this.data.workStatus) === 3 &&
        Number(this.data.payStatus) === 2
      ) {
        return '已完成'
      }
    },
    
    remark(id,text){
      this.$emit('remark', {id,text})
    }
  }
}
</script>
