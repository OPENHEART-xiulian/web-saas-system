<template>
  <div class="w-select-input">
    <i-input ref="input" :value="inputText" @on-focus="onFocus" @on-blur="onBlur" readonly :placeholder="placeholder"></i-input>
    <transition name="fade">
    <ul class="select-list" v-if="data.length > 0" v-show="isFocus" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <li 
        :class="['select-item', {'active': item.value === optionValue}]" 
        v-for="(item, index) in data" 
        @click.stop="optionSelect(item, index)" 
        :key="index">
        {{item.label}}
      </li>
    </ul>
    </transition>
  </div>
</template>

<script>
  import '@/styles/components/input.less';
  export default {
    props: {
      placeholder: String,
      data: Array,
      text: String,
    },
    data () { 
      return {
        inputText: '',
        optionValue: '',
        isFocus: false,
        isHover: false,
      }
    },
    methods: {
      setText (value, text) {
        this.inputText = text;
        this.optionValue = value;
      },
      onMouseEnter () {
        this.isHover = true;
      },
      onMouseLeave () {
        this.isHover = false;
      },
      onFocus () {
        this.isFocus = true;
      },
      onBlur () {
        if (this.isHover) return;
        this.isFocus = false;
      },
      optionSelect (item, index) {
        if (item.open) {
          this.$emit('open-modal', item, this.callback, index);
          return;
        }

        this.isFocus = false;
        this.setText(item.value, item.label);
        this.$emit('on-change', item, index)
      },
      closeSelect () {
        this.isFocus = false;
      },
      callback (label, value) {
        this.isFocus = false;
        this.setText(value, label);
      }
    }
  }
</script>
