<template>
  <Modal v-model="modal" 
    class="w-dialog alipay-dialog"
    width="600">
    <div>
      <p><i class="iconfont icon-gantan"></i>在线支付提示</p>
      <p>支付完成前，请不要关闭此支付验证窗口。</p>
      <p>支付完成后，请根据你支付的情况点击下面的按钮。</p>
    </div>
    <div slot="footer">
      <i-button type="default" @click="onCancel">支付出现问题</i-button>
      <i-button type="primary" @click="onOk">支付完成</i-button>
    </div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';
export default {
  data () {
    return {
      modal: false
    }
  },

  methods: {
    openModal () {
      this.modal = true;
    },
    onOk () {
      this.modal = false;
      this.$emit('on-ok');
    },
    onCancel () {
      this.modal = false;
      this.$emit('on-cancel');
    }
  }
}
</script>
