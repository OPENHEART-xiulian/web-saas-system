<template>
  <!-- tab组件 -->
  <div class="saas-tab">
    <template v-for="(item, index) in data" >
      <Badge :key="index" :count="Number(item.badge)" :overflow-count="Number(maxBadge)">
        <span 
          :class="['saas-tab__item', {'active': value === index}]" 
          @click="onItemClick(index, item)">
          <template v-if="item.name">{{item.name}}</template>
          <template v-if="item.value">（{{item.value}}）</template>
        </span>
      </Badge>
    </template>
    <div class="saas-tab__right">
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    /**
     * tab数据
     * [{
     *    name: "",
     *    value: ""
     * }]
     */
    data: {  
      type: Array,
      required: true
    },
    // 当前选中的tab
    value: {
      type: Number,
      default: 0
    },
    // 徽标最大值
    maxBadge: {
      type: [String, Number],
      default: 99
    }
  },
  methods: {
    onItemClick (index, item) {
      if (index == this.value) return;
      this.$emit("input", index);
      this.$emit('on-change', index, item);
    }
  }
}
</script>
