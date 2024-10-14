<template>
  <div>
    <saas-bread title="修炼钱包开通"></saas-bread>
    <div class="certiFailBody">
      <i-button type="primary" size="large" @click="$router.push('/account/openWallet')">重新提交</i-button>
    </div>

  </div>
</template>

<script>


export default {
  components: {},
  data(){
    return {

    }
  },

  created () {
  },
  computed: {},

  
}
</script>

<style lang="less">
.certiFailBody{
  background: #fff;
  text-align: center;
  padding: 20px;
}
</style>
