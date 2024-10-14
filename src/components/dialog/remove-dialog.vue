<template>
  <Modal v-model="modal" 
    :transfer="true"
    class="w-dialog remind-dialog"
    :closable="false"
    width="500"
    cancel-text="取消"
    ok-text="确定">
    <p>
      <i class="iconfont icon-gantan"></i>作废工单
    </p>
    <p class="content">工单作废后将不能恢复，确定作废工单？</p>
    <div class="select-content">
      <span class="label">作废原因：</span>
      <i-select v-model="formData.cancelReason" placeholder="请选择作废原因">
        <i-option v-for="(item, index) in causeList" :key="index" :value="item.label">{{item.label}}</i-option>
      </i-select>
    </div>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button type="error" size="large" @click.native.stop="onOk" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';

export default {
  mixins: [mixins],
  props: {
    loading: {
      type: Boolean,
      default: false
    },
  },

  data () {
    return {
      causeList: [
        { label: "工单过期", value: 1 },
        { label: "信息有误", value: 2 },
        { label: "其他原因", value: -99 }
      ],
      formData: {}
    }
  },

  methods: {
    openModal (params) {
      this.modal = true;
      this.formData = params;
    }
  }
}
</script>
