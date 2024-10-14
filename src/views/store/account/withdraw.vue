<template>
  <div class="account-withdraw">
    <saas-bread title="申请提现"></saas-bread>
    <Form ref="formValidate" 
      class="w-form"
      :model="formData" 
      :rules="ruleValidate" 
      :label-width="125">
      <FormItem label="申请会员" prop="username">
        <span>555</span>
      </FormItem>
      <FormItem label="申请金额" prop="money">
        <Input v-model="formData.money" />
        <p>您当前最高申请金额10元</p>
      </FormItem>
      <FormItem label="手机号码" prop="mobile">
        <Input v-model="formData.mobile"
          :maxlength="11" />
      </FormItem>
      <FormItem label="退款途径" prop="type">
        <Input v-model="formData.mobile"
          :maxlength="11" />
      </FormItem>
      <FormItem label="申请原因" prop="reasonType">
        <CheckboxGroup v-model="formData.reasonType">
          <Checkbox :label="item.value" 
            v-for="(item, index) in reasonType" 
            :key="index">{{ item.label }}</Checkbox>
        </CheckboxGroup>
      </FormItem>
    </Form>
    <bottom-submit  @on-cancel="$router.go(-1)"  
      @on-confirm="submit"
      :loading="btnLoading"></bottom-submit>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import '@/styles/views/store/account-withdraw.less';

export default {
  data () {
    return {
      btnLoading: false,
      reasonType: [
        { label: '余额提现', value: '0' },
        { label: '更换其他类型的产品', value: '1' },
        { label: '产品配置不适用', value: '2' },
        { label: '使用体验差', value: '3' },
        { label: '服务体验差', value: '4' },
        { label: '暂时不购买', value: '5' },
        { label: '其他', value: '99' }
      ],
      formData: {},
      ruleValidate: {}
    }
  },

  methods: {
    submit () {}
  },
}
</script>
