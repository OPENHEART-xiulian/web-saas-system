<template>
  <Modal 
    title="优惠" 
    v-model="modal"
    width="500px" 
    @on-ok="onOk"
    class="w-dialog discounts-dialog">
    <p>工单总金额<span>¥ {{ cost }}</span></p>
    <Form :model="formData" :rules="rules">
      <FormItem class="discounts-items">
        <span class="first-text">整单折扣</span>
        <i-input-number 
          :min="0"
          :max="cost === 0 ? 0 : 100"
          :step="0.1"
          v-model="formData.discount" 
          @on-change="discountChange" 
          reg="REPLACE_NUMBER_DOT"
        />
        <span class="append">%</span>
        <span>已优惠</span>
        <i-input-number 
          :min="0"
          :max="cost"
          :step="0.1"
          v-model="formData.discountCost" 
          @on-change="costChange" 
          reg="REPLACE_NUMBER_DOT"
        />
        <span class="append">元</span>
      </FormItem>
    </Form>
    <p>实收金额<span class="price">¥ {{ realCost }}</span></p>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';
export default {
  mixins: [mixins],
  data () {
    return {
      cost: 0,
      realCost: 0,
      formData: {
        discount: 100.00,
        discountCost: 0,
        discountType: 'nodiscount'
      },
      rules: {

      }
    }
  },
  methods: {
    openModal (value) {
      this.modal = true;
      this.cost = Number(value || 0);
      this.realCost = parseFloat(this.cost - this.formData.discountCost).toFixed(2);
    },
    discountChange () {
      if (this.formData.discount) {
        const discount = (this.formData.discount / 100).toFixed(2);
        this.formData.discountCost = parseFloat((this.cost - this.cost * discount).toFixed(2));
      } else {
        this.formData.discountCost = 0;
        this.formData.discount = 100.00;
      }
      
      this.realCost = parseFloat(this.cost - this.formData.discountCost).toFixed(2);
      this.formData.discountType = 'discount';
    },
    costChange () {
      this.formData.discount = parseFloat(((this.cost - this.formData.discountCost) * 100 / this.cost).toFixed(2)) || 100.00;
      this.formData.discountCost = this.formData.discountCost || 0;
      this.realCost = parseFloat(this.cost - this.formData.discountCost).toFixed(2);
      this.formData.discountType = 'discountCost';
    },
    
    onOk () {
      this.formData.discount = this.formData.discount || 100.00;
      this.formData.discountCost = this.formData.discountCost || 0;
      if (!this.formData.discountCost) this.formData.discountType = 'nodiscount';
      this.$emit('on-ok', Object.assign({}, this.formData), this.realCost);
    },
  }
}
</script>
