<template>
  <transition name="fade">
    <div
      class="self_modalMore"
      v-show="showModal"
    >
      <div class="self_modalMore_box" :style="{width:modalWidth}">
        <div class="header" v-if="showHeader">
          <Icon type="md-alert primaryColor" style="font-size:20px;margin-right:6px;position:absolute;left:-24px;bottom:-3px;"  />{{title}}
        </div>
        <div slot="content"></div>
        <p class="content" >
          {{content}}
        </p>
        <div class="footer">
          <i-button @click="cancel">{{cancelText}}</i-button>
          <i-button @click="ok">{{okText}}</i-button>
        </div>
        <slot name="content" />
      </div>
    </div>
  </transition>
</template>

<script>
import '@/styles/components/self-modal.less'
export default {
  model: {
    prop: 'showModal', 
    event: "changeShow" 
  },
  props: {
    title: {
      type: String,
      default: '标题'
    },
    content: {
      type: String,
      default: '内容'
    },
    okText: {
      type: String,
      default: '确定'
    },
    cancelText: {
      type: String,
      default: '取消'
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showModal: {
      type: Boolean,
      default: false
    },
    showClose: {
      type: Boolean,
      default: true
    },
    width: {
      type: [Number, String],
      default: 500
    }
  },
  computed: {
    modalWidth () {
      return this.width > 100 ? `${this.width}px` : `${this.width}%`
    }
  },
  methods: {
    changeModalShow (show) {
      this.$emit('changeShow', show)
    },
    cancel () {
      this.$emit('on-cancel')
      this.changeModalShow(false)
    },
    ok () {
      this.$emit('on-ok')
      this.changeModalShow(false)
    }
  }
}
</script>
