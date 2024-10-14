<template>
  <div class="workorder-table-item">
    <div class="td-detail">
      <div class="text">
        <span>销售工单</span>
        <span>工单号：{{itemData.statementNo || '--'}}</span>
        <span>开单时间：{{itemData.createdAt || '--'}}</span>
        <span v-if="data.billUser.userName">开单人：{{data.billUser.userName}}</span>
        <!-- <Tag v-if="$parent.tabType === 4">{{ status !== -1 ? $parent.tabList[status].name : '已作废' }}</Tag> -->
      </div>
      <div class="pos-right">
        <Tag v-if="$parent.tabType === 5 && itemData.canRefund">{{ status !== -1 ? $parent.tabList[status].name : '已作废' }}</Tag>
        <Tag v-if="getWorkStatus() === '已挂账'">已挂账{{itemData.diffCreditDate }}天</Tag>
        <div
          class="advance"
          v-if="itemData.refundIdList.length > 0"
        >退货中</div>
        <div
          v-if="(status === 0 || status === 1 || status === 2) && parseFloat(itemData.realCost) > 0"
          class="advance"
        >已预收 ¥ {{itemData.realCost}}</div>
      </div>
    </div>
    <!-- <div class="detail first-table">
      <span class="name">{{itemData.vehicleOwner || '匿名客户'}}</span>
      <span class="mobile">{{itemData.ownerMobile || '无手机号码'}}</span>
      <span class="price">应收金额：<span>￥{{itemData.leftReceivable | shift}}</span></span>
      <span :class="['btn', {'show-table': showTable}]" @click="toggleTable">查看费用明细<Icon type="arrow-down-b"></Icon></span>
    </div> -->
    <table class="first-table">
      <tbody>
        <tr>
          <td style="width: 25%">{{itemData.vehicleOwner || '匿名客户'}}</td>
          <td style="width: 25%">{{itemData.ownerMobile || '无手机号码'}}</td>
          <td style="width: 25%">
            <div @click="toggleTable">
              <span>{{ !showTable ? '展开' : '收起' }}费用明细</span>
              <Icon :type="!showTable ? 'arrow-down-b': 'arrow-up-b'"></Icon>
            </div>
          </td>
          <td
            style="width: 15%"
            class="last-td"
            v-if="status === 1 || status === 2"
          >未收金额：<span class="price">￥{{itemData.leftReceivable}}</span></td>
          <td
            style="width: 15%"
            class="last-td"
            v-else-if="status === 3"
          >实收金额：<span class="price">￥{{itemData.realCost}}</span></td>
          <td
            style="width: 15%"
            class="last-td"
            v-else
          >应收金额：<span class="price">￥{{status === 0 ? itemData.leftReceivable : itemData.receivable}}</span></td>
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
    <div
      v-show="showTable"
      style="padding: 0 20px;"
    >
      <table class="table-detail">
        <thead>
          <tr>
            <th>类型</th>
            <th>配件编号</th>
            <th>名称</th>
            <th>数量</th>
            <th>单价</th>
            <th>小计</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in itemData.repairParts"
            :key="item.partNo"
          >
            <td
              :rowspan="itemData.repairParts.length"
              v-if="index === 0"
            >维修配件</td>
            <td>{{item.partNo}}</td>
            <td>{{item.partName}}</td>
            <td>{{item.quantity}}</td>
            <td>{{item.retailPrice | shift}}</td>
            <td>{{item.cost | shift}}</td>
          </tr>
          <tr
            v-for="(item, index) in itemData.others"
            :key="index"
          >
            <td
              :rowspan="itemData.others.length"
              v-if="index === 0"
            >其他</td>
            <td>--</td>
            <td>{{item.name}}</td>
            <td>--</td>
            <td>--</td>
            <td>{{item.cost | shift}}</td>
          </tr>
          <tr v-if="!itemData.repairParts && !itemData.others">
            <td
              class="no-data"
              colspan="5"
            >暂无信息</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="opt-btn" v-if="isSelfStore">
      <template v-if="status === 0">
        <i-button
          v-if="permissionData.output"
          @click="outputHandle"
          type="primary"
        >出库</i-button>
        <Button
          v-if="permissionData.picking"
          type="default"
          @click="getMaterial(data.statementNo)"
        >领料</Button>
        <i-button
          v-if="permissionData.advance"
          type="default"
          @click="toBalance(itemData.statementNo, 1)"
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
        v-if="permissionData.settle && (status === 1 ||status === 2)"
        type="primary"
        @click="toBalance(itemData.statementNo)"
      >结算</i-button>
      <i-button
        v-if="permissionData.credit && status === 1"
        @click="creditHandle"
        type="default"
      >挂账</i-button>
      <i-button
        v-if="permissionData.check && (status === 3 || status === -1)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <Button
        @click="remark(itemData._id,itemData.workOrderRemark)"
      >备注</Button>
      <i-button
        v-if="permissionData.print"
        @click="print(itemData.statementNo)"
        type="default"
      >打印</i-button>
      <i-button
        v-if="permissionData.refund && (status === 3 && itemData.canRefund)"
        @click="toReturn"
        type="default"
      >退货</i-button>
    </div>
    <div class="opt-btn" v-else>
      <i-button
        v-if="permissionData.check && (status === 3 || status === -1)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <i-button
        v-if="permissionData.print"
        @click="print(itemData.statementNo)"
        type="default"
      >打印</i-button>
    </div>
  </div>
