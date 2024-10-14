<template>
  <!-- 绑卡 -->
  <div class="bindingCard">
    <saas-bread title="绑卡"></saas-bread>
    <div class="bindingCard_body">
      <div class="steps">
        <Steps :current="current">
            <Step :content="item" v-for="(item,index) in stepList" :key="index"></Step>
        </Steps>
      </div>
      <div class="bindingCard_steps">
        <first-step v-if="current===0" @on-cancel="onCancel" @next="nextStep" @bankInfo="setBankInfoData"></first-step>
        <second-step v-else @bindOk="bindOk" :bankInfo="bankInfoData"></second-step>
      </div>
    </div>
     <Modal
        v-model="unbindingModal"
        title="取消绑卡"
        :loading="loading"
        @on-ok="ok">
        <p>取消绑卡将无法正常提现，点击确定将清空已输入的账号信息，确定取消吗？</p>
    </Modal>
    <Spin 
      fix
      v-if="loading"
    ></Spin>
  </div>
</template>

<script>
import '@/styles/views/account/bindingCard/index.less'
import firstStep from './firstStep'
import secondStep from './secondStep'
import { mapGetters } from 'vuex';
import { storage } from '@/assets/js/utils.js';

export default {
  components: { firstStep, secondStep },
  data () {
    return {
      stepList: ['输入账户信息', '验证账户信息'],
      current: 0,
      loading: false,
      unbindingModal: false
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetUser',
      params: {
        userId: storage.get("USER").userId
      }
    })
    this.current = Number(this.$route.query.current) || 0
  },

  computed: {
    ...mapGetters({
      userData: 'getUser',
      bankInfoData: 'getBankInfoData'
    })
  },

  methods: {
    onCancel () {
      this.unbindingModal = true
    },
    ok () {
      this.$router.go(-1)
    },
    nextStep () {
      const that = this 
      setTimeout(() => {
        that.current++
      }, 500)
    },
    bindOk () {
      this.$router.push('/account/balance')
    },
    setBankInfoData (bankInfo) {
      this.$store.commit('TO_GET_BANKINFODATA', { data: bankInfo })
    }
  },

}
</script>
