<template>
  <Modal title="微信支付" v-model="modal" 
    class="w-dialog wachat-dialog"
    width="600">
    <div>
      <qrcode class="qrcode" :text='link' :size="160" :margin="0"></qrcode>
    </div>
    <div slot="footer">
      <Row>
        <i-col span="8" v-for="(item, index) in list" :key="index">
          <span>{{ index + 1 }}</span>
          <i :class="['iconfont', item.icon]"></i>
          <p>{{ item.text }}</p>
        </i-col>
      </Row>
    </div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
export default {
  data () {
    return {
      modal: false,
      link: '',
      list: [
        { icon: 'icon-shangchuan', text: '微信打开扫一扫' },
        { icon: 'icon-shangchuan', text: '扫描以上二维码' },
        { icon: 'icon-shangchuan', text: '完成支付' },
      ]
    }
  },

  methods: {
    openModal (url) {
      this.link = url;
      this.modal = true;
    },
  }
}
</script>
