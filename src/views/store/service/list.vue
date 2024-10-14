<template>
  <div class="service-list">
    <saas-bread title="服务项目"></saas-bread>
    <w-tab
      @tab-change="tabChange"
      :tabList="tabList"
      :tabIndex="tabIndex"
    />

    <local-item v-if="tabIndex === 0"></local-item>
    <cloud-item v-else></cloud-item>
    <self-dialog
      :showModal="showModal"
      :showClose=false
      width="240"
      @closeModal="showModal=false"
    >
      <div
        slot="content"
        class="relationStore"
      >
        <img
          src="@/assets/images/course/remind/synchronization_pic_popup.png"
          alt=""
        >
        <p class="font1">检测到已关联总店 </p>
        <p class="font1">是否立即同步服务项目</p>
        <i-button
          type="primary"
          @click="setAsync(true)"
          :loading="setPasswordLoading"
          style="margin-top:25px;width:150px;"
        >立即同步</i-button>
        <p style="margin:10px;"></p>
        <p
          @click="setAsync(false)"
          class="noSetting"
        >暂不设置</p>
      </div>
    </self-dialog>
  </div>
</template>

<script>

import '@/styles/views/store/service-list.less'
import wCategory from '@/components/category'
import localItem from './localItem'
import cloudItem from './cloudItem'
import selfDialog from '@/components/dialog/self-dialog'
export default {
  components: { wCategory, localItem, cloudItem, selfDialog },
  data () {
    return {
      tabList: [
        { name: '本地项目' },
        { name: '云项目' }
      ],
      tabIndex: 0,
      showModal: false,
      setPasswordLoading: false
    }
  },

  created () {
    this.init()
  },

  methods: {
    async init () {
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'getSyncService'
        })
        if (Number(res.code) === 0) {
          this.showModal = res.data.canSync
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    tabChange (v) {
      this.tabIndex = v
    },
    async setAsync ( isIngnore ) {
      this.setPasswordLoading = true
      try {
        const params = {}
        let tipsText = '同步成功'
        if (!isIngnore) {
          params.ignoreSync = true
          tipsText = '暂不设置成功'
        }
        const res = await this.$store.dispatch({
          type: 'actionPost',
          name: 'syncService',
          params: params
        })
        if (Number(res.code) === 0) {
          this.$Message.success(tipsText)
          if (isIngnore) {
            setTimeout( () => { this.$router.go(0) }, 400)        
          } else {
            this.showModal = false
          } 
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.setPasswordLoading = false
    }
  }
}
</script>
