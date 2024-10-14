<template>
  <!-- 项目信息 -->
  <div>
    <table class="input-list-table">
      <thead
        class="theader"
        v-if="formRows.length > 0"
      >
        <tr class="row">
          <th class="col">{{title || '维修项目'}}</th>
          <th class="col">定价方式</th>
          <th class="col">工时费</th>
          <th class="col">工时</th>
          <th class="col">金额 (元)</th>
          <th class="col">服务技师<Icon
              type="edit"
              class="selectMaterialHuman"
              @click="choiceGetHuman"
            ></Icon>
          </th>
          <th class="col">备注</th>
          <!-- <th class="col col-140">施工人员</th> -->
          <th
            class="col col-50"
            v-if="formRows.length > 0"
          ></th>
        </tr>
      </thead>
      <tbody class="tbody">
        <tr
          class="row"
          v-for="(item, index) in formRows"
          :key="index"
        >
          <td class="col">
            <Tooltip
              placement="top"
              :content="formRows[index].serviceName"
            >
              <span>{{formRows[index].serviceName}}</span>
              <!-- <i-input v-model="formRows[index].serviceName" disabled></i-input> -->
            </Tooltip>
          </td>
          <td class="col">
            <Select
              v-model="formRows[index].pricingType"
              disabled
            >
              <Option value="A">作业定价</Option>
              <Option value="B">工时定价</Option>
            </Select>
          </td>
          <td class="col">
            <format-input
              v-model="formRows[index].price"
              @on-blur="getRowCost(index)"
              reg="PRECISION"
              :disabled="formRows[index].pricingType !== 'B'"
            >
            </format-input>
            <!-- <i-input v-model="formRows[index].price" @on-blur="getRowCost(index)" :disabled="formRows[index].pricingType !== 'B'"></i-input> -->
          </td>
          <td class="col">
            <format-input
              v-model="formRows[index].hours"
              @on-blur="getRowCost(index)"
              reg="PRECISION"
              :disabled="formRows[index].pricingType !== 'B'"
            ></format-input>
            <!-- <i-input v-model="formRows[index].hours" @on-blur="getRowCost(index)" :disabled="formRows[index].pricingType !== 'B'"></i-input> -->
          </td>
          <td class="col">
            <i-input
              v-model="formRows[index].realityCost"
              @on-blur="realityChange(index)"
              :disabled="formRows[index].pricingType !== 'A'"
            ></i-input>
          </td>
          <td class="col">
            <Select
              v-model="item.technicians"
              multiple
            >
              <Option
                v-for="item in billUsers"
                :value="item.value"
                :key="item.value"
              >{{ item.label }}</Option>
            </Select>
          </td>
          <td class="col">
            <i-input v-model="formRows[index].remark"></i-input>
          </td>
          <!-- <td class="col col-140">
            <i-input v-model="formRows[index].realityCost" placeholder="" readonly></i-input>
          </td> -->
          <td
            class="col col-50"
            v-if="formRows.length > 0"
          >
            <i
              class="iconfont icon-shanchu"
              @click="removeFormRows(index)"
            ></i>
          </td>
        </tr>
        <tr
          class="no-data"
          v-if="formRows.length === 0"
        >
          <td colspan="6">暂无项目信息，请选择项目</td>
        </tr>
      </tbody>
      <tfoot class="tfooter">
        <tr>
          <td colspan="8">
            <i-button
              type="primary"
              @click="openCateDialog"
            >选择项目</i-button>
          </td>
        </tr>
      </tfoot>
    </table>
    <choose-dialog
      ref="choose"
      @choose-success="distinct"
    ></choose-dialog>
    <Modal
      title="选择领料人(批量)"
      v-model="modalHuman"
      width="400px"
      ok-text="确认"
      :mask-closable="false"
      @on-ok="requireGetHuman"
      @on-cancel="modal=true"
    >
      <Select
        v-model="allHuman"
        style="width:100%"
        multiple
      >
        <Option
          v-for="item in billUsers"
          :value="item.value"
          :key="item.value"
        >{{ item.label }}</Option>
      </Select>
    </Modal>
  </div>
