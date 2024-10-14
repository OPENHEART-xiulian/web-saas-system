<template>
  <div class="system-plateno">
    <div class="alert">
      <i class="iconfont icon-gantan"></i>
      <p>设置常用车牌号码前缀可在开单时快速选择，提高开单效率哦^_^</p>
    </div>

    <div style="background: white; min-height: 300px; padding: 20px;">
    <ul class="list">
      <!-- 车牌前缀列表 -->
      <li class="list-item" v-for="(item, index) in selectList" :key="index">
        <p class="list-item-text" v-if="!item._id">{{item.plateNo}}</p>
        <Poptip
          v-else
          confirm
          title="删除后将不能恢复，确定删除吗？"
          placement="top-start"
          @on-ok="removeItem(index)">
          <p class="list-item-text">
            {{item.plateNo}}
            <span class="del-btn">
              <i class="iconfont icon-guanbi"></i>
            </span>
          </p>
        </Poptip>
      </li>
      <!-- 功能按钮 -->
      <li :class="['list-item icon-wrap', {'edit': isEdit}]">
        <i-input v-model="editText" :maxlength="4" v-if="isEdit"></i-input>
        <!-- 确定按钮 -->
        <span class="active" v-if="isEdit" @click="addItem" :loading="loading">
          <i class="iconfont icon-dagou edit-icon"></i>
        </span>
        <!-- 取消按钮 -->
        <span class="active cancel" v-if="isEdit" @click="cancel" :loading="loading">
          <i class="iconfont icon-guanbi edit-icon"></i>
        </span>
        <!-- 添加按钮 -->
        <span class="active" v-if="!isEdit" @click="isEdit = true">
          <i class="iconfont icon-jiahao edit-icon"></i>
        </span>
      </li>
    </ul>
    </div>
  </div>
</template>

<script>
  import '@/styles/views/store/system-plateno.less';
  import { storage } from '@/assets/js/utils';
  export default {
    data () {
      return {
        loading: false,
        isEdit: '',
        editText: '',
        selectList: [],
        store: null,
      }
    },
    created () {
      this.store = storage.get('STORE');
      this.selectList = this.store.plateNo || [];
    },
    methods: {
      async removeItem (index) {
        let plateItem = this.selectList[index];
        if (!plateItem._id) return;
        const res = await this.$store.dispatch({
          name: 'plateNoDel',
          type: 'actionPost',
          params: {
            _id: plateItem._id
          }
        });

        if (res.code === '0') {
          this.$Message.success('删除成功');
          this.selectList.splice(index, 1);
          this.store.plateNo = this.selectList;
          storage.set('STORE', this.store);
        }
      },

      async addItem () {
        this.editText = this.editText.toUpperCase();
        const eq = this.selectList.find(elm => elm.plateNo === this.editText);
        if (eq) {
          this.$Message.warning('前缀已存在');
          return;
        }
        if (this.editText) {
          this.loading = true;
          const res = await this.$store.dispatch({
            type: 'actionPost',
            name: 'plateNoSave',
            params: {
              plateNo: this.editText
            }
          });

          if (res.code === '0') {
            this.selectList.push(res.data);
            this.store.plateNo = this.selectList;
            storage.set('STORE', this.store);
          }

          this.loading = false;
        }

        this.cancel();
      },

      cancel () {
        this.isEdit = false;
        this.editText = '';
      }
    }
  }
</script>
