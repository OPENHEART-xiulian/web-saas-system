<template>
  <!-- 提现 -->
  <div class="withdraw">
    <saas-bread title="提现"></saas-bread>
    <div class="withdraw_body">
      <Alert class="w-alert"
        type="warning" show-icon>
        <template slot="desc">
          <span>为确保交易资金安全，请绑定与营业执照登记公司名称一致的对公账户，不支持绑定个人银行账户</span>
        </template>
      </Alert>
      <Form ref="form" 
        class="form"
        :model="formData" 
        :rules="rules"
        :label-width="125">
        <FormItem label="出款账户">
          <div class="flex form_input">
            <p>{{JXBDetail.bankUserName}}</p>
            <p>余额：{{JXBDetail.walletWithdrawBalance.toFixed(2)}}元</p>
          </div>
          
        </FormItem>
        <FormItem label="收款账户">
          <div class="form_input flex  accept_account">
            <p>{{JXBDetail.bankName}}</p>
            <p>{{JXBDetail.bankAccount | hideBank}}</p>
          </div>
        </FormItem>
        <FormItem label="转出金额" prop="amount">
          <div class="out_row">
            <format-input reg="PRECISION" @on-blur="onBlur" prelen="2"  v-model="formData.amount" :max="JXBDetail.walletWithdrawBalance" class="form_input" >
              <span slot="append">元</span>
            </format-input>
            
            <span class="out_all" @click="outAll">全部转出</span>
          </div>
          <p class="font1">支持小数点后两位，本次转出限额为2000万元</p>
        </FormItem>
        <template>
          <FormItem label="确认转出金额">
            <p class="money_row">
              <span>{{formData.amount}}</span>元
            </p>
          </FormItem>
          <FormItem label="转出手续费">
            <p class="money_row">
              <span>{{serviceCharge.toFixed(2)}}</span>元
              <Poptip placement="right" trigger="click"  width="400" word-wrap>
                <i class="iconfont icon-wenhao"></i>
                <div slot="content">
                  <div class="tipsModal" slot="content">
                    <div class="title">收费标准</div>
                    <ul class="content">
                      <li>银联卡：2元/笔；</li>
                      <li>非银联卡：5万元（含）以下 3元/笔，5万元以  上 5.5元/笔；</li>
                    </ul>
                  </div>
                </div>
              </Poptip>
            </p>
          </FormItem>
          <FormItem label="转出到账金额">
            <p class="money_row">
              <span>{{arrivalAmount.toFixed(2)}}</span>元
            </p>
          </FormItem>
        </template>  

        <FormItem label="操作备注">
          <textarea name="" id="" cols="10" rows="3" v-model="formData.remark" class="form_input"></textarea>
        </FormItem>

        <FormItem label="" >
          <i-button type="primary" @click="withdraw" :loading="codeLoading" :disabled="codeLoading">提现</i-button>
          <i-button style="margin-left:20px;background:#fff" @click="$router.go(-1)">取消</i-button>
        </FormItem>
      </Form>
    </div>
    
    <!-- 收费标准 -->
    <!-- <self-dialog :showModal="showModal" :showClose="false" width="310">
      <div class="tipsModal" slot="content">
        <div class="title">收费标准</div>
        <ul class="content">
          <li>银联卡：2元/笔；</li>
          <li>非银联卡：5万元（含）以下 3元/笔，5万元以  上 5.5元/笔；</li>
        </ul>   
        <div class="footer">
          <i-button type="primary" @click="showModal=false">知道了</i-button>
        </div>
      </div>
    </self-dialog> -->

    <!-- 提现弹窗 -->
    <self-dialog :showModal="passwordModal" :showClose="false" width="360">
      <div class="withdrawModal" slot="content">
        <i 
          class="close_icon iconfont icon-close"
          @click="passwordModal=false"></i>
        <p class="title">提现确认</p> 
        <p class="content">
          确定从账户转出  <span class="primaryColor">{{Number(formData.amount).toFixed(2)}}</span>  元至银行卡？
        </p>
        <div class="footer">
          <format-input reg="NUMBER" :type="passwordType" autocomplete="new-password"  v-model="certifiCode" placeholder="请输入手机验证码" class="form_input" :maxlength="6">
          </format-input>
          <i-button type="error" @click="reuqireWithdraw" :loading="withdrawLoading" :disabled="withdrawLoading">确定</i-button>
        </div>
      </div>
    </self-dialog>
    <Spin
      fix
      v-if="loading"
    ></Spin>
  </div>

