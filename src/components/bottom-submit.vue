<!-- 表单保存条 -->
<template>
  <div class="bottom-submit">
    <div class="content">
      <div v-if="!$slots.default">
        <Button type="default" 
          @click="$emit('on-cancel')">{{ defaultBtn }}
        </Button>
        <template v-if="btnList && btnList.length>0">
          <Button v-for="(item,index) in btnList" :key="index" :type="item.type" @click="$emit('on-click',index)">
            {{item.text}}
          </Button>
        </template>
        <Button type="error" 
          :loading="loading" 
          @click="$emit('on-confirm')">{{ sumbitBtn }}
        </Button>
      </div>
      <div v-else class="slot">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script>
import '@/styles/components/bottom-submit.less';

export default {
  props: {
    defaultBtn: {
      type: String,
      default: '取消'
    },
    sumbitBtn: {
      type: String,
      default: '保存'
    },
    // [
    //   {
    //     type:'primary',
    //     text:'按钮1'
    //   }
    // ]
    btnList: {
      type: Array
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  methods: {
    
  }
}
</script>