</template>

<script>
import mixins from './mixins.js'
import chooseDialog from '@/components/dialog/choose-service-dialog'
import { storage } from '@/assets/js/utils.js'
export default {
  components: { chooseDialog },
  mixins: [mixins],
  props: {
    title: String
  },
  data () {
    return {
      storage,
      row: {
        name: '', // 服务项目名称 提交的
        serviceName: '', // 服务项目名称 显示的
        pricingType: '', // 定价方式 A 作业定价  B 工时定价
        hours: '', // 服务项目工时
        price: '', // 服务项目单价
        cost: '', // 维修项目单条金额
        realityCost: '' // 用于显示的金额
      },
      model2: '',
      modalHuman: false,
      allHuman: []
    }
  },
  methods: {
    // 批量选择取料人
    choiceGetHuman () {
      this.modalHuman = true
    },
    // 确认选择批量取料人
    requireGetHuman () {
      this.formRows.map(item => {
        item.technicians = this.allHuman
      })
    },
    initList (to) {
      to.forEach(item => {
        let newItem = Object.assign({}, this.row, item)
        newItem.serviceName = newItem.serviceName || newItem.name
        if (newItem.pricingType) {
          newItem.name = newItem.serviceName || newItem.name
        }
        let cost
        // A 是作业定价 返回tPrice
        if (newItem.pricingType === 'A') {
          newItem.hours = '--'
          newItem.price = '--'
          cost = Number(newItem.cost)
        } else {
          cost = this.product(newItem.hours, newItem.price)
        }
        newItem.cost = String(cost) // 提交的
        newItem.realityCost = cost.toFixed(2) // 显示的
        if (newItem.name === '') newItem.realityCost = ''
        newItem.technicians
          ? (newItem.technicians = newItem.technicians)
          : (newItem.technicians = [])
        if (newItem.technicians.length === 0) {
          newItem.technicians.push(storage.get('USER').userId)
        }
        this.formRows.push(newItem)
      })
    },
    getRowCost (index) {
      if (this.formRows[index].pricingType !== 'B') return
      let hours = this.formRows[index].hours || 0
      let price = this.formRows[index].price || 0
      let cost = this.product(hours, price)
      this.formRows[index].cost = String(cost)
      this.$set(this.formRows[index], 'realityCost', cost.toFixed(2))
      this.getSum()
    },
    realityChange (index) {
      if (this.formRows[index].pricingType !== 'A') return
      let cost = Number(this.formRows[index].realityCost)
      this.formRows[index].cost = String(cost)
      this.$set(this.formRows[index], 'realityCost', cost.toFixed(2))
      this.getSum()
    },
    // optionChange (data) {
    //   let item = this.formRows[this.focusIndex];
    //   item.name = data.serviceName;
    //   item.serviceName = data.serviceName;
    //   item.pricingType = data.pricingType;

    //   let cost;
    //   // A 是作业定价 返回tPrice
    //   if (item.pricingType === 'A') {
    //     item.hours = '--';
    //     item.price = '--';
    //     cost = Number(data.tPrice);
    //   } else {
    //     item.hours = String(data.hours);
    //     item.price = String(data.price);
    //     cost = this.product(data.hours, data.price);
    //   }
    //   item.cost = String(cost);
    //   this.$set(this.formRows[this.focusIndex], 'realityCost', cost.toFixed(2));
    //   this.getSum();
    //   // this.$emit('option-change', data, item);
    // },
    openCateDialog () {
      this.$refs.choose.openModal(JSON.parse(JSON.stringify(this.formRows)))
    },

    distinct (array) {
      // let arr = this.formRows.concat(array);
      this.formRows = []
      this.initList(array)
      this.getSum()
    },
    getFormRows () {
      let data = []
      let arr = JSON.parse(JSON.stringify(this.formRows))
      arr.forEach(item => {
        if (item.name && item.name !== '') {
          if (item.pricingType === 'A') {
            item.hours = '0'
            item.price = '0'
          }
          item.cost = String(parseFloat(Number(item.cost).toFixed(2)))
          data.push(item)
        }
      })
      return data
    }
  }
}
</script>
