<template>
  <div class="tab">
    <template v-for="(item, index) in tabList" >
      <span 
        :key="index" 
        :class="{'active': active === index}" 
        @click="tabChange(index)">
        <template v-if="item.name">{{item.name}}{{item.value ? '（' + item.value + '）' : ''}}</template>
        <template v-else>{{item}}</template>
        <template v-if="item.tips">
          <div class="tips">
            {{item.tips}}
          </div>
        </template>
      </span>
    </template>
  </div>
</template>

<script>
import '@/styles/components/tab.less';
export default {
  props: {
    tabList: {  // tab列表
      type: Array
    },
    step: { // 是否为步骤模式
      type: Boolean,
      default: false
    },
    tabIndex: Number
  },
  data () {
    return {
      active: 0,
      maxStep: 0  // 最大点击的位置
    }
  },
  watch: {
    tabIndex (to) {
      this.active = to;
    }
  },
  mounted () {
    if (this.tabIndex !== undefined) this.active = this.tabIndex;
  },
  methods: {
    init () {
      this.active = 0;
      this.maxStep = 0;
    },
    next () {
      if (this.active < this.tabList.length - 1) {
        this.active++;
        this.step && (this.maxStep = this.active);
      }
      this.$emit('tab-change', this.active);
    },
    tabChange (index) {
      if (this.step && index > this.maxStep) return; 
      this.active = index;
      this.$emit('tab-change', this.active, this.tabList[index]);
    }
  }
}
</script>
