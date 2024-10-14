<template>
  <page class="settle notice">
    <header slot="header">
      <div class="container">
        <div class="logo" @click="toIndex">
          <img src="/images/logo.png" alt="logo">
        </div>
        <div class="opt">
          <div class="item document">
            <Tooltip content="点击下载操作说明">
              <span @click="downDocument">操作说明</span>
            </Tooltip>
          </div>
          <div class="item">
            <p class="title">客服中心</p>
            <div class="item-content contact">
              <h2>400-801-9131</h2>
              <p>周一至周五 9:00-18:00</p>
              <div class="qr-code">
                <img src="/images/qrcode.png" alt="">
              </div>
              <p>扫一扫关注XXX公众号</p>
            </div>
          </div>
          <div class="item">消息</div>
          <div class="item">
            <div class="icon">
              <img src="/images/icon_user_gray.png" alt="" />
            </div>
            <p class="user">{{ user.username }}</p>
          </div>
        </div>
      </div>
    </header>
    <router-view />
  </page>
</template>

<script>
import page from '@/components/page';
import { IMPORT_TEMPLATE } from '@/https/api.js';
import '@/styles/views/settle.less';

export default {
  data () {
    return {
      user: {}
    }
  },
  mounted () {
    this.user = this.$storage.get('USER') || {};
  },
  methods: {
    downDocument () {
      window.open(IMPORT_TEMPLATE + '/XXX门店管理平台操作说明V1.0_20180801.pdf', '_blank');
    },

    toIndex () {
      this.$router.push('/');
    }
  },

  components: { page }  
}
</script>
