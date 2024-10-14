<template>
  <div class="no-data">
    <i class="iconfont icon-kongbaiwenjian"></i>
    <p>{{ title }}</p>
    <p class="tip">{{ tip }}</p>
    <Button v-if="showBtn" type="error" @click="create">{{ btnText }}</Button>
  </div>
</template>

<script>
import '@/styles/components/no-data.less';

export default {
  props: {
    title: String,
    tip: String,
    showBtn: {
      type: Boolean,
      default: true
    },
    create: Function,
    btnText: {
      type: String,
      default: '立即创建'
    }
  }
}
</script>
