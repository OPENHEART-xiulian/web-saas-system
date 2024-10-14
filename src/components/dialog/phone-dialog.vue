<template>
  <Modal
    title="修改手机号码"
    v-model="modal"
    class="w-dialog phone-dialog"
    width="600"
  >
    <Form
      ref="form"
      :model="formData"
      :rules="rules"
      :label-width="140"
      label-position="right"
    >
      <FormItem label="新绑定手机号码" prop="mobile">
        <Input
          type="text"
          v-model="formData.mobile"
          :maxlength="11"
          placeholder="输入需要绑定的手机号"
          @on-change="changeMobile"
        />
      </FormItem>
      <FormItem label="图形验证码" class="imgCode">
        <Input
          class="phone-input"
          type="text"
          v-model="formData.captchaStr"
         
          :maxlength="4"
          placeholder="输入图形验证码"
           @on-change="changeMobile"
        />
        <i-col span="7"
          ><div class="captcha" ref="captcha" @click="getCaptcha">
            加载中...
          </div></i-col>
        <i-col span="1" class="change-captcha">
          <div @click="getCaptcha">
            <i class="icon iconfont icon-shuaxin"></i>
          </div>
        </i-col>
      </FormItem>
      <FormItem label="验证码" prop="validationCode">
        <Input
          class="phone-input"
          type="text"
          v-model="formData.validationCode"
          :maxlength="4"
          placeholder="输入验证码"
        />
        <vaildate
          :mobile="formData.mobile"
          :disabled="valiDisabled"
          :captchaStr="formData.captchaStr"
          >获取验证码</vaildate
        >
      </FormItem>
      <FormItem>
        <Button type="primary" @click="submit" :loading="loading">确定</Button>
      </FormItem>
    </Form>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
import "@/styles/components/dialog.less";
import { formVerify, clearStorge } from "@/assets/js/utils.js";
import vaildate from "@/components/vaildate";
import { regexEnum } from "@/assets/js/regexEnum";

export default {
  components: { vaildate },
  data() {
    return {
      modal: false,
      loading: false,
      valiDisabled: true,
      formData: {
        mobile: "",
        validationCode: "",
        captchaStr: "",
      },
      rules: {
        mobile: [
          {
            required: true,
            trigger: "blur",
            reg: "MOBILE",
            message: "请输入11位的手机号",
            formatTip: "请输入正确的手机号",
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              this.$store
                .dispatch({
                  type: "checkMobile",
                  params: {
                    mobile: this.formData.mobile,
                  },
                })
                .then((res) => {
                  if (res.code !== "0") {
                    rules.message = "该手机号码已注册";
                    this.valiDisabled = true;
                    return callback(rules.message);
                  } else {
                    // this.valiDisabled = false;
                  }
                  callback();
                });
            },
          },
        ],
        validationCode: [
          {
            required: true,
            trigger: "blur",
            message: "验证码不能为空",
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              this.$store
                .dispatch({
                  type: "checkCode",
                  params: {
                    mobile: this.formData.mobile,
                    validationCode: value,
                  },
                })
                .then((res) => {
                  if (res.code !== "0") {
                    rules.message = "验证码不正确";
                    return callback(rules.message);
                  }
                  callback();
                });
            },
          },
        ],
      },
    };
  },
  mounted() {
    this.getCaptcha();
  },
  methods: {
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
    openModel() {
      this.$refs.form.resetFields();
      this.modal = true;
    },
    submit() {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          this.$store
            .dispatch({
              type: "resetMobile",
              params: this.formData,
            })
            .then((res) => {
              if (res.code === "0") {
                localStorage.clear()
                this.$Message.success({
                  content: "修改手机号码成功",
                  onClose: () => {
                    clearStorge();
                    this.$router.push("/login");
                  },
                });
              } else {
                this.$Message.error({
                  content: "修改手机号码失败",
                  onClose: () => {
                    this.loading = false;
                  },
                });
              }
            })
            .catch((error) => {
              this.loading = false;
            });
        }
      });
    },

    changeMobile(e) {
      const reg = regexEnum.MOBILE;
      const imgReg = regexEnum.IMGCODE;
      if (!reg.test(this.formData.mobile)) {
         this.valiDisabled = true;
        
      } else {
        if (!imgReg.test(this.formData.captchaStr)) {
          // console.log("enter")
          this.valiDisabled = true;
        } else {
          // console.log("faiul")
          this.valiDisabled = false;
        }
      }
    },
  },
};
</script>
