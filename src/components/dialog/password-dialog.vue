<template>
  <Modal title="更改密码" v-model="modal" 
    width="600"
    class="w-dialog password-dialog">
    <Form 
      ref="form"
      :model="formData" 
      :rules="rules" 
      :label-width="130"
      label-position="right">
      <FormItem label="原登录密码" prop="originPassword">
        <Input type="password" v-model="formData.originPassword" :maxlength="16" placeholder="请输入原来的密码" />
      </FormItem>
      <FormItem label="新登录密码" prop="password">
        <Input type="password" v-model="formData.password" :maxlength="16" placeholder="设置6-16位新密码，区分大小写" />
      </FormItem>
      <FormItem label="确认登录密码" prop="confirmPassword">
        <Input type="password" v-model="formData.confirmPassword" :maxlength="16" placeholder="再次输入新的密码" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="submit" :loading="loading">确定</Button>
      </FormItem>
    </Form>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
import { formVerify, storage, clearStorge } from '@/assets/js/utils.js';

export default {
  data () {
    return {
      modal: false,
      loading: false,
      formData: {
        originPassword: '',
        password: '',
        confirmPassword: ''
      },
      rules: {
        originPassword: [
          { 
            required: true, 
            trigger: 'blur', 
            reg: 'PASSWORD',
            message: '请输入原始密码', 
            formatTip: '请输入6-16位的密码，不能包含中文或空格',
            validator: formVerify.format
          }
        ],
        password: [
          { 
            required: true, 
            trigger: 'blur', 
            reg: 'PASSWORD',
            message: '请输入新密码', 
            formatTip: '请输入6-16位的密码，不能包含中文或空格',
            validator: formVerify.format
          }
        ],
        confirmPassword: [
          { 
            trigger: 'blur', 
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (value !== this.formData.password) {
                rules.message = '两次密码不一致';
                return callback(rules.message);
              }
              callback();
            }
          }
        ]
      }
    }
  },

  methods: {
    openModel () {
      this.$refs.form.resetFields();
      this.modal = true;
    },
    submit () {
      this.$refs.form.validate( valid => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch({
            type: 'toUpdatePassword',
            params: this.formData
          }).then((res) => {
            if (res.code === '0') {
              this.$Message.success({
                content: '修改成功',
                onClose: () => {
                  // clearStorge();
                  // location.reload();
                  this.modal = false;
                  this.loading = false;
                }
              })
            } else {
              this.loading = false;
              if (res.code === '107002') {
                this.$Message.warning('原登录密码输入错误');
              }
            } 
          }).catch((err) => {
            this.loading = false;
          });
        }
      })
    }
  }
}
</script>
