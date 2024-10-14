<template>
  <!-- 带搜索图标的筛选输入框 -->
  <div class="saas-input">
    <i-input class="search-input" v-model.trim="inputValue" :placeholder="placeholder" @on-change="onChange">
      <span class="prepend" slot="prepend">
        <i class="iconfont icon-sousuo"></i>
      </span>
      <span class="append" slot="append" @click="onSearch">搜索</span>
    </i-input>
  </div>
</template>

<script>
export default {
  name: "SaasSearchInput",
  props: {
    value: {
      type: [String, Number],
      default: ""
    },
    placeholder: {
      type: String,
      default: ""
    }
  },

  data () {
    return {
      inputValue: ""
    }
  },

  watch: {
    value (to) {
      this.inputValue = to;
    }
  },

  methods: {
    onChange () {
      this.$emit("input", this.inputValue);
    },
    onSearch () {
      this.$emit("input", this.inputValue);
      this.$emit("on-search", this.inputValue);
    }
  }
}
</script>
