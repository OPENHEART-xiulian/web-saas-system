<template>
  <Modal
    title="教学视频" 
    v-model="modal" 
    :closable="false"
    @on-cancel="closeDialog"
    class="w-dialog course-dialog"
    width="660">
    <ul class="lists">
      <li v-for="item in lists" :key="item.name"
        @click="toCarousel(item.key)">
        <my-img :src="item.src"></my-img>
        <p>{{ item.name }}</p>
        <!-- <i class="iconfont icon-shipinbofang"></i> -->
      </li>
    </ul>
    <div slot="footer">
      <Button type="text" @click="closeDialog">我熟悉操作，不需要教学视频</Button>
    </div>
  </Modal>
</template>

<script>
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      modal: false,
      lists: [
        { src: require('../../assets/images/course/health/thumb.jpg'), name: '健康档案对接设置', key: 'health' },
        { src: require('../../assets/images/course/work/thumb.jpg'), name: '新建维修工单', key: 'work' },
        { src: require('../../assets/images/course/server/thumb.jpg'), name: '服务项目管理', key: 'server' },
        { src: require('../../assets/images/course/maintain/thumb.jpg'), name: '配件资料管理', key: 'maintain' }
      ]
    }
  },

  methods: {
    openModal () {
      this.modal = true;
    },

    closeDialog () {
      this.modal = false;
      this.$parent.$refs.page.showOpt = true;
      this.$emit("on-cancel");
    },

    toCarousel (key) {
      this.modal = false;
      this.$emit('open-carousel', key);
    }
  }
}
</script>
