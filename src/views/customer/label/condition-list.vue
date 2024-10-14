<template>
  <div class="content">
    <p class="title">系统标签</p>
    <Alert class="w-alert"
      type="warning" show-icon>
      <template slot="desc">
        <span>开启系统标签后，可以根据消费情况自动给客户打标签，并显示在客户管理页面，客户分类一目了然</span>
      </template>
    </Alert>

    <div class="box">
      <template v-for="item in list">
        <div class="box-item" 
          :key="item.title"
          v-if="item.isDefault">
          <div>
            <p>{{ item.name }}</p>
            <p>{{ item.desc }}</p>
            <p class="count">人数：{{ item.customerCount || 0 }}</p>
            <Poptip
              confirm
              :title="!item.enable ? '开启后该标签将显示在客户管理页面' : '关闭后该标签将不显示在客户管理页面'"
              @on-ok="labelUpdate(item._id, item.enable)">
              <Button type="text">{{item.enable ? '关闭' : '开启'}}</Button>
            </Poptip>
          </div>
        </div>
      </template>
    </div>

    <p class="title">自定义条件标签<span>（最多添加20个）</span></p>
    <div class="box">
      <template v-for="item in list">
        <div class="box-item" :key="item.name" v-if="!item.isDefault">
          <div>
            <p>{{ item.name }}</p>
            <p>{{ item.desc }}</p>
            <p class="count">人数：{{ item.customerCount || 0 }}</p>
            <div class="opt-btn">
              <Button type="text" @click="toAdd(item._id)">编辑</Button>
              <Poptip
                confirm
                title="确定要删除该条件标签吗？"
                @on-ok="okDelLabel(item._id)">
                <Button type="text">删除</Button>
              </Poptip>
            </div>
          </div>
        </div>
      </template>
      <div class="box-item not-label" v-if="list.length < 20 && permissionData.create">
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
      const params = { type: '0' }

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
