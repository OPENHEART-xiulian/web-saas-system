<template>
  <!-- 账户总览 -->
  <div class="accountBalance">
    <div class="balancePart">
      <div class="balance_top">
        <div class="balance_top_list">
          <div class="balance_top_list_top">
            <div class="title">
              账户总览
            </div>
          </div>
          <div class="balance_top_list_bottom">
            <p class="money_title">营业收入              
              <span style="cursor:pointer;color:#ccc;" @click="canWatchMoneyB = !canWatchMoneyB">
                <i v-if="canWatchMoneyB" class="iconfont icon-eye"></i>
                <i v-else class="iconfont icon-eye-hide"></i>
              </span>
            </p>
            <p class="money">{{canWatchMoneyB?JXBDetail.incomeBalance?JXBDetail.incomeBalance.toFixed(2):'0.00':'****'}}</p>
            <div
              @click="intoWallet"
              :disabled="JXBDetail.incomeBalance>0?false:true"
              class="intoWalletBtn cursorP"
    
            >转入钱包</div>
          </div>
        </div>

        <div class="balance_top_list">
          <div class="balance_top_list_top">
            <div class="title">
              修炼钱包
            </div>
          </div>

          <div class="notOpenWallet flex" v-if="walletStatus === 1003">
            未开通修炼钱包
            <!-- $router.push('/account/openWallet') -->
            <i-button type="primary" size="large" @click="showProtocolModal=!showProtocolModal">立即开通</i-button>
          </div>
          
          <div class="balance_top_list_bottom flex" v-else>
            <div class="flex1">
              <p class="money_title">账户余额              
                <span style="cursor:pointer;color:#ccc;" @click="canWatchMoneyM = !canWatchMoneyM">
                  <i v-if="canWatchMoneyM" class="iconfont icon-eye"></i>
                  <i v-else class="iconfont icon-eye-hide"></i>
                </span>
              </p>
              <p class="money">{{canWatchMoneyM?JXBDetail.walletWithdrawBalance?JXBDetail.walletWithdrawBalance.toFixed(2):'0.00':'****'}}</p>
              <i-button
                class="withdrawBtn"
                @click="withdraw"
                :disabled="JXBDetail.walletWithdrawBalance===0?true:false"
                :type="JXBDetail.walletWithdrawBalance>0?'primary':'default'"
              >提现</i-button>
            </div>  
            <div class="right flex flex1">
              <div>
                <div class="item_head flex">
                  <span>银行卡</span>
                  <span v-if="!JXBDetail.isVerifiedBankUserMobile"  class="primaryColor cursorP" @click="goBindingCard">绑卡</span>
                  <span v-else class="primaryColor cursorP" @click="unbundleCard">解绑</span>
                </div>
                <div class="item_footer">
                  {{JXBDetail.bankName || "--"}}
                  {{JXBDetail.bankAccount | getEndFour}}
                </div>
              </div>
              <!-- 暂时隐藏 -->
              <div>
                <div class="item_head flex" v-if="walletStatus == 2">
                  <span>认证信息</span>
                  <!-- <span class="primaryColor cursorP" @click="goWallet('edit')" v-if="walletStatus == 1001">去完善</span> -->
                  <span class="bottomTextBtn" @click="goWallet('read')" >商户认证信息</span> 
                </div>
                <!-- <div class="item_footer"  v-if="walletStatus == 1">
                  审核中
                </div>
                <div class="item_footer redColor cursorP" @click="errorTipsFn" v-if="walletStatus == 3" >
                  审核失败
                </div> -->
              </div>
            </div>

          </div>
        </div>

        <!-- <div class="balance_top_list flex">
          <div class="balance_top_list_item">
            <div class="balance_top_list_top">
              <div class="title">
                修炼钱包
              </div>
              <p class="font1">
                ¥ <span>{{canWatchMoneyM?JXBDetail.walletWithdrawBalance?JXBDetail.walletWithdrawBalance.toFixed(2):'0.00':'****'}}</span>
                <span style="cursor:pointer;" @click="canWatchMoneyM =! canWatchMoneyM">
                  <i v-if="canWatchMoneyM" class="iconfont icon-eye"></i>
                  <i v-else class="iconfont icon-eye-hide"></i>
                </span>
              </p>
            </div>
            <div class="balance_top_list_bottom">
              <i-button
                @click="withdraw"
                :disabled="JXBDetail.walletWithdrawBalance===0?true:false"
                :type="JXBDetail.walletWithdrawBalance>0?'primary':'default'"
              >提现</i-button>
            </div>
          </div>
          <div class="balance_top_list_item">
            <div class="balance_top_list_top">
              <div class="title">
                银行卡
                <span v-if="!JXBDetail.isVerifiedBankUserMobile" class="binding" @click="goBindingCard">绑卡</span>
                <span v-else class="binding" @click="unbundleCard">解绑</span>
              </div>
              <p class="font2" v-if="JXBDetail.isVerifiedBankUserMobile">
                {{JXBDetail.bankName}}
                ({{JXBDetail.bankAccount | getEndFour}})
              </p>
              <p class="font2" v-else >****</p>
            </div>
            <div class="balance_top_list_bottom">
              <span class="bottomTextBtn" @click="goWallet('read')">商户认证信息</span>
              <span class="bottomTextBtn" @click="goWallet('edit')">认证信息完善</span>
            </div>
          </div>
        </div> -->
      </div>
    </div>
    <div class="balance_detail">
      <div class="title">
        收支明细
      </div>
      <div>
        <w-table
          ref="table"
          :tableData="tableData"
          :columns="columns"
          :params="params"
          @format-form="formatForm"
        >
        </w-table>
      </div>
    </div>
    <!-- 一进来判断是否设置支付密码 -->
    <self-dialog
      :showModal="showModal"
      :showClose=false
      width="300"
      @closeModal="showModal=false"
    >
      <div
        slot="content"
        class="passwordModal"
      >
        <img
          src="/images/finance_pic_popup.png"
          alt=""
        >
        <h4 class="font1">请先设置交易密码</h4>
        <p class="font2">为了您的资金安全，请先设置6位数字交易密码</p>
        <Form
          ref="form"
          class="form"
          :model="formData"
          :rules="rules"
          :label-width="25">
          <FormItem label="" prop="password">
            <format-input
              reg="PRECISION"
              :type="showPassword1?'':'password'"
              v-model="formData.password"
              class="form_input"
              maxlength="6"
              placeholder="设置密码">
              <span slot="append" style="cursor:pointer;font-size:14px;" @click="showPassword1=!showPassword1">
                <i v-if="showPassword1" class="iconfont icon-eye"></i>
                <i v-else class="iconfont icon-eye-hide"></i>
              </span>
            </format-input>
          </FormItem>
          <FormItem label="" prop="passwordAgain">
            <format-input
              reg="PRECISION"
              :type="showPassword2?'':'password'"
              v-model="formData.passwordAgain"
              class="form_input"
              maxlength="6"
              placeholder="再次确认密码">
              <span slot="append" style="cursor:pointer;font-size:14px;" @click="showPassword2=!showPassword2">
                <i v-if="showPassword2" class="iconfont icon-eye"></i>
                <i v-else class="iconfont icon-eye-hide"></i>
              </span>
            </format-input>
          </FormItem>
        </Form>
        <i-button
          type="primary"
          @click="setPassword"
          :loading="setPasswordLoading"
        >立即设置</i-button>
        <p style="margin:10px;"></p>
        <p
          @click="showModal=!showModal"  
          class="noSetting"
        >暂不设置</p>
      </div>
    </self-dialog>
    <!-- 提示去绑卡弹窗 -->
    <self-modal
      v-model="bindingAlert"
      okText="去绑卡"
      content="为保障资金安全，转入钱包需要绑定银行卡"
      @on-ok="$router.push('/account/bindingCard')"
    >
    </self-modal>
    <!-- 钱包信息未完善 -->
    <self-modal
      v-model="lackWalletInfoModal"
      title="提示"
      okText="去认证"
      cancelText="暂不处理"
      :content="errorTips"
      @on-ok="$router.push('/account/oepnWallet')"
    >
    </self-modal>
    <!-- 转入钱包验证码提示弹窗 -->
    <self-dialog
      :showModal="showCodeModal"
      :showClose="false"
      width="360"
    >
      <div
        slot="content"
        class="showCodeModal"
      >
        <i class="close_icon iconfont icon-close" @click="showCodeModal=false"></i>
        <h4 class="title">转入修炼钱包</h4>
        <p class="font1">确定将营业收入 <span class="primaryColor">{{JXBDetail.incomeBalance.toFixed(2)}}</span> 元转入至修炼钱包？</p>
        <p
          class="font1"
          v-if="JXBDetail.bankUserMobile"
        >接收验证码手机号:{{JXBDetail.bankUserMobile | hidePhone}}请获取验证码并输入</p>
        <div class="codeRow">
          <format-input
            reg="PRECISION"
            v-model="certifiCode"
            class="form_input"
            placeholder="输入验证码"
          >
          </format-input>
          <i-button
            @click="getCode"
            :disabled="!codeObj.canClick"
          >{{codeObj.canClick?codeObj.codeText:codeObj.codeText+'s'}}</i-button>
        </div> 
        <i-button
          type="primary"
          @click="requireCode"
          style="width:100%;height:40px;"
        >确定转入</i-button>
      </div>
    </self-dialog>

    <remind-dialog ref="unbundleDialog" title="解绑银行账户" content="解绑后，XXX的账户余额将无法正常提现，确定解绑吗？" @on-ok="confirmUnbundleDialog"></remind-dialog>
    <Modal v-model="compleUsermodal" 
      class="compleUsermodal"
      :closable="false"
      width="500"
      cancel-text="取消"
      ok-text="确定">
      <p class="title">
        <i class="iconfont icon-gantan primaryColor"></i>提示
      </p>
      <p class="content">当前商户认证信息缺失，请先完善商户商户资料再使用修炼钱包</p>
      <div slot="footer">
        <Button type="default" size="large" @click.native.stop="compleUsermodal=false">暂不处理</Button>
        <Button  
          type="primary" 
          size="large"
          @click.native.stop="$router.push('/account/openWallet')"
          :loading="loading">去认证
        </Button>
      </div>
    </Modal>

    <!-- 同意协议 -->
    <Modal
        class="protocolModal"
        title="修炼钱包开通协议"
        v-model="showProtocolModal"
        :closable="true"
        width="580"
    >
        <div class="protocol-text">
            您再点击同意协议前，应当认证阅读以下协议： 
            <div  class="text-item">
                <p @click="handleProtocol(1)">《平安银行见证宝与商户协议》</p> 
                <p @click="handleProtocol(2)">《平安银行数字口袋协议》</p> 
            </div> 
            <span class="details"> 请务必审慎阅读、充分理解协议中的相关条款内容，</span> 如在阅读过程中对相关协议或其中条款存在异议，请立刻停止开通。
        </div>
        <div slot="footer" style="textAlign:center;" >
            <Button :loading="loading" class="protocol-btn" type="primary" @click="handleAgreed" >同意协议</Button>
        </div>
   
    </Modal>

    <Spin
      fix
      v-if="loading"
    ></Spin>
  </div>
