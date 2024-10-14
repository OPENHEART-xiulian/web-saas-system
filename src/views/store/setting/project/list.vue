<template>
  <div class="information-detail add-page">
    <div class="information-box mT20 search-form" style="text-align:right" v-if="!isMaster">
      <i-button type="primary" @click="syncProject" :loading="setPasswordLoading">同步项目</i-button>
    </div>
    <div
      class="information-box mT20"
      v-for="(item,index) in majorRepairList"
      :key="index"
    >
      <h4 class="title">{{item.c}}</h4>
      <div class="search-form input-list">
        <w-projects
          ref="projects"
          :originalItems="item.list ||[]"
          :title="item.c"
          :selectedItems="item.selectedItems"
          :repairIndex="index"
          @requireItems="requireItems"
        />
      </div>
    </div>
    <bottom-submit
      @on-cancel="$router.go(-1)"
      @on-confirm="submit"
      :loading="btnLoading"
    >
    </bottom-submit>

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
        <p class="font1">是否立即同步主修项目信息</p>
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
    <remind-dialog
      ref="syncRemindDialog"
      title="同步项目"
      :content="syncRemindContent"
      @on-ok="setAsync(true)"
    >
    </remind-dialog>
  </div>
</template>

<script>
import selfDialog from '@/components/dialog/self-dialog'
import { mapGetters, mapState } from 'vuex'
import WProjects from './components/workorder-projects'
import { storage } from '@/assets/js/utils'
import remindDialog from '@/components/dialog/remind-dialog'
import { majorRepairObj } from '@/store/json/default.js'
import '@/styles/views/store/information-detail.less'

export default {
  components: { WProjects, selfDialog, remindDialog },
  data () {
    const majorRepairDatas = JSON.parse(JSON.stringify(majorRepairObj))
    return {
      informationDetail: storage.get('STORE'),
      majorRepairDatas,
      btnLoading: false,
      majorRepairList: [],
      formData: {
        majorProject: {}
      },
      showModal: false,
      setPasswordLoading: false,
      isMaster: true,
      syncRemindContent: ''
    }
  },
  mounted () {
    this.getStoreMajor()
    this.init()
  },
  watch: {
    detailData (to) {
      this.formData = Object.assign(this.formData, to)
      this.addSelectedItems()
    },
    storeMajor (to) {
      this.initMajorRepairList(to.majorProject)
    }
  },
  methods: {
    syncProject () {
      this.syncRemindContent = '该操作会把总店不同的项目添加至本地项目，是否立即同步？'
      this.$refs.syncRemindDialog.openModal()
    },
    // 获取门店主修品牌，业务，项目
    getStoreMajor () {
      this.$store
        .dispatch({
          type: 'toGetStoreMajor'
        })
        .then(res => {
          this.getDetailData()
        })
    },
    addSelectedItems () {
      this.majorRepairList.map(item => {
        if (!this.formData.majorProject[item.name]) {
          this.formData.majorProject[item.name] = []
        } else {
          if (this.formData.majorProject[item.name].length > 0) {
            this.formData.majorProject[item.name].map(itemChild => {
              let index = item.list.findIndex(
                itemList => itemList.cn === itemChild
              )
              if (index > -1) {
                item.list[index].selected = true
                item.selectedItems.push(itemChild)
              }
            })
          }
        }
      })
    },
    getDetailData () {
      this.$store.dispatch({
        type: 'toGetStoreDetail',
        params: {
          storeId: this.informationDetail.storeId
        }
      })
    },
    initMajorRepairList (majorProjectOriginal) {
      const majorProject = JSON.parse(JSON.stringify(majorProjectOriginal))
      majorProject.map(item => {
        item.selectedItems = []
        item.list = item.n
        item.list.map(itemChild => {
          itemChild.selected = false
        })
        item.name = item.d
      })
      this.majorRepairList = majorProject
    },
    tabChange () {
      this.$router.push('/store/information/detail')
    },
    requireItems (obj) {
      Object.assign(this.majorRepairList[obj.repairIndex].list, obj.items)
      let arr = []
      obj.items.map(item => {
        if (item.selected) {
          arr.push(item.cn)
        }
      })
      this.majorRepairList[obj.repairIndex].selectedItems = arr
    },

    submit () {
      this.btnLoading = true;
      this.majorRepairList.map(item => {
        let arr = []
        item.list.map(itemChild => {
          if (itemChild.selected) arr.push(itemChild.cn)
        })
        this.formData.majorProject[item.name] = arr
      })
      this.$store
        .dispatch({
          type: 'toGetUpdateStore',
          params: this.formData
        })
        .then(res => {
          if (res.code === '0') {
            storage.set('STORE', res.data)
            this.$Message.success({
              content: '更新成功',
              onClose: () => {
                this.btnLoading = false
                this.$store.dispatch('getBusinessCityList')
              }
            })
          } else {
            this.$Message.error({
              content: '更新失败'
            })
            this.btnLoading = false
          }
        })
    },
    
    async init () {
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'getSyncMajorProject'
        })
        if (Number(res.code) === 0) {
          this.showModal = res.data.canSync
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      try {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'storeDetail',
          params: {
            storeId: storage.get('STORE').storeId
          }
        })
        if (Number(res.code) === 0) {
          this.isMaster = res.data.isMasterStore
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
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
          name: 'syncMajorProject',
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
  },
  filters: {},
  computed: {
    ...mapGetters({
      detailData: 'getStoreDetail',
      storeMajor: 'getStoreMajor'
    }),
    ...mapState({ loading: state => state.global.isLoading })
  }
}
</script>