</template>

<script>
import selfDialog from '@/components/dialog/self-dialog'
import '@/styles/components/form.less';
import '@/styles/views/account/withdraw.less'
import { mapGetters } from 'vuex';

export default {
  components: { selfDialog },

  filters: {
    hideBank (bankAccount) {
      if (!bankAccount) return ''
      const reg = /^(\d{4})\d+(\d{4})$/
      return bankAccount.replace(reg, ($0, $1, $2) =>  $1 + '****' + $2)
    }
  },
  data () {
    const phoneValidator =  (rule, value, callback) => {
        if (value === '' || !this.verify('PHONE_NUMBER', value)) {
            callback(new Error());
        } else {
            callback();
        }
    };
    let userInfo = this.$storage.get("USER");
    return {
      userInfo,
      formData: {
        isUnionpay: userInfo.isRoot ? "1" : "0", // String类型 '0'. 银联卡 '1'.非银联卡
        amount: 0,
        password: '',
        remark: ''
      },
      passwordType: 'number',
      showModal: false,
      rules: {
        amount: [
          { required: true, message: '请输入转账金额', trigger: 'blur', 
            validator: (rules, value, callback) => {
              if (value) {
                callback()
              } else {
                callback(new Error('请输入转账金额'))
              }
            } 
          }
        ]
      },
      JXBDetail: {
        walletWithdrawBalance: 50001
      },
      arrivalAmount: 0,
      serviceCharge: 0,
      passwordModal: false,
      loading: false,
      withdrawLoading: false,
      codeLoading: false,
      messageOrderNo: '',
      certifiCode: ''
    }
  },

  created () {
    this.init();
  },

  watch: {

  },

  methods: {
    async init () {
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getJZBDetail',
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.JXBDetail = res.data
          // this.JXBDetail.walletWithdrawBalance = 100000;
        }       
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    onBlur (e) {
      this.computedMoney()
    },
    computedMoney ( ) {
      let isRoot = this.userInfo.isRoot;
      if (this.formData.amount > 0) {
        if (isRoot) {
          if (this.formData.amount > 50000) {
            this.serviceCharge = 5.5
          } else {
            this.serviceCharge = 3
          }
        } else {
          this.serviceCharge = 2;
        }
        let money = this.formData.amount - this.serviceCharge
        this.arrivalAmount = money > 0 ? money : 0;
      } else {
        this.serviceCharge = 0 
        this.arrivalAmount = 0
      }
    },

    outAll () {
      this.formData.amount = this.JXBDetail.walletWithdrawBalance
      this.computedMoney()
    },

    withdraw () {
      this.$refs.form.validate( valid => {
        if (valid) {
          this.getCode()
        } else {
        }
      })
    },

    async getCode () {
      this.codeLoading = true
      try {
        const res = await this.$store.dispatch('actionPost', {
          name: 'withdrawJZB',
          host: 'jjb_host',
          params: { amount: this.formData.amount, remark: this.formData.remark }
        })
        if (Number(res.code) === 0) {
          this.messageOrderNo = res.data.messageOrderNo
          this.$Message.success({
            content: '验证码发送成功',
            onClose: () => { this.passwordModal = true }
          })
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.codeLoading = false
    },

    async reuqireWithdraw () {
      this.withdrawLoading = true
      if (!this.certifiCode) {
        this.$Message.error('请输入验证码')
        return
      }
      const params = {
        code: this.certifiCode,
        messageOrderNo: this.messageOrderNo
      }
      const res = await this.$store.dispatch('actionPost', {
        name: 'checkJZBBalanceCode',
        params: params,
        host: 'jjb_host'
      })
      if (Number(res.code) === 0) {
        this.$Message.success({
          content: '提现成功',
          onClose: () => {
            this.$router.push('/account/balance')
          }
        })
      } else {
        this.$Message.error(res.msg)
      }
      this.withdrawLoading = false
    }
  },

}
</script>
