<template>
  <div class="store-account">
    <saas-bread title="账户中心"/>
    <div class="content">
      <p>我的余额</p>
      <p class="price">{{ storeAccount.total || 0 }}<span>元</span></p>
      <Button type="primary" @click="toRecharge">立即充值</Button>
      <Button type="text" @click="toRechargeRecord">充值记录</Button>
      <Button type="text" @click="toWithdraw">申请提现</Button>
      <Button type="text">消费记录</Button>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import '@/styles/views/store/account-index.less';

export default {
  mounted () {
    this.$store.dispatch('toGetStoreAccount');
  },

  computed: {
    ...mapGetters({
      storeAccount: 'getStoreAccount'
    })
  },

  methods: {
    toRechargeRecord () {
      this.$router.push('/store/account/rechargeRecord');
    },

    toRecharge () {
      this.$router.push('/store/account/recharge');
    },

    toWithdraw () {
      this.$router.push('/store/account/withdraw');
    }
  },
}
</script>
