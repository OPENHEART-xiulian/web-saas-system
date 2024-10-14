<template>
  <!-- 账户信息 -->
  <div class="accountInfo">
    <saas-bread title="账户信息"></saas-bread>
    <div class="info_basicModule">
      <div class="title">基本信息</div>
      <div class="body">
        <ul class="accountItems">
          <li class="item">
            <span class="label">账号：</span>
            <p class="content">{{JXBDetail.jianZhengBaoAccount || '--'}}</p>
          </li>
          <li class="item">
            <span class="label">账户类型：</span>
            <p class="content">{{JXBDetail.jianZhengBaoAccountType || '--'}}</p>
          </li>
        </ul>
      </div>
    </div>
    <div class="info_basicModule">
      <div class="title">结算信息</div>
      <div class="body">
        <template v-if="JXBDetail.bankAccount">
          <ul class="accountItems">
            <li class="item">
              <span class="label">账户类型：</span>
              <p class="content">{{JXBDetail.bankAccountType || '--'}}</p>
            </li>
            <li class="item">
              <span class="label">开户名称：</span>
              <p class="content">{{JXBDetail.bankUserName || '--'}}</p>
            </li>
            <li class="item">
              <span class="label">银行账户：</span>
              <p class="content">{{JXBDetail.bankAccount || '--'}}</p>
            </li>
            <li class="item">
              <span class="label">开户银行：</span>
              <p class="content">{{JXBDetail.bankName || '--'}}</p>
            </li>
            <li class="item">
              <span class="label">银行预留手机号：</span>
              <p class="content">{{JXBDetail.bankUserMobile || '--'}}</p>
            </li>
            <li class="item">
              <span class="label">统一社会信用代码：</span>
              <p class="content">{{JXBDetail.socialCode || '--'}}</p>
            </li>
          </ul>

          <div class="bandCard_tool">
            <i-button type="primary" @click="removeBinding">解绑</i-button>
            <i-button @click="$router.push('/account/bindingCard')">修改</i-button>
          </div>
        </template>
        <template v-else>
          <div class="no_binding">
            <p>
              <img src="/images/logo_s.png" alt="">
            </p>
            <p>绑定对公账户可开通提现等功能</p>
            <i-button type="primary" @click="$router.push('/account/bindingCard')">立即绑定</i-button>
          </div>
        </template>

      </div>
    </div>
    <Modal  v-model="modal" title="解绑银行账户" @on-ok="onRemoveBinding">
        <p>解绑后，XXX的账户余额将无法正常提现，确定解绑吗？</p>
    </Modal>
    <Spin 
      fix
      v-if="loading"
    ></Spin>
  </div>
</template>

<script>
import '@/styles/views/account/info.less'
import { mapGetters } from 'vuex';
import { storage } from '@/assets/js/utils.js';

export default {
  components: {},
  data () {
    return {
      loading: false,
      modal: false,
      JXBDetail: {}
    }
  },

  created () {
    this.init()
  },

  computed: {

  },

  methods: {
    async init () {
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getJZBDetail'
        })
        if (Number(res.code) === 0) {
          this.JXBDetail = res.data
        }        
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    removeBinding () {
      this.modal = true
    },

    async onRemoveBinding () {
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionPost', {
          name: 'removeBankBingding'
        })       
      } catch (error) {
        console.log(error)
      }
      this.loading = false
      if (Number(res.code) === 0) {
        this.$Message.success('解除绑定成功')
      } else {
        this.$Message.error(res.msg)
      }
    }
  },

}
</script>