</template>

<script>
import '@/styles/views/workorder/table-item.less'

export default {
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
    let permissionData = this.$permission.data.workerSparepart
    return {
      permissionData,
      itemData: {},
      status: 0, // 0 待出库， 1 待结算， 2：已挂账， 3：已完成，-1：已作废
      showTable: false,
      type: this.$parent.tabType
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
      // this.status.type = this.$parent.tabType;
      // this.status.workStatus = this.$parent.tabList[this.status.type].status[0];
      // this.status.payStatus = this.$parent.tabList[this.status.type].status[1];
    },
    setStatus () {
      const data = this.itemData
      if (data.workStatus === '1') this.status = 0 // 待出库
      if (data.workStatus === '2' && data.payStatus === '1') this.status = 1 // 待结算
      if (data.workStatus === '2' && data.payStatus === '3') this.status = 2 // 已挂账
      if (data.workStatus === '2' && data.payStatus === '2') this.status = 3 // 已完成
      if (data.workStatus === '0') this.status = -1 // 待出库
    },
    outputHandle () {
      this.$emit('item-emit', {
        title: '确定出库',
        content: '确定出库后，工单将无法编辑和作废，确定要出库吗？',
        cancel: true,
        tabType: 1,
        type: 1, // 1出库  0作废 2挂账
        statementNo: this.itemData.statementNo
      })
    },
    creditHandle () {
      if (this.data.leftReceivable <= 0) {
        this.$emit('item-emit', {
          title: '该工单金额为0，不能挂账。',
          content: '',
          cancel: false,
          tabType: 1,
          type: 0 // 1出库  0作废 2挂账
        })
        return
      }
      this.$emit('item-emit', {
        title: '工单挂账',
        content: '该工单确定挂账？',
        cancel: true,
        tabType: 2,
        type: 2, // 1出库  0作废 2挂账
        statementNo: this.itemData.statementNo
      })
    },
    cancelHandle () {
      this.$emit('item-emit', {
        title: '作废工单',
        content: '工单作废后将不能恢复，确定作废工单？',
        cancel: true,
        tabType: 4,
        type: 0, // 1出库  0作废 2挂账
        statementNo: this.itemData.statementNo
      })
    },
    toggleTable () {
      this.showTable = !this.showTable
    },

    toEdit () {
      this.$router.push('/workorder/sparepart/add/' + this.itemData.statementNo)
    },

    toDetail () {
      this.$router.push(
        `/workorder/sparepart/detail/${this.itemData.statementNo}?shareStoreId=${this.shareStoreId}`
      )
    },

    toReturn () {
      // 退货
      this.$router.push(
        '/workorder/salereturn/addrefund/' + this.itemData.statementNo
      )
    },

    toBalance (id, isSettle) {
      if (isSettle) {
        this.$router.push({
          path: '/workorder/sparepart/balance/' + id + '?advance=1'
        })
      } else {
        this.$router.push({ path: '/workorder/sparepart/balance/' + id })
      }
    },

    print (statementNo) {
      this.$parent.openPrint(statementNo, this.status)
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
  },

  filters: {
    shift (v) {
      if (!v || Number(v) <= 0) return '0'
      return parseFloat(Number(v).toFixed(2))
    }
  }
}
</script>
