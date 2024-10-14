<template>
  <Modal 
    title="税费" 
    v-model="modal"
    width="500px" 
    @on-ok="onOk"
    class="w-dialog discounts-dialog">
    <Form :model="formData" :rules="rules">
      <FormItem class="discounts-items">
        <span class="first-text">税率</span>
        <i-input-number 
          :min="0"
          v-model="formData.taxRate" 
          @on-change="rateChange" 
          reg="REPLACE_NUMBER_DOT"
        />
        <span class="append">%</span>
        <span>税费</span>
        <i-input-number 
          :min="0"
          v-model="formData.tax" 
          @on-change="taxChange" 
          reg="REPLACE_NUMBER_DOT"
        />
        <span class="append">元</span>
      </FormItem>
    </Form>
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
        taxRate: 0,
        tax: 0
      },
      rules: {

      }
    }
  },
  methods: {
    openModal (value) {
      this.modal = true;
      this.cost = Number(value || 0);
      this.realCost = this.cost + this.formData.tax;
    },
    rateChange () {
      if (this.formData.taxRate) {
        this.formData.tax = parseFloat((this.cost * this.formData.taxRate / 100).toFixed(2));
      } else {
        this.formData.tax = 0;
        this.formData.taxRate = 0;
      }

      this.realCost = parseFloat(this.cost + this.formData.tax).toFixed(2);
    },
    taxChange () {
      if (this.formData.tax) {
        if (this.cost === 0) {
          this.formData.taxRate = 0;
        } else {
          this.formData.taxRate = parseFloat((this.formData.tax * 100 / this.cost).toFixed(2));
        }
      } else {
        this.formData.tax = 0;
        this.formData.taxRate = 0;
      }

      this.realCost = parseFloat(this.cost + this.formData.tax).toFixed(2);
    },
    
    onOk () {
      this.$emit('on-ok', Object.assign({}, this.formData), this.realCost);
    },
  }
}
</script>
