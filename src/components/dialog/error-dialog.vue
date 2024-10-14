<template>
  <Modal v-model="modal" 
    class="w-dialog error-dialog"
    :closable="false"
    width="500">
    <p><i class="iconfont icon-gantan"></i>导入失败，请根据以下提示调整导入模板</p>
    <p v-for="(item, index) in errors" 
      :key="index">
      <span>第{{ item.cell.substr(1, item.cell.length - 1) }}行</span>
      <span>{{ item.value }}</span>
      <span>{{ item.msg }}</span>
    </p>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button type="error" size="large" @click.native.stop="onCancel">确定</Button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';

export default {
  mixins: [mixins],

  props: {
    errors: Array
  }
}
</script>
