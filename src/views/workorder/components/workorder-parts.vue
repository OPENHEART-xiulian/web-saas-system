<template>
  <!-- 项目信息 -->
  <div>
    <table class="input-list-table">
      <thead
        class="theader"
        v-if="formRows.length > 0"
      >
        <tr class="row">
          <th class="col">配件名称</th>
          <th class="col">配件编号</th>
          <th class="col">原厂编码</th>
          <th class="col">品牌</th>
          <th
            class="col"
            style="width: 120px"
          >出库类型</th>
          <th
            class="col"
            style="width: 120px"
          >仓库</th>
          <th class="col">数量</th>
          <th class="col">现有库存</th>
          <th class="col">单价 (元)</th>
          <th class="col">金额 (元)</th>
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
          :key="item.key"
        >
          <td class="col">
            <Tooltip
              v-if="item.partName"
              placement="top"
              :content="item.partName"
            >{{item.partName}}</Tooltip>
            <span v-else>--</span>
          </td>
          <td class="col">
            <Tooltip
              v-if="item.partNo"
              placement="top"
              :content="item.partNo"
            >{{item.partNo}}</Tooltip>
            <span v-else>--</span>
          </td>
          <td class="col">
            <Tooltip
              v-if="item.partFactoryNo"
              placement="top"
              :content="item.partFactoryNo"
            >{{item.partFactoryNo}}</Tooltip>
            <span v-else>--</span>
          </td>
          <td class="col">
            <Tooltip
              v-if="item.brand"
              placement="top"
              :content="item.brand"
            >{{item.brand}}</Tooltip>
            <span v-else>--</span>
          </td>
          <td class="col">
            <i-select
              v-model="formRows[index].stockOutType "
              @on-change="typeChange(index)"
            >
              <i-option
                value="1"
                :disabled="!visibleType(item.componentId)"
              >领料</i-option>
              <i-option
                value="2"
                :disabled="visibleType(item.componentId)"
              >即进即出</i-option>
              <i-option
                v-if="!hideSinceBeld"
                value="3"
              >自带</i-option>
            </i-select>
          </td>
          <td class="col">
            <c-k-select
              v-show="visibleType(item.componentId) && item.stockOutType == 1"
              :data="item"
              :index="index"
              @on-change="ckChange"
            >
            </c-k-select>
            <span v-show="!visibleType(item.componentId) || item.stockOutType != 1">--</span>
          </td>
          <td class="col">
            <format-input
              v-model="formRows[index].quantity"
              :max="formRows[index].stockOutType === '1' ? formRows[index].originQuantity : null"
              :min="0.01"
              @on-change="onNumChange(index)"
              @on-blur="getRowCost(index, item.stockOutType)"
              reg="PRECISION"
            >
            </format-input>
          </td>
          <td class="col">
            <span>{{formRows[index].originQuantity}}</span>
            <!-- <i-input v-model="formRows[index].originQuantity" disabled></i-input> -->
          </td>
          <td class="col">
            <format-input
              v-if="item.stockOutType !== '3'"
              v-model="formRows[index].retailPrice"
              @on-blur="getRowCost(index)"
              reg="PRECISION"
              :disabled="item.stockOutType === '3'"
            ></format-input>
            <span v-else>--</span>
            <!-- <i-input v-model="formRows[index].retailPrice" :disabled="item.stockOutType === '3'" @on-blur="getRowCost(index)"></i-input> -->
          </td>
          <td class="col">
            <span v-if="item.stockOutType !== '3'">{{item.cost | toFixed}}</span>
            <span v-else>--</span>
            <!-- <i-input v-model="formRows[index].realityCost" disabled></i-input> -->
          </td>
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
          <td colspan="11">暂无配件信息，请选择配件</td>
        </tr>
      </tbody>
      <tfoot class="tfooter">
        <tr>
          <td colspan="11">
            <i-button
              type="primary"
              @click="openChoose"
            >选择配件</i-button>
          </td>
        </tr>
      </tfoot>
    </table>
    <choose-dialog
      ref="choose"
      @choose-success="distinct"
    ></choose-dialog>
  </div>
</template>

