<template>
  <!-- 项目信息 -->
  <div>
    <table class="input-list-table">
      <tbody class="tbody">
        <tr class="no-data">
          <td colspan="6" v-if="selectedItems.length===0" >暂无项目信息，请选择项目</td>
          <td v-else>
            <div class="majorTypeModal itemBox">
              <ul class="itemsList">
                <li
                  v-for="(item,index) in selectedItems"
                  :key="index"
                  class="active">
                  {{item}}
                  <i class="iconfont icon-shanchu" @click="deleteItems(item)"></i>
                </li>
              </ul>
            </div>
          </td>

        </tr>
      </tbody>
      <tfoot class="tfooter">
        <tr>
          <i-button
            style="margin-top: 20px"
            type="primary"
            @click="selectItems"
          >选择项目</i-button>
        </tr>
      </tfoot>
    </table>
    <Modal
      :title="title"
      width="60%"
      v-model="showModal"
      :closable="false"
      @on-ok="ok"
      class="majorTypeModal"
    >
      <ul class="itemsList">
        <li
          v-for="(item,index) in items"
          :key="index"
          :class="[item.selected?'active':'']"
          @click="toggleSelect(index)"
        >
          {{item.cn}}
        </li>
      </ul>
    </Modal>
  </div>
</template>

<script>
import '@/styles/components/input-list.less'
import '@/styles/views/store/majorRepair.less'

export default {
  props: {
    repairIndex: {
      type: Number,
      default: 0
    },
    title: {
      type: String,
      default: ''
    },
    originalItems: {
      type: Array,
      default: () => {
        return []
      }
    },
    selectedItems: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  data () {
    return {
      showModal: false,
      items: [],
      showItems: []
    }
  },
  watch: {
    originalItems: {}
  },
  mounted () {},
  methods: {
    ok () {
      this.$emit('requireItems', {
        repairIndex: this.repairIndex,
        items: this.items
      })
    },
    deleteItems (itemName) {
      const index = this.originalItems.findIndex(item => item.cn === itemName)
      this.originalItems[index].selected = false
      this.items = JSON.parse(JSON.stringify(this.originalItems))
      this.ok()
    },
    selectItems () {
      this.items = JSON.parse(JSON.stringify(this.originalItems))
      this.showModal = true
    },
    toggleSelect (index) {
      this.items[index].selected = !this.items[index].selected
    }
  }
}
</script>
