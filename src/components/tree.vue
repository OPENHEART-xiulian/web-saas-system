<template>
  <div :class="['w-tree', {'hide-line': leve === 0}]">
    <div :class="['w-tree-item']">
      <i 
        :class="['iconfont icon-sanjiaoxing-xia', {'open': isOpen}]" 
        v-if="treeObj.children && treeObj.children.length > 0"
        @click.stop="toggleTree">
      </i>
      <div class="input-con">
        <i-input ref="input" 
          v-model.trim="tempName" 
          @on-blur="onBlur" 
          @on-focus="onFocus" 
          @on-enter="onEnter"
          placeholder="">
        </i-input>
        <i v-if="loading" class="ivu-icon ivu-icon-load-c rotate-360"></i>
        <div class="action-con">
          <i-button v-if="leve < 2" type="text" @click.stop="addChild">添加子分类</i-button>
          <span></span>
          <i-button type="text" @click.stop="delChild">删除</i-button>
        </div>
      </div>
      <div v-if="treeObj.children && treeObj.children.length > 0" v-show="isOpen" >
        <w-tree 
          ref="tree"
          v-for="(item, index) in treeObj.children" 
          :key="index" 
          :index="index"
          :value="treeObj.children[index]"
          :open-dialog="openDialog"
          :request="request"
          :root="root"
          :leve="leve + 1" 
          @on-remove="onRemove">
        </w-tree>
      </div>
    </div>
  </div>
</template>

<script>
import '@/styles/components/tree.less';
export default {
  name: 'w-tree',
  props: {
    openDialog: Function,
    request: String,
    value: {
      type: Object,
      default () {
        return []
      }
    },
    index: Number,
    leve: { // 树层级
      type: Number,
      default: 0
    },
    root: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      isClick: false,
      loading: false,
      isClose: true,    
      tempName: '',
      isOpen: false,    // 是否打开子分类
      treeObj: {
        name: ''
      },
    }
  },
  watch: {
    value (to) {
      this.init(to);
    }
  },
  mounted () {
    this.init(this.value);
  },
  methods: {
    init (to) {
      // debugger
      this.tempName = to.name || '';
      this.isOpen = to.show || false;
      this.treeObj = to;
      if (!this.treeObj.children) this.treeObj.children = [];
    },

    // 打开关闭子分类
    toggleTree () {
      this.isOpen = !this.isOpen;
      this.treeObj.show = this.isOpen;
      this.$emit('toggle-change', this.isOpen);
    },
    
    // 验证子分类是否有空的名字
    valiEmpty (array) {
      for (let i = 0, len = array.length; i < len; i++) {
        const item = array[i];
        if (item.name === '') return false;
      }
      return true;
    },

    // 显示提示框
    showMsg (str) {
      this.isClose = false;
      this.$Message.warning({
        content: str,
        onClose: () => {
          this.isClose = true;
          this.loading = false;
        }
      });
    },

    // 添加子分类
    addChild () {
      if (this.loading) {
        this.isClick = true;
        return
      };
      if (!this.isClose) return;
      
      if (this.tempName === '' || !this.valiEmpty(this.treeObj.children)) {
        this.showMsg('请补全空白分类名称');
        return;
      }
      
      // 子分类关闭的时候打开
      this.isOpen || (this.isOpen = true);
      // debugger
      
      this.treeObj.children.push({
        name: '', 
        parent: this.treeObj.code || '',
        children: []
      });

      this.$emit('toggle-change', this.isOpen);
    },
    // 删除子分类
    delChild () {
      if (this.treeObj.name === '') {
        this.$emit('on-remove', this.index);
        return;
      }
      this.openDialog(this.delCallback);
    },
    // 删除回调函数
    delCallback () {
      this.$store.dispatch({
        type: this.request + 'Del',
        params: {
          codeList: [this.treeObj.code]
        }
      }).then(res => {
        if (res.code === '0') {
          this.$emit('on-remove', this.index);
        }
      })
    },
    // 删除当前树
    onRemove (index) {
      this.treeObj.children.splice(index, 1);
    },
    // 手动失去焦点
    onEnter (e) {
      e.target.blur();
    },
    onFocus () {
      
    },
    // 失去焦点 添加或更新分类名称
    onBlur () {
      // 加载中、名字为空、名字等于之前的名字、提示框未关闭，都不执行操作
      if (this.tempName === '' || this.tempName === this.treeObj.name || !this.isClose) return;
      this.treeObj.name = this.tempName;
      this.loading = true;
      // 验证名字是否存在
      this.$store.dispatch({
        type: this.request + 'Valid',
        params: {
          name: this.tempName
        }
      }).then( res => {
        // 分类名字不存在则添加或更新分类
        if (res.code === '0') {
          this.addCategory();
        } else { 
          this.loading = false;
          this.tempName = '';
          this.treeObj.name = '';
          this.showMsg('分类名称已存在');
        }
      })
    },
    // 添加或更新分类名称
    addCategory () {
      let request;
      let params = {
        name: this.tempName
      };
      // debugger
      // 如果又cid就是更新 没有就是添加
      if (!this.treeObj.cid) {
        request = this.request + 'Add';
        params.parent = this.treeObj.parent;
      } else {
        request = this.request + 'Update';
        params.code = this.treeObj.code;
      }
      this.$store.dispatch({
        type: request,
        params: params
      }).then( res => {
        this.loading = false;
        if (res.code === '0') {
          const obj = res.data;
          this.treeObj.cid = obj.cid;
          this.treeObj.code = obj.code;
          this.treeObj.name = obj.name;
          this.treeObj.parent = obj.parent;
          this.treeObj.storeId = obj.storeId;
          this.treeObj.ancestors = obj.ancestors || [];
          if (this.isClick) {
            this.isClick = false;
            this.addChild()
          }
        }
      })
    },
  }
}
</script>
