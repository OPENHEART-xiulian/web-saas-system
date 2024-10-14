<template>
  <div class="firstStep">
    <Form ref="form" 
      class="form"
      :model="formData" 
      :rules="rules"
      :label-width="200">

      <FormItem label="设置交易密码" prop="password">
        <format-input reg="PRECISION" v-model="formData.password" class="form_input" maxlength="6">
        </format-input>
        <span class="rightTips">请输入6位数字密码，建议勿与银行卡取款密码相同</span>
      </FormItem>
      <FormItem label="确认交易密码" prop="passwordAgain">
        <format-input reg="PRECISION" v-model="formData.passwordAgain" class="form_input" maxlength="6">
        </format-input>
      </FormItem>
      <FormItem label="" >
        <i-button type="primary" @click="submit">确定设置</i-button>
        <i-button style="margin-left:20px;" @click="cancel">取消</i-button>
      </FormItem>
    </Form>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import '@/styles/views/account/bindingCard/index.less'
import { mapGetters } from 'vuex';
import { storage } from '@/assets/js/utils.js';

export default {
  components: {},

  data () {
    const passwordValidator =  (rule, value, callback) => {
        if (value === '' || value !== this.formData.password) {
            callback(new Error());
        } else {
            if (this.formData.password === '') {
              callback(new Error())
            }
            callback();
        }
    };
    return {
      formData: {},
      rules: {
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' }
        ],
        passwordAgain: [
          { required: true, message: '请输入相同密码', trigger: 'blur', validator: passwordValidator }
        ],
      }
    }
  },

  created () {

  },

  computed: {

  },

  methods: {
    submit () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          
        }
      })
    },

    cancel () {
      this.$emit('on-cancel');
    }
  },

}
</script>
