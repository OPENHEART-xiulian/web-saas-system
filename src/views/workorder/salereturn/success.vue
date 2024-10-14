<template>
  <div class="pay-success">
    <Icon type="ios-checkmark"></Icon>
    <p>付款成功</p>
    <p class="tip">已付款 {{ cost }} 元，{{ count }} 秒后自动返回销售退货工单管理页面</p>
    <Button type="default" @click="back">立即返回</Button>
  </div>
</template>

<script>
import '@/styles/views/inventory/forward-success.less';
export default {
  data () {
    return {
      count: 3,
      timer: null,
      cost: Math.round(parseFloat(this.$route.params.cost) * 100) / 10000
    }
  },

  mounted () {
    this.clock();
  },

  destroyed () {
    clearInterval(this.timer);
    this.timer = null;
  },

  methods: {
    back () {
      this.$router.push({
        path: '/workorder/salereturn?type=2',
        query: { refresh: true }
      });
    },

    clock () {
      this.timer = setInterval(() => {
        this.count--;
        if (this.count <= 0) {
          clearInterval(this.timer);
          this.back();
        } 
      }, 1000);
    }
  }
}
</script>