<script>
import CKSelect from './ck-select'
import mixins from './mixins.js'
import chooseDialog from '@/components/dialog/choose-maintain-dialog'
export default {
  components: { chooseDialog, CKSelect },
  mixins: [mixins],
  props: {
    hideSinceBeld: Boolean,
    defaultList: Array
  },
  data () {
    return {
      focusIndex: 0,
      tempObject: {},
      formRows: [],
      row: {
        partName: '', // 配件名称
        partNo: '', // 配件编号
        stockOutType: '', // 出库类型
        brand: '', // 配件品牌
        quantity: '', // 配件数量
        originQuantity: '', // 配件库存
        retailPrice: '', // 销售价
        purchasePrice: '', // 成本价
        realityCost: '', // 配件金额 （ 显示）
        cost: '' // 配件金额 （提交）
      }
    }
  },
  watch: {
    defaultList (to) {
      this.initList(to)
    }
  },
  created () {
    // this.initList(this.defaultList || []);parts
  },
  methods: {
    initList (to) {
      to.forEach(elm => {
        elm.key = elm.componentId + new Date().getTime()
      })
      // this.formRows.splice(0, this.formRows.length, ...to);
      this.formRows = JSON.parse(JSON.stringify(to))
    },
    getRowCost (index, stockOutType) {
      if (stockOutType === '3') return
      const item = this.formRows[index]
      let quantity = item.quantity
      let retailPrice = item.retailPrice
      let cost = quantity * retailPrice
      item.cost = cost
      this.formRows.splice(index, 1, item)
      // this.$set(this.formRows[index], 'cost', cost);
      this.getSum()
    },
    openChoose () {
      let formRows = JSON.parse(JSON.stringify(this.formRows))
      formRows.forEach(item => {
        item.quantity = item.originQuantity
        delete item.originQuantity
      })
      this.$refs.choose.openModel(formRows)
    },
    distinct (array) {
      console.log(array)
      array.forEach((item, index) => {
        // 入库列表返回的时候不存在originQuantity字段， 先把quantity(现有库存)的值赋值到originQuantity(现有库存)
        item.originQuantity = item.quantity
        item.stockOutType = ''
        item.quantity = '1'
        const citem = this.tempObject[item.componentId]
        if (citem) {
          item.stockOutType = citem.stockOutType
          item.warehouseList = citem.warehouseList
          item.warehouseId = citem.warehouseId || ''
          item.originQuantity = citem.originQuantity
          item.quantity = citem.quantity
          item.cost = citem.cost
        }
      })
      // this.formRows = array;
      this.initList(array)
      // this.getSum();
    },
    getFormRows () {
      let data = JSON.parse(JSON.stringify(this.formRows))
      data.forEach(item => {
        if (item.originQuantity === '--') item.originQuantity = '0'
        if (item.realityCost === '--') item.realityCost = '0'
        if (item.retailPrice === '--') item.retailPrice = '0'
        item.originQuantity = String(item.originQuantity || 0)
        item.quantity = String(parseFloat(item.quantity))
        item.retailPrice = String(
          parseFloat(Number(item.retailPrice).toFixed(2))
        )
        item.cost = String(parseFloat(Number(item.cost).toFixed(2)))

        // item.warehouseId = '';
        // item.warehouseName = '';
        // item.shelfId = '';
        // item.shelfName = '';
      })
      return data
    },
    typeChange (index) {
      let data = this.formRows[index]
      if (data.stockOutType === '3') {
        this.tempObject[data.componentId] = JSON.parse(JSON.stringify(data))
        data.originQuantity = '--'
        data.retailPrice = '--'
        data.realityCost = '--'
        data.cost = 0
      } else {
        let temp = this.tempObject[data.componentId]
        if (Number(temp.originQuantity) < Number(data.quantity)) {
          data.quantity = temp.originQuantity
        }
        // 自带切换到即进即出的时候，数量为0的时候默认设置为是1
        if (data.stockOutType === '2' && Number(data.quantity) === 0) {
          data.quantity = '1'
        }
        data.originQuantity = temp.originQuantity
        data.retailPrice = temp.retailPrice
        const cost = data.retailPrice * data.quantity
        data.cost = cost
      }
      this.getSum()
    },
    ckChange (data) {
      if (!data.stockOutType) {
        data.stockOutType = Number(data.originQuantity) > 0 ? '1' : '2'
      }
      this.tempObject[data.componentId] = JSON.parse(JSON.stringify(data))
      if (data.stockOutType === '3') {
        data.originQuantity = '--'
        // data.purchasePrice = '--';
        data.retailPrice = '--'
        data.cost = '0'
      }
      this.getSum()
      // this.formRows[index].warehouseId = data.warehouseId;
      // this.formRows[index].warehouseName = data.warehouseName;
      // this.formRows[index].originQuantity = data.quantity;
      // if (Number(this.formRows[index].quantity) > Number(data.quantity)) {
      //   this.formRows[index].quantity = data.quantity;
      // }
    },
    onNumChange (index) {
      this.formRows[index].receivedCount = 0
      this.formRows[index].receivedStatus = 0
    },

    visibleType (id) {
      let data = this.tempObject[id]
      if (data && data.warehouseList.length) {
        return true
      }
      return false
    },

    hasWarehouse (id) {
      let data = this.tempObject[id]
      if (data) {
        return data.warehouseList.length
      }
      return false
    }
  }
}
</script>
