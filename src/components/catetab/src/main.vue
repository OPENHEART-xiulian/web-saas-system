<!-- 分类管理列表Tab -->
<template>
  <div class="saas-catetab">
    <saas-tab v-model="tabIndex" :data="data" @on-change="onTabChange"></saas-tab>
    <div class="saas-catetab__children" v-if="secondList.length">
      <div class="scc-list">
        <span v-for="(item, index) in  secondList" 
          :key="index" 
          :class="['scc-list__item', { active: item == secondItem }]" 
          @click="onSecondChange(index, item)">{{item.name}}</span>
      </div>
      <div class="scc-list" v-if="thirdList.length">
        <span v-for="(item, index) in thirdList" 
          :key="index" 
          :class="['scc-list__item', { active: item == thirdItem }]" 
          @click="onThirdChange(index, item)">{{item.name}}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "SaasCatetab",
  props: {
    /**
     * 分类数据 data
     * [{
     *    cid           { string }      分类id
     *    code          { string }      分类编码
     *    name          { string }      分类名称
     *    parent        { string }      父分类code
     *    ancestors[]   { array  }      父分类列表：1级->2级->n级
     *    children[]    { string }      子分类列表：子分类列表字段跟父分类一样
     * }]
     */
    data: {
      type: Array,
      required: true
    }
  },

  data () {
    return {
      tabIndex: 0,        // 选中的一级分类下标
      tabItem: {},        // 选中的一级分类数据
      secondList: [],     // 二级分类列表
      secondItem: {},     // 选中的二级分类
      thirdList: [],      // 三级分类列表
      thirdItem: {},      // 选中的三级分类
    }
  },

  methods: {
    // 一级分类改变
    onTabChange (index, item) {
      if (this.tabItem == item) return; // 点击同一个分类不触发以下代码
      this.tabItem = item;
      this.secondList = item.children || [];
      this.secondItem = {};
      this.thirdList = [];
      this.thirdItem = {};
      this.onChange(item.code);
    },

    // 二级分类改变
    onSecondChange (index, item) {
      if (this.secondItem == item) return; // 点击同一个分类不触发以下代码
      this.secondItem = item;
      this.thirdList = item.children || [];
      this.thirdItem = {};
      this.onChange(item.code);
    },

    // 三级分类改变
    onThirdChange (index, item) {
      if (this.thirdItem == item) return; // 点击同一个分类不触发以下代码
      this.thirdItem = item;
      this.onChange(item.code);
    },

    onChange (code) {
      this.$emit("on-change", code);
    }
  },
}
</script>
