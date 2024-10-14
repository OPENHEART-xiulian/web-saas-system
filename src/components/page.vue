<template>
  <div class="page">
    <header v-if="!$slots.header">
      <div
        class="icon-btn"
        @click="$emit('toggle-menu')"
      >
        <i class="iconfont icon-daohang"></i>
      </div>
      <div class="quick-entry">
        <template v-for="(item, index) in menuList">
          <router-link
            :to="item.url"
            :key="index"
            class="entry-item"
          >
            <i :class="['iconfont', item.icon]"></i>
            <span class="title">{{ item.name }}</span>
          </router-link>
        </template>
      </div>
      <div class="search">
        <format-input
          type="text"
          v-model="searchText"
          placeholder="输入车牌号/姓名/电话号码/工单号"
          @keyup.native.enter="search"
        >

        </format-input>
        <img src="@/assets/images/icon/icon_search.png" alt="" @click="search">
      </div>
      <div class="about">
        <div class="item document">
          <Dropdown @on-click="handleDropdown">
            <a href="javascript:void(0)">新手指引</a>
            <DropdownMenu slot="list">
              <DropdownItem name="1">操作说明</DropdownItem>
              <DropdownItem name="2">教学视频</DropdownItem>
            </DropdownMenu>
          </Dropdown>
          <i class="red-block"></i>
          <div
            class="opt-tip"
            v-if="showOpt"
          >
            <span>教学视频在这，可随时观看哦</span>
            <i
              class="iconfont icon-guanbi"
              @click="closeOpt"
            ></i>
          </div>
          <!-- <Tooltip content="点击下载操作说明">
            <span @click="downDocument">操作说明</span>
          </Tooltip> -->
        </div>
        <div class="item">
          <p class="title">客服中心</p>
          <div class="item-content contact">
            <h2>400-801-9131</h2>
            <p>周一至周五 9:00-18:00</p>
            <div class="qr-code">
              <img
                src="/images/qrcode.png"
                alt=""
              >
            </div>
            <p>扫一扫关注XXX公众号</p>
          </div>
        </div>
        <div class="item">
          <router-link
            target="_blank"
            to="/notice/version"
          >消息</router-link>
        </div>
        <!-- 店长才显示账户 -->
        <div class="item" v-if="user.isRoot">
          <router-link
            to="/account/balance"
          >账户</router-link>
        </div>
        <div class="item">
          <div class="icon">
            <img
              src="/images/icon_user_gray.png"
              alt=""
            />
          </div>
          <p class="title">{{ user.username }}
            <i class="iconfont icon-sanjiaoxing-xia"></i>
          </p>
          <div class="item-content account">
            <p
              class="account-item"
              @click.stop="toAccount"
            >账号设置</p>
            <p
              class="account-item"
              @click="loginOut"
            ><i class="iconfont icon-tuichu"></i>退出登录</p>
          </div>
        </div>
      </div>
    </header>
    <slot
      v-else
      name="header"
    ></slot>

    <section :class="{'toggle-pad': !iconMenu && $route.matched[1] && $route.matched[1].meta.showChild}">
      <slot></slot>
    </section>

    <!-- <footer v-if="!$slots.footer">Copyright © 2018 广东修炼科技股份有限公司</footer> -->
    <!-- <slot v-else name="footer"></slot> -->
    <slot name="footer"></slot>

  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { storage, clearStorge } from '@/assets/js/utils.js'
import { DOCS_OPERATIONGUIDE } from '@/https/api.js'
import '@/styles/components/page.less'

export default {
  props: {
    menuList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      user: this.$storage.get('USER'),
      showOpt: false, // 是否显示提示教学视频
      // permissKey: 权限对应key
      // list: []
      searchText: ''
    }
  },

  computed: {
    ...mapGetters({
      iconMenu: 'getIconMenu',
      userName: 'getUserName'
    })
  },

  watch: {
    userName (value) {
      if (value) {
        this.user.username = value
      }
    }
  },

  methods: {
    search () {
      if (this.searchText === '') {
        this.$Message.error('请输入搜索内容')
        return
      }
      const url = `/searchResult?text=${this.searchText.replace(/\#/, '%23')}&type=0`
      this.$router.push(url)
      this.searchText = ''
    },

    toAccount () {
      this.$router.push('/account')
    },

    loginOut () {
      this.$store.dispatch('loginOut').then(res => {
        if (res.code === '0') {
          this.$Message.success({
            content: '退出登录成功',
            onClose: () => {
              clearStorge()
              this.$router.push('/login')
            }
          })
        }
      })
    },

    downDocument () {
      window.open(DOCS_OPERATIONGUIDE, '_blank')
    },

    account (name) {
      name = Number(name)
      switch (name) {
        case 1:
          this.$router.push('/account/info');
          break;
        default:
          this.$router.push('/account/balance');
      }
    },

    handleDropdown (name) {
      // 新手指引点击项
      if (name === '1') {
        this.downDocument()
      } else {
        this.$parent.openCourse()
      }
    },

    closeOpt () {
      // 关闭指引提示
      this.showOpt = false
    }
  }
}
</script>
