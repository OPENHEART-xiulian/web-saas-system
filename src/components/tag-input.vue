<!-- 关键字输入 -->
<template>
  <div class="tag-input">
    <span class="tag-item" v-for="(item, index) in tagList" :key="index">
      {{item}}
      <i class="iconfont icon-guanbi" @click="remove(index)"></i>
    </span>
    <format-input :placeholder="placeholder" v-if="max === 0 || tagList.length < max" :reg="reg" v-model="inputText" @on-enter="onEnter"></format-input>
  </div>
</template>

<script>
import { verify } from '@/assets/js/utils.js';
import '@/styles/components/tag-input.less';

export default {
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    },
    max: {
      type: Number,
      default: 0
    },
    placeholder: String,
    reg: String
  },
  data () {
    return {
      tagList: [],
      isCloseTip: true,
      inputText: ''
    }
  },
  watch: {
    value (to) {
      this.tagList = to.slice(0);
    }
  },
  mounted () {
    this.tagList = this.value.slice(0);
  },
  methods: {
    onEnter (e) {
      if (this.inputText === '') return;

      this.tagList.push(this.inputText);
      this.inputText = '';
      this.$emit('input', this.tagList);
    },
    remove (index) {
      this.tagList.splice(index, 1);
      this.$emit('input', this.tagList);
    }
  }
}
</script>