</template>

<script>
import '@/styles/views/account/balance.less'
import { mapGetters } from 'vuex'
import selfDialog from '@/components/dialog/self-dialog'
import selfModal from '@/components/dialog/self-modal'
import RemindDialog from "@/components/dialog/remind-dialog"
import { storage } from '@/assets/js/utils.js'

export default {
  components: { selfDialog, selfModal, RemindDialog },

  filters: {
    hidePhone (tel) {
      if (tel.length === 11) {
        const reg = /(\d{3})\d{4}(\d{4})/
        return tel.replace(reg, ($0, $1, $2) => {
          return $1 + '****' + $2
        })
      } else {
        return '123'
      }
    },
    getEndFour: function (str) {
      if(!str) return 
      str = str.toString()
      str = str.substring(str.length - 4, str.length)
      return str
    }
  },
  data () {
    const passwordValidator = (rule, value, callback) => {
      if (value === '' || value !== this.formData.password) {
        callback(new Error())
      } else {
        if (this.formData.password === '') {
          callback(new Error())
        }
        callback()
      }
    }
    const columns = [
      {
        title: '序号',
        type: 'index',
        width: 50
      },
      {
        title: '交易编号',
        key: 'no'
      },
      {
        title: '交易时间',
        key: 'created'
      },
      {
        title: '收支类型',
        key: 'type',
        sortable: 'custome'
      },
      {
        title: '交易类型',
        key: 'businessType',
        sortable: 'custome'
      },
      {
        title: '交易渠道',
        key: 'businessMethod',
        sortable: 'custome'
      },
      {
        title: '交易渠道流水号',
        key: 'outNo',
        render: (h, { row }) => {
          return h('div', row.outNo || '----')
        }
      },
      {
        title: '金额',
        key: 'money',
        render: (h, { row }) => {
          return h('div', row.money.toFixed(2))
        }
      },
      {
        title: '余额',
        key: 'balance',
        render: (h, { row }) => {
          return h('div', row.balance.toFixed(2))
        }
      }
    ]
    const codeObjInit = {
      canClick: true,
      interval: null,
      codeText: '获取验证码'
    }
    return {
      codeObjInit,
      columns,
      showProtocolModal:false,
      compleUsermodal: false,
      canWatchMoneyB: true,
      canWatchMoneyM: true,
      params: {},
      formData: {},
      rules: {
        password: [
          {
            required: true,
            message: '请输入正确的密码',
            trigger: 'blur',
            len: 6
          }
        ],
        passwordAgain: [
          {
            required: true,
            message: '请输入相同密码',
            trigger: 'blur',
            validator: passwordValidator
          }
        ]
      },
      setPasswordLoading: false,
      loading: false,
      JXBDetail: {
        incomeBalance: 0
      },
      bindingAlert: false,
      showCodeModal: false,
      codeSeconds: 60,
      codeObj: JSON.parse(JSON.stringify(codeObjInit)),
      messageOrderNo: '',
      certifiCode: '',
      intoWLoding: false,
      showModal: false,
      showPassword1: false,
      showPassword2: false,
      tableData: [],
      walletStatus: 0,
      errorTips:'认证失败',
      lackWalletInfoModal:false
    }
  },

  created () {
    this.init()
  },

  computed: {
    ...mapGetters({
      userData: 'getUser'
    })
  },

  methods: {
    errorTipsFn(){

    },
    goWallet(opera){
      if(opera === "edit"){
        this.$router.push('/account/openWallet')
      }else{
        this.$router.push('/account/openWallet?watchInfo=1')
      }
    },
    async init () {
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getJZBDetail',
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.JXBDetail = Object.assign({}, this.JXBDetail, res.data)
          this.showModal = res.data.needSetJianzhengbaoPayPassword
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
      this.checkWallet()
    },

    //查看协议
    handleProtocol(value){
        let href=''
        if(value === 1){
            href = 'https://my.orangebank.com.cn/orgLogin/hd/act/jianzb/jzbxy.html'
        }else if(value === 2){
            href = 'https://auth.orangebank.com.cn/#/m/cDealOne'
        }
        window.open(href,'_blank')
    },

    //同意协议按钮
    async handleAgreed(){
        this.loading = true
        try{
            const res = await this.$store.dispatch('actionPost', {
                name: 'accountOpen',
                host: 'jjb_host'
            })
            if (Number(res.code) === 0) {
                  this.showProtocolModal =false
                  //状态更新
                  this.checkWallet()
                  this.$Message.success('已同意协议')
            }else{
                this.$Message.error(res.msg)
            }
            console.log('同意协议按钮',res);

        }catch (error) {
            console.log(error)
        }
        this.loading = false
    },

    async checkWallet(){
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getJZBCheckWallet',
          host: 'jjb_host'
        })
        /**
         *  1001 开通了钱包，没有提交企业信息认证
         *  1003 未开通钱包
         *  1 认证中
         *  2 认证通过
         *  3 开通钱包认证失败
         */
        if (Number(res.code) === 0) {
            this.walletStatus = res.data.status
            //this.walletStatus = 2
            this.errorTips = res.data.tips || "认证失败"
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },
    setPassword () {
      this.$refs.form.validate(async valid => {
        if (valid) {
          const params = {
            password1: this.formData.password,
            password2: this.formData.passwordAgain
          }
          this.setPasswordLoading = true
          try {
            const res = await this.$store.dispatch('actionPost', {
              name: 'setJZBPassword',
              params: params,
              host: 'jjb_host'
            })
            if (Number(res.code) === 0) {
              this.showModal = false
              this.$Message.success('设置密码成功')
            } else {
              this.$Message.error(res.msg)
            }
          } catch (error) {
            console.log(error)
          }
          this.setPasswordLoading = false
        }
      })
    },

    async getCode () {
      this.intoWLoding = true
      try {
        const migrateRes = await this.$store.dispatch('actionPost', {
          name: 'migrate',
          host: 'jjb_host'
        })
        if (Number(migrateRes.code) === 0) {
          this.messageOrderNo = migrateRes.data.messageOrderNo
          let codeObj = this.codeObj
          codeObj.codeText = this.codeSeconds
          codeObj.canClick = false
          codeObj.interval = setInterval(() => {
            codeObj.codeText--
            if (codeObj.codeText === 0) {
              clearInterval(codeObj.interval)
              this.codeObj = JSON.parse(JSON.stringify(this.codeObjInit))
            }
          }, 1000)
        } else {
          this.$Message.error(migrateRes.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.intoWLoding = false
    },
    async requireCode () {
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
        this.$Message.success('验证成功')
        setTimeout(() => {
          this.$router.go(0)
        }, 600)
      } else {
        this.showCodeModal = false
        this.$Message.error(res.msg)
      }
    },

    formatForm (params) {
      this.params = params
      this.getTableData()
    },

    async getTableData () {
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'orderListJZB',
          params: this.params,
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.tableData = res.data.rows
          this.$store.commit('TO_GET_TABLE_DATA', res)
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    intoWallet () {
      if (this.JXBDetail.needSetJianzhengbaoPayPassword) {
        this.showModal = true
        return
      }
      if (this.JXBDetail.bankAccount) {
        this.showCodeModal = true
      } else {
        this.bindingAlert = true
      }
    },
    withdraw () {
      if (this.JXBDetail.needSetJianzhengbaoPayPassword) {
        this.showModal = true
        return
      }
      // 判断是否开通钱包
      // if(this.walletStatus == 1001){
      //   this.lackWalletInfoModal = true
      //   return
      // }
      if (this.JXBDetail.bankAccount) {
        this.$router.push('/account/withdraw')
      } else {
        this.bindingAlert = true
      }
    },

    goBindingCard () {
      if (this.JXBDetail.bankAccount) {
        this.$store.commit('TO_GET_BANKINFODATA', { data: this.JXBDetail })
        this.$router.push('/account/bindingCard?current=1')
      } else {
        this.$router.push('/account/bindingCard?current=0')
      }
    },

    unbundleCard () {
      this.$refs.unbundleDialog.openModal();
    },

    async confirmUnbundleDialog () {
      try {
        let res = await this.$store.dispatch({
          type: "actionPost",
          name: "removeBankBingding",
          params: {}
        });
        this.$refs.unbundleDialog.onCancel();
        this.init();
      } catch (error) {
        this.$Message.error("解绑失败");
        console.error(error);
      }
    }
  }
}
</script>

<style lang="less" scoped>
  .compleUsermodal{
    .title{
      color: #332e29;
      font-size:14px;
      .iconfont{
        margin-right: 10px;
      }
    }
    .content{
      font-size: 14px;
      font-family: PingFangSC, PingFangSC-Regular;
      font-weight: 400;
      text-align: left;
      color: #807d7c;
      padding-left: 26px;
    }
    button{
      width:120px;
    }
  }

  .protocolModal{
    .protocol-text{
        font-weight: 400;
        color: #332E29;
        line-height: 20px;
        font-size: 14px;
        .text-item{
            padding: 15px 0;
          p{
            color: #009dff;
            cursor: pointer;
          }
        }
        .details{
            color: red;
        }
    }
    .protocol-btn{
        width: 120px;
        height: 40px;
    }
  
    /deep/ .ivu-modal-header{
        background: #FCFBFA;
        border-bottom: none !important;
      
  }

  }
</style>
