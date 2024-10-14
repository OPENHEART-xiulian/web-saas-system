<template>
  <div class="w-select-input">
    <i-input style="width: 100%" ref="input" v-model.trim="inputText" @on-change="onChange" @on-focus="onFocus" @on-blur="onBlur" :placeholder="placeholder"></i-input>
    <transition name="fade">
    <ul class="select-list" v-if="selectList.length > 0" v-show="isFocus" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
      <li 
        :class="['select-item']" 
        v-for="(item, index) in selectList" 
        @click.stop="optionSelect(item, index)" 
        :key="index" v-html="getHtml(item[itemKey])">
      </li>
      <Spin v-if="loading" fix></Spin>
    </ul>
    </transition>
  </div>
</template>

<script>
  import '@/styles/components/input.less';
  export default {
    props: {
      value: String,
      placeholder: String,
      text: String,
      request: String,
      itemKey: String,
      filter: String
    },
    data () { 
      return {
        loading: false,
        selectList: [],
        inputText: '',
        isFocus: false,
        isHover: false,
        htmlStr: ''
      }
    },
    watch: {
      value (to) {
        this.inputText = to;
      }
    },
    methods: {
      onMouseEnter () {
        this.isHover = true;
      },
      onMouseLeave () {
        this.isHover = false;
      },
      onFocus () {
        this.isFocus = true;
        // if (this.selectList.length > 0) return;
        this.getSelectList();
      },
      onBlur () {
        if (this.isHover) return;
        this.isFocus = false;
      },
      optionSelect (item, index) {
        this.isFocus = false;
        this.htmlStr = item[this.itemKey];
        this.inputText = item[this.itemKey];
        this.$emit('on-select', item, index);
        this.$emit('input', item[this.itemKey]);
      },
      closeSelect () {
        this.isFocus = false;
      },
      callback (label, value) {
        this.isFocus = false;
        this.setText(value, label);
      },
      setData (text) {
        this.htmlStr = text;
        this.inputText = text;
      },
      getHtml (str) {
        const reg = new RegExp(this.htmlStr, 'g');
        const html = str.replace(reg, '<span class="high">' + this.htmlStr + '</span>');
        return html;
      },
      onChange (e) {
        this.htmlStr = e.target.value;
        this.$emit('on-change', this.inputText);
        this.$emit('input', this.inputText);
        this.getSelectList();
      },
      // 获取供应商列表
      async getSelectList () {
        if (!this.inputText) return;
        this.loading = true;
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: this.request,
          params: {
            page: 1,
            rows: 10,
            [this.filter]: this.inputText
          }
        });

        if (res.code === '0') {
          this.selectList = res.data.rows;
        }

        this.loading = false;
      }
    }
  }
</script>
