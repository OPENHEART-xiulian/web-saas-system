<template>
  <div :class="['permission-container', {'is-parent': !permission._id}]">
    <div :class="['permission-list', {'has-grandson': permission.hasGrandson, 'not-grandson': !permission.hasGrandson}]">
      <template v-for="(item, index) in permissionList">
        <div
          :class="['permission-item']"
          :key="index"
        >
          <div
            class="checkbox-item"
            @click.stop="toggleChildren(item, index)"
          >
            <span :class="['icon-wrap', {'has-grandson': permission.hasGrandson}]">
              <i
                :class="['iconfont icon-sanjiaoxing-xia', {'open': item.open}]"
                v-if="item.children && item.children.length"
              ></i>
            </span>
            <Checkbox
              :indeterminate="item.indeterminate"
              :value="item.value"
              @click.prevent.stop.native="handleCheckAll(item, index)"
            >{{item.menuName}}</Checkbox>
          </div>
          <template v-if="item.children && item.children.length">
            <permission-tree
              :permission="item"
              v-show="item.open"
              @toggle-parent="toggleParent"
            ></permission-tree>
          </template>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
export default {
  name: 'permission-tree',
  props: {
    permission: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      hasChildren: false
    }
  },

  computed: {
    permissionList: {
      get () {
        return this.permission.children
      },
      set (val) {
        this.permission.children = val
      }
    }
  },

  methods: {
    toggleChildren (data, index) {
      data.open = !data.open
      this.permissionList.splice(index, 1, data)
    },

    handleCheckAll (item, index) {
      item.value = !item.value
      item.indeterminate = item.value
      item.children = this.formatList(item.children, item.value, 'value')
      // this.permissionList.splice(index, 1, item);
      // this.permissionList = JSON.parse(JSON.stringify(this.permissionList));
      // this.$emit("toggle-parent", this.permission); // 操作父级
      this.toggleParent()
    },

    toggleOpenAll () {
      this.permissionList = this.formatList(this.permissionList, true, 'open')
    },

    toggleCloseOpenAll () {
      this.permissionList = this.formatList(this.permissionList, false, 'open')
    },

    toggleCheckAll () {
      this.permissionList = this.formatList(this.permissionList, true, 'value')
    },

    toggleCloseCheckAll () {
      this.permissionList = this.formatList(this.permissionList, false, 'value')
    },

    toggleParent () {
      let permission = this.permission
      let value = true
      let indeterminate = false
      permission.children.forEach(elm => {
        if (elm.indeterminate) indeterminate = true
        if (!elm.value) value = false
      })
      permission.value = value
      permission.indeterminate = indeterminate
      this.$emit('toggle-parent', permission)
    },

    // 将所有子类属性设置为flag
    formatList (list = [], flag, type = 'open') {
      list.forEach(elm => {
        elm[type] = flag
        if (type === 'value') {
          elm.value = flag
          elm.indeterminate = flag
        } else {
          elm[type] = flag
        }
        if (elm.children && elm.children.length) {
          elm.children = this.formatList(elm.children, flag, type)
        }
      })
      return [].concat(list)
    },

    // 获取已经选中的id列表
    getPermissionIds () {
      let ids = []
      this.recursionIds(this.permissionList, ids)
      return ids
    },

    // 获取已经选中的id列表
    recursionIds (list, ids) {
      list.forEach(elm => {
        if (elm.indeterminate) ids.push(elm._id)
        if (elm.children && elm.children.length) {
          this.recursionIds(elm.children, ids)
        }
      })
    }
  }
}
</script>

<style lang="less">
.permission-container {
  .permission-list {
    display: flex;
    flex-wrap: wrap;
  }

  &.is-parent {
    > .permission-list > .permission-item {
      margin-bottom: 20px;
      border: 1px solid #f0f0f0;
    }
    > .permission-list > .permission-item > .checkbox-item {
      background: #fafafa;
    }
  }

  .permission-item {
    > div {
      user-select: none;
      padding: 0 20px;
    }
    .ivu-checkbox-wrapper {
      height: 50px !important;
      line-height: 50px !important;
      padding: 0 10px !important;
    }
  }

  .icon-sanjiaoxing-xia {
    font-size: 12px;
    cursor: pointer;
    display: inline-block;
    transition: 0.15s all linear;
    transform: rotate(-90deg);
  }

  .icon-sanjiaoxing-xia.open {
    transform: rotate(0);
  }

  .not-grandson {
    padding-left: 30px;
  }

  .has-grandson {
    display: block;
    // padding: 0 20px;
    .permission-item > div {
      padding: 0 15px;
    }
  }

  .ivu-checkbox-checked .ivu-checkbox-inner:after {
    transform: rotate(45deg);
    top: 0;
    width: 10px;
    left: 3px;
  }
  .has-grandson.icon-wrap {
    display: inline-block;
    width: 16px;
  }
  .icon-wrap {
    display: inline-block;
    width: 1px;
  }
}
</style>
