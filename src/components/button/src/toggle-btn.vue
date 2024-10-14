<template>
  <!-- 右上角的显示隐藏筛选按钮 -->
  <i-button class="saas-btn saas-toggle__btn" @click="toggle" :type="type">
    {{ value ? titles[0] : titles[1] }}
    <!-- <i :class="['iconfont', 'icon-sanjiaoxing-xia right-icon', { 'down': value }]" style="font-size:12px;"></i> -->
    <Icon :type="value?'ios-arrow-up':'ios-arrow-down'" style="color:#9ea7b4;"/>
  </i-button>
</template>

<script>
export default {
  name: "saasToggleBtn",
  props: {
    value: {
      type: Boolean,
      default: false
    },
    titles: {
      type: Array,
      required: true
    },
    type: {
      type: String,
      default: "default"
    }
  },

  methods: {
    toggle () {
      let value = !this.value;
      this.$emit("on-change", value);
      this.$emit("input", value);
    }
  }
}
</script>
