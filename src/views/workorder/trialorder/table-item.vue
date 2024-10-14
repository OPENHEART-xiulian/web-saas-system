<template>
  <!-- 试算单 -->
  <div class="workorder-table-item">
    <div class="td-detail">
      <div class="text">
        <span>试算单号：{{ tableItem.statementNo }}</span>
        <span>开单时间：{{ tableItem.createdAt }}</span>
        <span>开单人：{{tableItem.billUser.userName}}</span>
      </div>
    </div>
    <table class="first-table">
      <tbody>
        <tr>
          <!-- 车牌号码 -->
          <td>
            <p v-if="tableItem.plateNo" class="plate-no">{{ tableItem.plateNo }}</p>
            <span v-else style="margin-right: 10px; color: #888;">暂无车牌号</span>
            <my-img :src="GET_BRAND_LOGO + tableItem.brandId" />
            <div class="img-block">
              <p>{{ tableItem.vehicleBrand }}<span v-if="tableItem.vehicleBrand !== '其他品牌'">-</span>{{ tableItem.carSeries }} {{ tableItem.carStyle }}</p>
            </div>
          </td>
          <td style="width: 136px;">{{ tableItem.vehicleOwner || '--' }}</td>
          <td style="width: 120px;">{{ tableItem.ownerMobile || '--' }}</td>
          <td style="width: 100px">
            <div @click="toggleTable">
              <span>{{ !showTable ? '展开' : '收起' }}费用明细</span>
              <Icon :type="!showTable ? 'arrow-down-b': 'arrow-up-b'"></Icon>
            </div>
          </td>
          <td class="last-td">
            <span>应收金额：</span>
            <span class="price">￥{{ tableItem.receivable }}</span>
          </td>
        </tr>
      </tbody>
    </table>
    <expand-table
      :tableItem="tableItem"
      :is-show="showTable"
    ></expand-table>
    <div class="opt-btn" v-if="isSelfStore">
      <!-- 待施工 -->
      <div style="display: inline-block;">
        <!-- 0： 试算单   1：正式工单 -->
        <template v-if="tableItem.trialStatus == '0'">
          <Button v-if="permissionData.generate" type="warning" @click="toComplete">生成工单</Button>
          <Button v-if="permissionData.update" type="default" @click="edit(tableItem.statementNo)">编辑</Button>
        </template>
        <template v-else>
          <Button v-if="permissionData.check" type="default" @click="check(tableItem.officalOrderNo)">查看工单</Button>
        </template>
      </div>
      <!-- 打印所有状态下都有 -->
      <Dropdown trigger="click" v-if="permissionData.print">
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(tableItem.statementNo, 9)">报价单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 2)">委托书</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 1)">派工单</DropdownItem>
        </DropdownMenu>
      </Dropdown>
      <Dropdown trigger="click" v-if="permissionData.delete">
        <Button type="default">•••</Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="toCancel">删除</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
    <div class="opt-btn" v-else>
      <!-- 待施工 -->
      <div style="display: inline-block;">
        <!-- 0： 试算单   1：正式工单 -->
        <template v-if="tableItem.trialStatus == '0'">
        </template>
        <template v-else>
          <Button v-if="permissionData.check" type="default" @click="check(tableItem.officalOrderNo)">查看工单</Button>
        </template>
      </div>
      <!-- 打印所有状态下都有 -->
      <Dropdown trigger="click" v-if="permissionData.print">
        <Button type="default">
          打印
          <Icon type="arrow-down-b"></Icon>
        </Button>
        <DropdownMenu slot="list">
          <DropdownItem @click.native="print(tableItem.statementNo, 9)">报价单</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 2)">委托书</DropdownItem>
          <DropdownItem @click.native="print(tableItem.statementNo, 1)">派工单</DropdownItem>
        </DropdownMenu>
      </Dropdown>
    </div>
  </div>
</template>

<script>
import expandTable from './../components/expand-table'
import '@/styles/views/workorder/table-item.less'
// import { formatTime } from '@/assets/js/utils.js'
import { GET_BRAND_LOGO } from '@/https/api'

export default {
  components: { expandTable },

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
    let permissionData = this.$permission.data.workerTrialorder
    return {
      permissionData,
      GET_BRAND_LOGO,
      showTable: false
    }
  },

  methods: {
    toggleTable () {
      this.showTable = !this.showTable
    },

    check (statementNo) {
      this.$router.push({
        path: '/workorder/worker/detail/' + statementNo
      })
    },

    edit (statementNo) {
      this.$router.push({
        path: '/workorder/trialorder/add/' + statementNo
      })
    },

    toDetail (id) {
      this.$router.push({ path: `/workorder/trialorder/detail/${id}?shareStoreId=${this.shareStoreId}` })
    },

    toComplete () {
      this.$parent.openRemindModal(this.tableItem._id, this.tableItem.statementNo, 1, '生成工单', '将在“维修工单”处生成该工单信息，是否确认进行该操作？')
    },

    // 删除
    toCancel () {
      this.$parent.openRemindModal(this.tableItem._id, this.tableItem.statementNo, -1, '删除工单', '删除后无法恢复，确定继续？')
    },

    print (statementNo, type) {
      // 打印
      this.$parent.openPrint(statementNo, type)
    },
  }
}
</script>
