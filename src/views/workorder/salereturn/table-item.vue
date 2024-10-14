<template>
  <div class="workorder-table-item">
    <div class="td-detail">
      <div class="text">
        <span>退货工单</span>
        <span>工单号：{{itemData.statementNo || '--'}}</span>
        <span>开单时间：{{itemData.createdAt || '--'}}</span>
      </div>
      <div class="pos-right">
        <Tag v-if="$parent.tabType === 4">{{ status !== 3 ? $parent.tabList[status].name : '已作废' }}</Tag>
      </div>
    </div>
    <table class="first-table">
      <tbody>
        <tr>
          <td style="width: 28%">{{itemData.vehicleOwner || '匿名客户'}}</td>
          <td style="width: 28%">{{itemData.ownerMobile || '无手机号码'}}</td>
          <td style="width: 28%">退货金额：<span class="price">￥{{itemData.refundTotal | shift}}</span></td>
          <td class="last-td">
            <div @click="toggleTable">
              <span>{{ !showTable ? '展开' : '收起' }}费用明细</span>
              <Icon :type="!showTable ? 'arrow-down-b': 'arrow-up-b'"></Icon>
            </div>
          </td>
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
            v-for="(item, index) in itemData.refundParts"
            :key="item.partNo"
          >
            <td
              :rowspan="itemData.refundParts.length"
              v-if="index === 0"
            >维修配件</td>
            <td>{{item.partNo}}</td>
            <td>{{item.partName}}</td>
            <td>{{item.refundQuantity}}</td>
            <td>{{item.refundPrice | shift}}</td>
            <td>{{item.refundCost | shift}}</td>
          </tr>
          <tr
            v-for="(item, index) in itemData.refundOthers"
            :key="index"
          >
            <td
              :rowspan="itemData.refundOthers.length"
              v-if="index === 0"
            >其他</td>
            <td>--</td>
            <td>{{item.name}}</td>
            <td>--</td>
            <td>--</td>
            <td>{{item.refundCost | shift}}</td>
          </tr>
          <tr v-if="itemData.refundParts.length === 0 && itemData.refundOthers.length === 0">
            <td
              class="no-data"
              colspan="6"
            >暂无信息</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="opt-btn" v-if="isSelfStore">
      <template v-if="status === 0">
        <i-button
          v-if="permissionData.input"
          @click="outputHandle"
          type="primary"
        >入库</i-button>
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
      <template v-if="status === 1">
        <i-button
          v-if="permissionData.settle"
          type="primary"
          @click="toBalance(itemData._id)"
        >结算</i-button>
        <i-button
          v-if="permissionData.delete"
          @click="cancelHandle"
          type="default"
        >作废</i-button>
      </template>

      <i-button
        v-if="permissionData.check && (status === 2 || status === 3)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <Button
        v-if="permissionData.print"
        type="default"
        @click="print(itemData._id)"
      >打印</Button>
    </div>
    <div class="opt-btn" v-else>
    
      <i-button
        v-if="permissionData.check && (status === 2 || status === 3)"
        @click="toDetail"
        type="primary"
      >查看</i-button>
      <Button
        v-if="permissionData.print"
        type="default"
        @click="print(itemData._id)"
      >打印</Button>
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
    let permissionData = this.$permission.data.workerSalereturn
    return {
      permissionData,
      itemData: {},
      status: 0, // 0 待出库， 1 待结算， 2：已完成， 3：已作废
      showTable: false
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
      if (data.workStatus === '1') this.status = 0 // 待入库
      if (data.workStatus === '2' && data.payStatus === '1') this.status = 1 // 待结算
      if (data.workStatus === '2' && data.payStatus === '2') this.status = 2 // 已完成
      if (data.workStatus === '0') this.status = 3 // 已完成
    },

    outputHandle () {
      this.$emit('item-emit', {
        title: '确定入库',
        content: '确定入库后，工单将无法编辑和作废，确定要入库吗？',
        cancel: true,
        tabType: 1,
        type: 1, // 1入库  0作废
        _id: this.itemData._id
      })
    },

    cancelHandle () {
      this.$emit('item-emit', {
        title: '作废工单',
        content: '工单作废后将不能恢复，确定作废工单？',
        cancel: true,
        tabType: 3,
        type: 0, // 1入库  0作废
        _id: this.itemData._id
      })
    },

    toggleTable () {
      this.showTable = !this.showTable
    },

    toEdit () {
      this.$router.push(
        '/workorder/salereturn/addrefund/' + this.itemData._id + '?refund=true'
      )
    },

    toDetail () {
      this.$router.push(`/workorder/salereturn/detail/${this.itemData._id}?shareStoreId=${this.shareStoreId}`)
    },

    toBalance (id) {
      this.$router.push({ path: '/workorder/salereturn/balance/' + id })
    },

    print (_id) {
      this.$parent.openPrint(_id, this.status)
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
