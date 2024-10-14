<template>
  <div class="account-recharge">
    <saas-bread title="账户充值"></saas-bread>
    <div class="content">
      <p class="title">充值金额</p>
      <ul class="money-list">
        <li v-for="(item, index) in money" 
          :key="index"
          :class="{'active': item.value === curValue}"
          @click="chooseMoney(item.value)">{{ item.label }}
          <span class="unit">元</span>
        </li>
        <format-input 
          prelen="2"
          v-model="value"  
          reg="NUMBER"
          maxlength="8"
          @input="changeMoney"
          :class="{'input-active': isInput}">
          <span slot="append">元</span>
        </format-input>
      </ul>
      <p class="title">选择支付方式</p>
      <RadioGroup v-model="payType">
        <Radio :label="item.value" 
          v-for="item in payTypeArr"
          :key="item.value">
          <div class="pay-type">
            <i :class="['iconfont', item.icon]" :style="{color: item.color}"></i>
            <span>{{ item.label }}</span>
          </div>
        </Radio>
      </RadioGroup>
      <div class="bottom">
        <div class="bottom-text">
          <p>充值金额：
            <span class="price">￥{{ price || 0 }}</span>
          </p>
        </div>
        <Button type="error" 
          :loading="btnLoading"
          :disabled="price <= 0"
          @click="submit">确认收款</Button>
      </div>
    </div>
    <wechat-dialog ref="wechatDialog"></wechat-dialog>
    <alipay-dialog ref="alipayDialog" @on-ok="alipayOk"></alipay-dialog>
  </div>
</template>

<script>
import WechatDialog from '@/components/dialog/wechat-dialog';
import AlipayDialog from '@/components/dialog/alipay-dialog';
import '@/styles/views/store/account-recharge.less';
import { WebSocket } from '@/assets/js/WebSocket.js';

export default {
  data () {
    return {
      value: '',
      socket: null,
      price: 0, // 充值金额
      btnLoading: false,
      curValue: '', // 当前选择金额
      isInput: false, // 是否是输入金额
      payType: 'wxpay',
      payData: {},  // 生成的单号信息
      money: [
        { label: '100', value: 100 },
        { label: '200', value: 200 },
        { label: '500', value: 500 },
        { label: '1000', value: 1000 },
      ],
      payTypeArr: [
        { label: '微信', value: 'wxpay', icon: 'icon-weixin', color: '#05AF10' },
        { label: '支付宝', value: 'alipay', icon: 'icon-zhifubao', color: '#03AAEF' }
      ]
    }
  },

  methods: {
    chooseMoney (money) {
      this.curValue = money;
      this.isInput = false;
      this.value = String(money);
      this.price = this.value;
    },

    changeMoney (e) {
      this.curValue = '';
      this.isInput = true;
      const num = Number(e);
      this.value = String(num);
      this.price = String(num);
    },

    submit () {
      this.btnLoading = true;
      let newTab;
      if (this.payType !== 'wxpay') {
        newTab = window.open('about:blank');
      }
      this.$store.dispatch({
        type: 'toRecharge',
        params: {
          payType: this.payType,
          money: this.price
        }
      }).then((res) => {
        if (res.code === '0') {
          this.btnLoading = false;
          this.payData = res.data;

          if (this.payType === 'wxpay') {
            // 微信支付
            this.$refs.wechatDialog.openModal(res.data.codeUrl);
          } else {
            // 支付宝支付
            this.$refs.alipayDialog.openModal();
            newTab.location.href = res.data.url;
          }

          if (this.socket) this.socket = null;
          this.socket = new WebSocket();
          // 接收服务器通知
          this.socket.socket.on('PayNotify', data => {
            if (this.payType === 'wxpay') {
              this.$refs.wechatDialog.modal = false;
            } else {
              newTab.close();
              this.alipayOk();
            }
            if (this.payData.no === data.no) {
              this.$Message.success({
                content: '支付成功',
                onClose: () => {
                  this.$router.push('/store/account/rechargeRecord');
                }
              })
            }
          });
        } else {
          this.btnLoading = false;
        }
      }).catch((err) => {
        this.btnLoading = false;
      })
    },
    alipayOk () {
      this.curValue = '';
      this.value = '';
      this.price = 0;
      this.payType = 'wxpay';
      this.$refs.alipayDialog.modal = false;
    }
  },

  components: { WechatDialog, AlipayDialog }
}
</script>
