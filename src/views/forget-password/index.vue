<template>
  <page class="forget-password settle">
    <header slot="header">
      <div class="container">
        <div class="logo">
          <img src="/images/logo.png" alt="">
        </div>
        <router-link to="/login">立即登录</router-link>
      </div>
    </header>
    <div class="container">
      <div class="header">
        <h2 class="title">修改密码</h2>
      </div>
      <div class="content">
        <i-form ref="form" :model="formData" :rules="rules">
          <i-form-item prop="mobile">
            <i-input v-model="formData.mobile" :maxlength="11" placeholder="输入11位手机号" @on-change="changeMobile" ></i-input>
          </i-form-item>
           <i-form-item class="veryfi-code imgCode" >
            <i-input v-model="formData.captchaStr" :maxlength="4" placeholder="输入图形验证码" @on-change="changeMobile" ></i-input>
              <i-col span="7"
              ><div class="captcha" ref="captcha" @click="getCaptcha">
                加载中...
              </div></i-col>
            <i-col span="1" class="change-captcha">
              <div @click="getCaptcha">
                <i class="icon iconfont icon-shuaxin"></i>
              </div></i-col>
          </i-form-item>
          <i-form-item class="veryfi-code" prop="validationCode">
            <i-input v-model="formData.validationCode" :maxlength="4" placeholder="输入短信验证码"></i-input>
            <vaildate :mobile="formData.mobile" :disabled="codeDisabled"  :captchaStr="formData.captchaStr">获取验证码</vaildate>
          </i-form-item>
          <i-form-item prop="password">
            <i-input v-model="formData.password" :type="type" :maxlength="16" placeholder="6 - 16位密码，区分大小写"></i-input>
          </i-form-item>
          <i-form-item prop="confirmPassword">
            <i-input v-model="formData.confirmPassword" :type="type" :maxlength="16" placeholder="再次输入密码"></i-input>
          </i-form-item>
          <i-form-item class="submit-btn">
            <i-button type="primary" @click="submit" long :loading="loading">更改密码</i-button>
          </i-form-item>
        </i-form>
      </div>
    </div>
  </page>
</template>

<script>
import '@/styles/views/settle.less';
import page from '@/components/page';
import { formVerify } from '@/assets/js/utils.js';
import vaildate from '@/components/vaildate';
import { regexEnum } from '@/assets/js/regexEnum';
export default {
  components: { page, vaildate },
  data () {
    return {
      loading: false,
      type: "text",
      codeDisabled: true,
      
      formData: {
        mobile: '',
        validationCode: '',
        password: '',
        confirmPassword: '',
        captchaStr:''
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
            callback: (rules, value, callback) => {
              this.type = "password";
              this.$store.dispatch({
                type: 'checkMobile',
                params: {
                  mobile: this.formData.mobile
                }
              }).then( res => {
                if (res.code !== '0') {
                  // this.codeDisabled = false;
                  callback();
                } else {
                  this.codeDisabled = true;
                  rules.message = '手机号码未注册';
                  callback(rules.message);
                }
              })
            }
          }
        ],
        validationCode: [
          { 
            required: true, 
            trigger: 'blur', 
            message: '验证码不能为空',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (!this.formData.mobile) {
                rules.message = '验证码不正确';
                return callback(rules.message);
              }
              this.$store.dispatch({
                type: 'checkCode',
                params: {
                  mobile: this.formData.mobile,
                  validationCode: value
                }
              }).then( res => {
                if (res.code !== '0') {
                  rules.message = '验证码不正确';
                  return callback(rules.message)
                }
                callback();
              })
            }
          }
        ],
        password: [
          { 
            required: true, 
            trigger: 'blur', 
            message: '密码不能为空',
            reg: 'PASSWORD',
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
                rules.message = '两次密码不一致，请重新输入';
                return callback(rules.message)
              }
              callback();
            }
          }
        ]
      }
    }
  },
mounted(){
    this.getCaptcha();
},
  methods: {
       changeMobile(e) {
      const reg = regexEnum.MOBILE;
      const imgReg = regexEnum.IMGCODE;
      if (!reg.test(this.formData.mobile)) {
         this.codeDisabled = true;
        
      } else {
        if (!imgReg.test(this.formData.captchaStr)) {
          // console.log("enter")
          this.codeDisabled = true;
        } else {
          // console.log("faiul")
          this.codeDisabled = false;
        }
      }
    },
    getCaptcha() {
      if (this.captchaLogin) return; //如果正在加载验证码，则不做任何操作

      //设置验证码相关初始状态
      // this.form.captcha = "";
      // this.captchaLogin = true;
      this.$refs.captcha.innerHTML = "加载中...";

      this.$store
        .dispatch({
          type: "imageCaptcha",
          params: {
            // mobile: this.formData.mobile,
          },
        })
        .then((res) => {
          // console.log("图形验证码", res);
          this.$refs.captcha.innerHTML = res;
          // if (res.code !== "0") {

          //   // rules.message = '短信验证码不正确';
          //   // return callback(rules.message);
          // }
          callback();
        });
  
    },
    submit () {
      this.$refs.form.validate( valid => {
        if (valid) {
          this.loading = true;
          this.$store.dispatch({
            type: 'forgetPwd',
            params: this.formData
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: '修改密码成功',
                onClose: () => {
                  this.$router.push('/login');
                  this.loading = false;
                }
              })
            } else {
              this.$Message.error({
                content: '修改密码失败',
                onClose: () => {
                  this.loading = false;
                }
              })
            }
          }).catch( error => {
            this.loading = false;
          })
        }
      })
    }
  }
}
</script>
