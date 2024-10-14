<template>
  <Modal :title="type + '类别管理'" v-model="modal" 
    @on-cancel="onCancel" 
    @on-ok="onOk"
    class="w-dialog service-cate-dialog"
    width="800">
    <div class="action">
      <i-button type="default" @click="toggleAllChild">{{openAll ? '收起' : '展开'}}所有子类别</i-button>
      <i-button type="primary" @click="addChild"><i class="iconfont icon-xinzeng"></i>新增{{type}}类别</i-button>
    </div>
    <cate-admin 
      ref="cateAdmin" 
      :lists="lists" 
      :request="request"
      @toggle-change="toggleChange">
    </cate-admin>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';
import CateAdmin from '@/components/cate-admin';

export default {
  components: { CateAdmin },
  mixins: [mixins],
  props: {
    type: String,
    request: String,
    lists: Array
  },
  data () {
    return {
      modal: false,
      openAll: false,
    }
  },

  methods: {
    openModel () {
      this.modal = true;
    },
    addChild () {
      this.$refs.cateAdmin.addChild();
    },
    toggleAllChild () {
      if (this.lists.length === 0) return;
      this.openAll = !this.openAll;
      this.$refs.cateAdmin.toggleAllChild(this.openAll);
    },
    toggleChange (v) {
      this.openAll = v;
    },
    toAdd (type) {
      this.modal = false;
      this.$router.push({ path: '/store/service/add/create/' + type });
    }
  },
}
</script>
