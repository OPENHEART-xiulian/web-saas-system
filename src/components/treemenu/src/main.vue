<template>
  <!-- treemenu组件 -->
  <div class="saas-treemenu">
    <template v-for="(item, index) in data" >
      <span 
        :key="index" 
        :class="['saas-tab__item', {'active': value === index}]" 
        @click="onItemClick(index, item)">
        <template v-if="item.name">{{item.name}}</template>
        <template v-if="item.value">（{{item.value}}）</template>
      </span>
    </template>
  </div>
</template>

<script>
export default {
  name: "TreeMenu",
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
    value: {
      type: Number,
      default: 0
    }
  },
  methods: {
    onItemClick (index, item) {
      this.$emit("input", index);
      this.$emit('on-change', index, item);
    }
  }
}
</script>
