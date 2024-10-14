<!-- 车牌选择框 -->
<template>
  <div class="select-input">
    <Icon type="arrow-down-b"></Icon>
    <input ref="input" type="text" @focus="focus" @blur="blur" v-model="text" readonly>
    <transition name="opacity">
      <div class="select-list" v-show="showSelect" @mouseenter="enter" @mouseleave="leave">
        <span v-for="(item, index) in array" :key="index" @click="onChange(item, index)" :class="{'active': item === text}">{{item}}</span>
      </div>
    </transition>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    },
    array: {
      type: Array,
      default () {
        return []
      }
    }
  },
  watch: {
    value (v) {
      this.text = v;
      this.$emit('input', this.text);
    }
  },
  created () {
    this.text = this.value;
  },
  data () {
    return {
      text: '',
      hoverList: false,   // 用于判断鼠标是否进入select范围，input失焦不关闭select 
      showSelect: false,  // 是否显示select框
    }
  },
  methods: {
    enter () {
      this.hoverList = true;
    },
    leave () {
      this.hoverList = false;
      if (this.showSelect) this.setFocus(); // 如果select未关闭情况鼠标移出，重新获取焦点
    },
    blur () {
      if (this.hoverList) return;
      this.showSelect = false;
    },
    focus () {
      this.showSelect = true;
    },
    setFocus () {
      this.$refs.input.focus();
    },
    onChange (text, index) {
      this.text = text;
      this.$emit('input', text);
      this.$emit('on-change', text, index);
      this.showSelect = false;
    }
  }
}
</script>
