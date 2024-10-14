<template>
  <div class="secondStep">
    <div class="content">
      <div>为确保交易资金安全，平安银行已经往您提交的对公账户 <span class="primaryColor">{{bankInfo.bankName}}
          （{{bankInfo.bankAccount | getEndFour}}）</span> 打入一笔随机数目的确认金额请查询银行收支明细后正确填写进行验证！</div>

      <format-input
        reg="PRECISION"
        v-model="formData.amount"
        class="form_input"
        placeholder="输入银行卡收到的金额"
        @:keyup.enter="submit"
      >
      </format-input>
      <format-input
        reg="PRECISION"
        v-model="formData.orderNo"
        class="form_input"
        placeholder="输入指令号"
        @:keyup.enter="submit"
      >
      </format-input>
      <div style="margin-bottom:20px;">
        <i-button
          type="primary"
          @click="submit"
        >验证</i-button>
      </div>
      <div @click="$router.push('/account/balance')" class="noVertification">
        暂不验证
      </div>

    </div>
  </div>
</template>

<script>
import '@/styles/components/form.less'
import '@/styles/views/account/bindingCard/index.less'
import { mapGetters } from 'vuex'
import { storage } from '@/assets/js/utils.js'

export default {
  components: {},
  filters: {
    getEndFour: function (str) {
      str = str.toString()
      str = str.substring(str.length - 4, str.length)
      return str
    }
  },

  props: {
    bankInfo: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  data () {
    return {
      formData: {
        amount: '',
        orderNo:''
      },
      rules: {
        code: [{ required: true, message: '请输入验证码', trigger: 'blur' }]
      }
    }
  },

  created () {},

  computed: {},

  methods: {
    async submit () {
        if(!this.formData.amount){
            this.$Message.error('金额不能为空')
            return
        }
        if(!this.formData.orderNo){
            this.$Message.error('指令号不能为空')
            return
        }
        try {
          const res = await this.$store.dispatch('actionPost', {
            name: 'checkAmount',
            params: this.formData,
            host: 'jjb_host'
          })
          if (Number(res.code) === 0) {
            this.$Message.success('绑定成功')
            this.$emit('bindOk')
          } else {
            this.$Message.error(res.msg)
          }
        } catch (error) {
          console.log(error)
        }
    },

    cancel () {
      this.$emit('on-cancel')
    }
  }
}
</script>
