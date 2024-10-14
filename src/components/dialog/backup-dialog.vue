<template>
  <Modal v-model="modal" 
    class="w-dialog backup-dialog"
    :closable="false"
    width="500">
    <p><i class="iconfont icon-wancheng-fill"></i>{{ title }}</p>
    <p class="content">{{ content }}</p>
    <div class="form" v-if="isFile">
      <DatePicker type="date" 
        v-model="formData.settlementDateFrom"
        placeholder="开始时间" 
        style="width: 200px"
        @on-change="changeTimeFrom">
      </DatePicker>
      <span>—</span>
      <DatePicker type="date" 
        v-model="formData.settlementDateTo"
        placeholder="结束时间" 
        style="width: 200px"
        @on-change="changeTimeTo">
      </DatePicker>
    </div>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button type="error" size="large" @click.native.stop="onOk">下载</Button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';
import { formatTime } from '@/assets/js/utils';

export default {
  mixins: [mixins],
  props: {
    title: String,        // 标题  
    content: String,      // 内容
    isFile: {             // 是否有时间筛选，档案备份
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      formData: {}
    }
  },

  methods: {
    openModal () {
      this.modal = true;
      if (this.isFile) {
        this.formData = {}
      }
    },

    changeTimeFrom (value, oldvalue) {
      if (value) this.formData.settlementDateFrom = formatTime(this.formData.settlementDateFrom, 'yyyy-MM-dd');    
    },

    changeTimeTo (value, oldvalue) {
      if (value) this.formData.settlementDateTo = formatTime(this.formData.settlementDateTo, 'yyyy-MM-dd');
    },
  }
}
</script>
