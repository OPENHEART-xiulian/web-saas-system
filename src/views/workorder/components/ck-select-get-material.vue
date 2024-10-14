<template>
  <i-select
    v-model="warehouseId"
    @on-change="onChange"
    :disabled="disabled"
    :multiple="multiple"
  >
    <i-option
      v-for="(item, index) in data.warehouses"
      :key="index"
      :value="item.warehouseId"
    >{{item.warehouseName}}</i-option>
  </i-select>
</template>

<script>
export default {
  props: {
    data: Object,
    index: Number,
    request: {
      type: String,
      default: 'wateflowItem'
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      warehouseId: '',
      disabled: false,
      list: []
    }
  },

  created () {
    if (this.data.stockOutType == 1) {
      this.data.warehouseId
        ? (this.warehouseId = this.data.warehouseId)
        : (this.warehouseId = this.data.warehouses[0].warehouseId)
    }

    // if (this.data.warehouseList) {
    //   this.list = this.data.warehouseList;
    //   this.warehouseId = this.data.warehouseId;
    //   this.onChange(this.warehouseId);
    // } else {
    //   this.getData();
    // }
  },

  methods: {
    async getData () {
      const res = await this.$store.dispatch({
        type: 'actionGet',
        name: this.request,
        params: {
          componentId: this.data.componentId
        }
      })

      if (res.code === '0') {
        this.setDefault(res.data.rows || [])
      }
    },

    setDefault (list) {
      let hasWarehouse = false // 是否有对应数据
      let hasDefault = false
      let allOriginQuantity = 0

      // 只有领料的时候，库存数量要加上当前数量
      if (this.data.stockOutType === '1') {
        this.data.isEdit = true
      } else {
        this.data.isEdit = false
      }

      list.forEach(elm => {
        if (elm.isDefault === '1') hasDefault = JSON.parse(JSON.stringify(elm))
        if (elm.warehouseId === this.data.warehouseId && this.data.isEdit) {
          hasWarehouse = JSON.parse(JSON.stringify(elm))
          allOriginQuantity += Number(elm.quantity) + Number(this.data.quantity)
          elm.originQuantity = Number(elm.quantity) + Number(this.data.quantity)
        } else {
          allOriginQuantity += Number(elm.quantity)
          elm.originQuantity = Number(elm.quantity)
        }
        elm.originQuantity = elm.originQuantity.toFixed(2)
      })

      let warehouseId = ''
      if (this.data.warehouseId && !hasWarehouse && this.data.isEdit) {
        allOriginQuantity =
          Number(allOriginQuantity) + Number(this.data.quantity)
        let wrehouse = {
          isDefault: hasDefault ? '0' : '1',
          originQuantity: this.data.quantity,
          purchasePrice: this.data.purchasePrice,
          retailPrice: this.data.retailPrice,
          warehouseId: this.data.warehouseId,
          warehouseName: this.data.warehouseName
        }
        hasDefault ? list.push(wrehouse) : list.unshift(wrehouse)
        warehouseId = this.data.warehouseId
      } else if (this.data.warehouseId && hasWarehouse) {
        warehouseId = hasWarehouse.warehouseId
      } else {
        warehouseId = hasDefault
          ? hasDefault.warehouseId
          : list[0]
          ? list[0].warehouseId
          : ''
      }

      this.list = list
      this.data.allOriginQuantity = allOriginQuantity
      this.data.warehouseList = list
      this.warehouseId = warehouseId
      this.onChange(warehouseId, true)
    },

    onChange (v, isDefault) {
      let data = this.list.find(elm => elm.warehouseId === v)
      if (data) {
        this.data.warehouseId = data.warehouseId
        this.data.warehouseName = data.warehouseName
        this.data.originQuantity = data.originQuantity
        this.data.quantity = this.data.quantity
        if (
          Number(this.data.quantity) > Number(this.data.originQuantity) &&
          this.data.stockOutType === '1'
        ) {
          this.data.quantity = this.data.originQuantity
        }
        if (!isDefault) {
          this.data.purchasePrice = data.purchasePrice
          this.data.retailPrice = data.retailPrice
        }
      }
      let cost = this.data.quantity * this.data.retailPrice
      this.data.cost = cost
      this.$emit('on-change', this.data, data, this.index)
    }
  }
}
</script>
