<template>
  <div>
    <Modal
      v-model="speedModal"
      title="快捷入口设置"
      @on-ok="ok"
      width="900"
    >
      <p>最多可选5个，已选择 <span style="color:#FF8000">{{speedSelected.length}}</span> 个</p>

      <div class="speed_entry_setting">
        <ul>
          <li
            v-for="item in speedList"
            :key="item.code"
            @click="onClickCheck(item.code)"
          >
            <i class="checkIcon iconfont icon-check_box" :style="{color:item.selected?'#FF8000':''}"></i>
            <img
              :src="getUri('checkImg')+item.imgId"
              class="left"
              />
            <p>{{item.name}}</p>
          </li>
        </ul>
      </div>
    </Modal>

  </div>
</template>

<script>
import { getUri } from '@/https/api.js'
import '@/styles/views/speedModal.less'
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      speedModal: false,
      maxSelected: 5,
      inited: false,
      speedSelected: []
    }
  },
  props: {
    initSelected: {
      type: Array,
      default () {
        return []
      }
    }
  },

  watch: {
    speedList (newV) {
      if (this.inited) return
      const initSelected = this.initSelected
      if (initSelected.length > 0) {
        let index = -1
        const toInitArr = []
        newV.map(item => {
          index = initSelected.findIndex(itemc => itemc === item.code)
          if (index > -1) {
            item.selected = true
            toInitArr.push(item)
          }
          index = -1
        })
        this.inited = true
        this.$emit('toInitSelected', toInitArr)
      }
    },
    initSelected (newV) {
      if (this.inited) return
      if (this.speedList.length && this.speedList.length > 0) {
        let index = -1
        const toInitArr = []
        this.speedList.map(item => {
          index = newV.findIndex(itemc => itemc === item.code)
          if (index > -1) {
            item.selected = true
            toInitArr.push(item)
          }
          index = -1
        })
        this.inited = true
        this.$emit('toInitSelected', toInitArr)
      }
    }
  },

  computed: {
    ...mapGetters({
      speedList: 'getShortCutMenus'
    })
  },

  created () {
    this.speedSelected = JSON.parse(JSON.stringify(this.initSelected))
    this.getShortCutMenus()
  },

  methods: {
    getUri,
    open () {
      this.speedSelected = JSON.parse(JSON.stringify(this.initSelected))
      this.speedList.map(item => {
        if (this.speedSelected.includes(item.code)) {
          item.selected = true
        } else {
          item.selected = false
        }
      })
      this.speedModal = true
    },
    getShortCutMenus () {
      this.$store.dispatch({
        type: 'toGetShortCutMenus'
      })
    },
    ok () {
      const selectedIds = Object.assign([], this.speedSelected)
      const selectedArr = []
      this.speedList.map(item => {
        if (item.selected) {
          selectedArr.push(item)
        }
      })
      this.$emit('ok', { selectedIds, selectedArr })
    },
    onClickCheck (code) {
      const maxLength = this.maxSelected
      let speedSelected = this.speedSelected
      let speedList = this.speedList
      if (speedSelected.length === 0) {
        speedSelected.push(code)
        this.toggleSelect(code)
      } else if (speedSelected.length < maxLength) {
        let index = speedSelected.findIndex(item => item === code)
        if (index > -1) {
          speedSelected.splice(index, 1)
          this.toggleSelect(code)
        } else {
          speedSelected.push(code)
          this.toggleSelect(code)
        }
      } else {
        let index = speedSelected.findIndex(item => item === code)
        if (index > -1) {
          speedSelected.splice(index, 1)
          this.toggleSelect(code)
        } else {
          this.toggleSelect(speedSelected[0])
          speedSelected.shift()
          speedSelected.push(code)
          this.toggleSelect(code)
        }
      }
    },
    toggleSelect (code) {
      const speedList = this.speedList
      for (let n = 0; n < speedList.length; n++) {
        if (speedList[n].code === code) {
          speedList[n].selected = !speedList[n].selected
          break
        }
      }
    }
  },

  components: {}
}
</script>
