<template>
  <div>
    <p class="top-box box-tip" v-if="tip">
      <!-- <Icon type="help-circled"></Icon> -->
      <span>提示：{{tip}}</span>
    </p>
    <div :class="['top-box', {'not-open-box': state && state.length <= 1}]">
      <div class="box-item" 
        v-for="item in state"
        :key="item.name"
        @click="toOpen">
        <p>
          <span class="item-name">{{ item.name }}</span>
          <Poptip trigger="hover" v-if="item.desc">
            <Icon type="help-circled"></Icon>
            <div slot="content">
              <i class="iconfont icon-gantan pop-icon"></i>
              <span class="pop-content">{{ item.desc }}</span>
            </div>
          </Poptip>
        </p>
        <p>{{ item.count }}</p>
        <p style="color: #59C871;" v-if="item.inc > 0">{{ item.inc }}<i class="iconfont icon-jiantou-shang"></i></p>
        <p v-else-if="item.inc === 0">{{ item.inc }}<i class="iconfont icon-jiantou-you"></i></p>
        <p style="color: #F22D00;" v-else>{{ Math.abs(item.inc) }}<i class="iconfont icon-jiantou-xia"></i></p>
      </div>
      <div v-if="state && state.length <= 1 && customerLabel.create" class="box-right">
        <p>开启客户标签后可自动为您展示更多的客户数据统计</p>
        <Button type="default" @click="toOpen">立即开启</Button>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import '@/styles/views/customer/top-box.less';

export default {
  props: {
    tip: String
  },
  data () {
    let customerLabel = this.$permission.data.customerLabel;
    return {
      customerLabel
    }
  },
  created () {
    this.$store.dispatch({
      type: 'toGetCustomerStat'
    })
  },

  computed: {
    ...mapGetters({
      state: 'getCustomerStat'
    }),

    ...mapState({ loading: (state) => state.customer.stateLoading })
  },

  methods: {
    toOpen () {
      if (this.customerLabel.create) {
        this.$router.push('/customer/label');
      }
    }
  }
}
</script>
