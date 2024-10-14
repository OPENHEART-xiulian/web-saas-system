<template>
  <Modal title="认领门店" v-model="modal" 
    class="w-dialog claim-dialog"
    width="500">
    <Form  
      ref="form" 
      :model="formData" 
      :rules="rules" 
      :label-width="60"
      label-position="right">
      <div class="claim-dialog-tip">你认领的门店是：<span>{{data.storeName}}</span>，请输入该门店账号和密码进行认领验证</div>
      <FormItem label="账号" prop="mobile">
        <Input type="text" 
          v-model="formData.mobile" 
          :maxlength="11" 
          placeholder=""
          @on-change="changeMobile" />
      </FormItem>
      <FormItem label="密码" prop="password">
        <Input :type="type" 
          @on-focus="type='password'"
          v-model="formData.password" 
          placeholder=""
          @on-change="changeMobile" />
      </FormItem>
      <FormItem>
        <Button type="primary" @click="submit" :loading="loading" class="confirm-btn">立即认领</Button>
        <Button type="default" @click="modal = false" :loading="loading">暂不认领</Button>
      </FormItem>
    </Form>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
import { formVerify, clearStorge } from '@/assets/js/utils.js';
import vaildate from '@/components/vaildate';
import { regexEnum } from '@/assets/js/regexEnum';

export default {
  components: { vaildate },
  data () {
    return {
      type: 'text',
      data: {},
      callback: null,
      modal: false,
      loading: false,
      valiDisabled: true,
      formData: {
        type: 'other',
        mobile: '',
        password: '',
        storeId: ''
      },
      rules: {
        mobile: [
          { 
            required: true, 
            trigger: 'blur', 
            reg: 'MOBILE',
            message: '请输入11位的手机号', 
            formatTip: '请输入正确的手机号', 
            validator: formVerify.format,
            // callback: (rules, value, callback) => {
            //   this.$store.dispatch({
            //     type: 'checkMobile',
            //     params: {
            //       mobile: this.formData.mobile
            //     }
            //   }).then( res => {
            //     if (res.code === '0') {
            //       return callback();
            //     }
            //     rules.message = '手机号码不存在';
            //     callback(rules.message);
            //   })
            // }
          },
        ],
        password: [{ required: true, min: 6, message: '密码长度应在6-16位之间', trigger: 'blur' }],
      }
    }
  },

  methods: {
    openModal (data, callback) {
      this.data = data;
      this.formData.storeId = data._id;
      this.callback = callback;
      this.$refs.form.resetFields();
      this.modal = true;
    },
    submit () {
      this.$refs.form.validate( valid => {
        if (valid) {
            this.loading = true;
            this.$store.dispatch({
              type: 'actionPost',
              name: 'storeSetMaster',
              params: this.formData
            }).then( res => {
              if (res.code === '0') {
                this.$Message.success({
                  content: '认领成功',
                  onClose: () => {
                    this.$router.push('/store/setting/admin/list');
                  }
                })
              } else {
                this.$Message.error({
                  content: res.msg,
                  onClose: () => {
                    this.loading = false;
                  }
                })
              }
            }).catch( error => {
                this.$Message.error({
                  content: res.msg,
                  onClose: () => {
                    this.loading = false;
                  }
                })
            })
          }
      })
    },

    changeMobile (e) {
      const reg = regexEnum.MOBILE;
      if (!reg.test(e.target.value)) {
        this.valiDisabled = true;
      } else {
        this.valiDisabled = false;
      }
    },
  }
}
</script>
