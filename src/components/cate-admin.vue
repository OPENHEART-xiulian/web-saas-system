<template>
  <!-- <div class="service-category"> -->
    <div class="w-table store-category">
      <table>
        <thead>
          <tr>
            <th style="width: 100px">
              <Checkbox v-model="checkAll" :indeterminate='indeterminate' @on-change="checkAllChange"></Checkbox>
            </th>
            <th style="padding-left: 28px;">类别名称</th>
            <th style="width: 136px">操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="cateList.length === 0" class="no-data">
            <td colspan="3">暂无数据</td>
          </tr>
          <tr v-for="(item, index) in cateList" :key="index">
            <td><Checkbox v-model="item.check" @on-change="checkChange"></Checkbox></td>
            <td colspan="2">
              <w-tree 
                :request="request"
                :value="cateList[index]" 
                :root="cateList" 
                :index="index" 
                :open-dialog="openDialog"
                @toggle-change="toggleChange"
                @on-remove="onRemove">
              </w-tree>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">
              <Checkbox v-model="checkAll" :indeterminate='indeterminate' @on-change="checkAllChange"></Checkbox>
              <i-button type="default" @click="deleteCate">批量删除</i-button>
            </td>
          </tr>
        </tfoot>
      </table>
      <Spin fix v-if="loading"></Spin>
      <remind-dialog 
        ref="remindDialog"
        :transfer="false"
        :title="request === 'serviceCate' ? '删除服务类别' : '删除配件类别'"
        :content="`操作后无法恢复，该类别下的配件自动归类到“其他”类别确定删除${delCount}配件类别吗？`"
        @on-ok="delConfirm">
      </remind-dialog>
    </div>
  <!-- </div> -->
</template>

<script>
import { mapState } from 'vuex';
import '@/styles/views/store/store-cate.less';
import '@/styles/components/table.less';
import WTree from '@/components/tree';
import remindDialog from '@/components/dialog/remind-dialog';
export default {
  components: { WTree, remindDialog },
  props: {
    request: String,
    lists: Array,
  },
  data () {
    return {
      checkAll: false,
      indeterminate: false,
      cateList: [],
      tempCallback: null,
      delCount: 0
    }
  },

  computed: {
    ...mapState({ loading: (state) => state.global.isLoading })
  },
  
  watch: {
    lists (to) {
      this.cateList = to;
    }
  },
  mounted () {
    this.cateList = this.lists;
  },
  methods: {
    checkEmpty (array) {
      for (let i = 0, len = array.length; i < len; i++) {
        const item = array[i];
        if (item.value === '') {
          this.$Message.warning({
            content: '请补全空白分类名称'
          })
          return
        };
      }
    },
    addChild () {
      this.cateList.push({
        parent: '',
        name: '',
        children: []
      })
      this.checkChange();
      this.toggleChange();
    },
    toggleAllChild (show) {
      this.toggleChild(this.cateList, show);
      this.cateList = JSON.parse(JSON.stringify(this.cateList));
    },
    toggleChild (array, show) {
      for (let i = 0, len = array.length; i < len; i++) {
        const item = array[i];
        if (item.children && item.children.length > 0) {
          item.show = show;
          this.toggleChild(item.children, show);
        } else {
          item.show = false;
        }
      }
    },
    toggleChange () {
      let hasOpen = this.validHasOpen();
      this.$emit('toggle-change', hasOpen);
    },
    // 验证是否有打开的子分类
    validHasOpen () {
      for (let i = 0; i < this.cateList.length; i++) {
        const item = this.cateList[i];
        if (item.show) {
          return true;
        };
      }
      return false;
    },
    remove (codeList) {
      this.$store.dispatch({
        type: this.request + 'Del',
        params: {
          codeList: codeList
        }
      }).then(res => {
        if (res.code === '0') {
          this.$emit('on-remove', this.index, this.treeObj);
        }
      })
    },
    checkChange () {
      if (this.cateList.length === 0) {
        this.indeterminate = false;
        this.checkAll = false;
        return;
      }
      let checkCount = 0;
      for (let i = 0, len = this.cateList.length; i < len; i++) {
        const item = this.cateList[i];
        if (item.check) checkCount += 1;
      }

      if (checkCount === this.cateList.length) {
        this.indeterminate = false;
        this.checkAll = true;
      } else if (checkCount === 0) {
        this.indeterminate = false;
        this.checkAll = false;
      } else {
        this.indeterminate = true;
        this.checkAll = false;
      }
    },
    checkAllChange (v) {
      this.indeterminate = false;
      this.cateList.forEach(item => {
        item.check = v;
      })
    },
    deleteCate () {
      let i = 0;
      this.cateList.forEach(item => {
        if (item.check) i++;
      });
      if (i === 0) return;
      this.openDialog(this.multipleDel, '所选' + i + '项');
    },
    onRemove (index) {
      this.cateList.splice(index, 1);
      this.checkChange();
    },
    // 获取临时回调函数
    openDialog (callback, tip) {
      this.delCount = tip || '这1';
      this.$refs.remindDialog.openModal();
      this.tempCallback = callback;
    },
    multipleDel () {
      let codeList = [];
      for (let i = this.cateList.length - 1; i >= 0; i--) {
        const item = this.cateList[i];
        if (item.check) {
          codeList.push(item.code);
          this.cateList.splice(i, 1);
        };
      }
      this.remove(codeList)
      this.checkChange();
    },
    // 执行临时回调函数，确认删除类别
    delConfirm () {
      this.$refs.remindDialog.modal = false;
      this.tempCallback();
    }
  }
}
</script>
