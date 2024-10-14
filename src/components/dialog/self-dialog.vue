<template>
  <transition name="fade">
    <div
      class="self_modal"
      v-show="showModal"
      @click="onClickModal"
    >
      <div class="self_modal_box" :style="{width:modalWidth}">
        <i 
          class="close_icon iconfont icon-close" 
          style="font-size: 30px;" 
          v-if="showClose"
          @click="$emit('closeModal')"></i>
        <slot name="content" />
      </div>
    </div>
  </transition>
</template>

<script>
import '@/styles/components/self-dialog.less'
export default {
  props: {
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
      default: 400
    }
  },
  computed: {
    modalWidth () {
      return this.width > 100 ? `${this.width}px` : `${this.width}%`
    }
  },
  methods: {
    onClickModal (e) {
      if (e.target.getAttribute('class') === 'self_modal') {
        this.$emit('closeModal')
      }
    }
  },
}
</script>
