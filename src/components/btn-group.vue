<!-- 按钮组 -->
<template>
  <ButtonGroup class="btn-group">
    <Button 
      v-for="(item, index) in chartBtns"
      :key="index"
      @click="renewBtn( item.value )"
      :class="{ active: curKey === item.value }">{{ item.name }}
    </Button>
  </ButtonGroup>
</template>

<script>
import '@/styles/components/btn-group.less';

export default {
  props: {
    chartBtns: Array,
    curKey: String,
    renewBtn: Function
  }
}
</script>
