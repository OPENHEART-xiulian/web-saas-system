<template>
  <div class="expand-table">
    <table v-show="isShow">
      <thead>
        <th>类型</th>
        <th>名称</th>
        <th>单价</th>
        <th>工时/数量</th>
        <th>金额（元）</th>
        <th>服务技师</th>
        <th>备注信息</th>
      </thead>
      <tbody>
        <tr
          v-for="(item, index) in tableItem.repairItems"
          :key="'repair' + index"
        >
          <td
            :rowspan="tableItem.repairItems.length"
            v-if="index === 0"
          >维修项目</td>
          <td>{{ item.name }}</td>
          <td>{{ item.price || '--' }}</td>
          <td>{{ item.hours || '--' }}</td>
          <td>{{ item.cost }}</td>
          <td> <span v-if="item.techniciansText">{{item.techniciansText.join(',')}}</span> <span v-else>--</span> </td>
          <td>{{item.remark || '无'}}</td>
        </tr>
        <tr
          v-for="(item, index) in tableItem.repairParts"
          :key="'Parts' + index"
        >
          <td
            :rowspan="tableItem.repairParts.length"
            v-if="index === 0"
          >维修配件</td>
          <td>{{ item.partName }}</td>
          <td>{{ item.retailPrice }}</td>
          <td>{{ item.quantity }}</td>
          <td>{{ item.cost }}</td>
          <td>{{ '--' }}</td>
          <td>{{ '--' }}</td>
        </tr>
        <tr
          v-for="(item, index) in tableItem.others"
          :key="'others' + index"
        >
          <td
            :rowspan="tableItem.others.length"
            v-if="index === 0"
          >其他项目</td>
          <td>{{ item.name }}</td>
          <td>--</td>
          <td>--</td>
          <td>{{ item.cost }}</td>
        </tr>
      </tbody>
    </table>
    <div
      class="no-data"
      v-show="isShow"
      v-if="tableItem.repairItems && tableItem.repairItems.length === 0 &&
        tableItem.repairParts && tableItem.repairParts.length === 0 &&
        tableItem.others && tableItem.others.length === 0"
    >暂无数据
    </div>
  </div>
</template>

<script>
import '@/styles/views/workorder/expand-table.less'
import mixins from './mixins.js'
export default {
  props: {
    tableItem: Object,
    isShow: Boolean
  },
  mixins: [mixins],
  data () {
    return {}
  },
  created () {
    // this.$store.dispatch('toGetBillUsers')
  },
  watch: {
    tableItem: {
      handler (newName, oldName) {
        try {
          if (this.billUsers.length == 0) return
          if (!newName.repairItems) return
          newName.repairItems.map(item => {
            item.techniciansText = []
            item.technicians.map(itemc => {
              let obj = this.billUsers.find(itemBill => itemBill._id === itemc)
              if (obj) item.techniciansText.push(obj.username)
            })
          })
        } catch (error) {
          console.log(error)
        }
      },
      immediate: true,
      deep: true
    }
  }
}
</script>
