<template>
  <div class="content">
    <p class="title">常用标签</p>
    <Alert class="w-alert"
      type="warning" show-icon>
      <template slot="desc">
        <span>我们已经为您设置了一些常用标签，您也可以根据门店实际需要新增、编辑、删除标签哦</span>
      </template>
    </Alert>
    <div class="box">
      <div class="box-item" 
        v-for="item in list"
        :key="item.name">
        <div>
          <p>{{ item.name }}</p>
          <p>{{ item.desc }}</p>
          <p class="count">人数：{{ item.customerCount }}</p>
          <div class="opt-btn" v-if="!item.isDefault">
            <Button type="text" @click="toAdd(item._id)">编辑</Button>
            <Poptip
              confirm
              title="确定要删除该手动标签吗？"
              @on-ok="okDelLabel(item._id)">
              <Button type="text">删除</Button>
            </Poptip>
          </div>
        </div>
      </div>
      <div class="box-item not-label" v-if="permissionData.create">
        <div @click="toAdd('create')">
          <i class="iconfont icon-jiahao"></i>
        </div>
      </div>
    </div>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

export default {
  data () {
    let permissionData = this.$permission.data.customerLabel;
    return {
      permissionData
    }
  },

  created () {
    this.init();
  },

  computed: {
    ...mapGetters({
      list: 'getCustomerTagList'
    }),

    ...mapState({ 
      loading: (state) => state.customer.tagLoading
    }),
  },

  methods: {
    init () {
      const params = { type: '1' }
      this.$store.dispatch({
        type: 'toGetCustomerTagList',
        params
      })
    },

    labelUpdate (id, value) { // 标签开启/关闭
      const params = {
        _id: id,
        enable: !value
      }
      
      this.$store.dispatch({
        type: 'actionPost',
        params,
        name: 'customerTagUpdate'
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success(value ? '关闭成功' : '开启成功');
          this.init();
        }
      }).catch((err) => {
        console.log(err)
      })
    },

    okDelLabel (id) { // 标签删除
      const params = {
        idList: [id]
      }
      this.$store.dispatch({
        type: 'actionPost',
        params,
        name: 'customerTagDel'
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('删除成功');
          this.init();
        }
      }).catch((err) => {
        console.log(err)
      })
    },

    toAdd (id) {
      this.$router.push('/customer/label/form/' + id);
    }
  },
}
</script>
