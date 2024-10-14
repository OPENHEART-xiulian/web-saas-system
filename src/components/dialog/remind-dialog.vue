<template>
  <Modal v-model="modal" 
    :transfer="transfer"
    class="w-dialog remind-dialog"
    :closable="false"
    width="500"
    cancel-text="取消"
    ok-text="确定">
    <p>
      <i class="iconfont icon-gantan" v-if="isGantan"></i>
      <i class="iconfont icon-bg-wenhao" v-else></i>{{ title }}
      
    </p>
    <p class="content" v-if="!isHtml">{{ content }}</p>
    <div class="html-content" v-html="content" v-else></div>
    <div slot="footer">
      <Button v-if="showCancel" type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button v-if="showConfirm" 
        type="error" size="large" 
        @click.native.stop="onOk"
        :loading="loading">{{confirmBtn}}
      </Button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';

export default {
  mixins: [mixins],
  props: {
    showCancel: {          // 是否显示取消按钮
      type: Boolean,
      default: true
    },
    showConfirm: {        // 是否显示确定按钮
      type: Boolean,
      default: true
    },
    title: String,        // 标题  
    content: String,      // 内容
    confirmBtn: {         // 确定按钮
      type: String,
      default: '确定'
    },
    isHtml: {             // 内容是否是html
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    transfer: {
      type: Boolean,
      default: true
    },
    isGantan: {           // 图标，感叹号：true，问号：false
      type: Boolean,
      default: true
    }
  }
}
</script>
