<!--门店多选框 -->
<template>
  <div class="multiple-input" @click.stop="$emit('click-handle')">
    <p v-show="(!isArray && labelData === '') || (isArray && labelData.length === 0)">{{holderText}}</p>
    <div v-if="isArray" v-show="labelData.length !== 0" class="label">
      <div class="lable-item" v-for="(item, index) in labelData" :key="index">
        {{item}}
        <div class="close" @click.stop="removeItem(index)"><Icon type="close-round"></Icon></div>
      </div>
    </div>
    <p v-if="!isArray" v-show="labelData !== ''" class="label">{{labelData}}</p>
    <Icon type="arrow-down-b"></Icon>
  </div>
</template>

<script>
import '@/styles/components/multiple-input.less';

export default {
  props: {
    placeholder: {
      type: String,
      default: ''
    },
    isArray: {  // 是否是 数组 / 多选
      type: Boolean,
      default: false
    },
    labelData: {
      type: [Array, String]
    }

  },
  data () {
    return {
      inputData: '',
      holderText: ''
    }
  },
  created () {
    this.holderText = this.placeholder;
  },
  methods: {
    removeItem (index) {
      this.labelData.splice(index, 1)
    },
    setPlaceHolder (v) {
      this.holderText = v;
    }
  }
}    
</script>
