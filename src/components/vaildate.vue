<!-- 获取验证码组件 -->
<template>
  <div class="vaildate">
    <i-button :type="type || 'default'" @click="getVerifyCode" :disabled="disabled">获取验证码</i-button>
    <div v-if="time > 0" class="time">{{time}}s</div>
  </div>
</template>

<script>
import { storage, verify } from '@/assets/js/utils.js';
export default {
  props: {
    // 验证码类型，1：普通，2：会员卡结算
    smsType: {
      type: [Number, String],
      default: '1'
    },
    disabled: { // 是否禁用
      type: Boolean,
      default: false
    },
    type: String,
    mobile: {
      type: String
    },
    captchaStr:{
      type:String
    }
     
  },
  data () {
    return {
      time: 0,          // 倒计时时间
      timer: null,      // 一个定时器
      canSend: true,    // 是否可以发送验证码
      localName: '',    // 保存在本地的名字
      closeMsg: true,   // 手机号码验证提示是否关闭
    }
  },
  mounted () {
    this.getTime();
  },
  activated () {
    this.getTime();
  },
//        beforeDestroy(){
// //            清楚定时器
//             clearInterval(this.startTime)
//       },
  methods: {
    getVerifyCode () {
      if (!this.closeMsg) return;

      if (!verify('MOBILE', this.mobile)) {
        this.closeMsg = false;
        this.$Message.error({
          content: '请先输入正确的手机号码',
          onClose: () => {
            this.closeMsg = true;
          }
        });
      }

      if (!this.canSend || !this.closeMsg) return;

      this.time = 60;
      storage.set(this.localName, new Date().getTime() + 60 * 1000);
      this.startTime();

      this.$store.dispatch({
        type: 'sendCode',
        params: { mobile: this.mobile, smsType: this.smsType,captchaStr:this.captchaStr}
      }).then( res => {
        if (res.code === '0') {
          this.$Message.success('发送验证码成功');
        } else {
          // this.$Message.error('获取验证码失败，请重试');
          this.time = 0;
        }
      })
    },
    getTime () {
      // 设置保存在本地的名字
      this.localName = this.$route.path.toUpperCase().replace(/\//g, '_') + '_VALIDATE_TIME';
      // 本地保存的时间小于当前时间 可以发送验证码
      this.canSend = storage.get(this.localName) <= new Date().getTime();
      if (this.canSend) { // 删除本地保存的时间
        storage.remove(this.localName);
      } else {
        this.time = Math.floor((storage.get(this.localName) - new Date().getTime()) / 1000);
        this.startTime();
      }
    },
    startTime () {
      this.timer && clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        this.time--;
        if (this.time > 0) {
            this.startTime();
        } else {
          storage.remove(this.localName);
          this.canSend = true;
        }
      }, 1000);
    }
  }
}
</script>
