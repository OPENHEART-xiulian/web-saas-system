<template>
  <div class="firstStep">
    <Alert
      class="w-alert"
      type="warning"
      show-icon>
      <template slot="desc">
        <span>为保证资金安全，请绑定与营业执照登记公司名称一致的对公账户，如无对公账户可选择个人银行账户</span>
      </template>
    </Alert>
    <Form
      ref="form"
      class="form"
      :model="formData"
      :rules="rules"
      :label-width="170">
      <FormItem
          label="企业名称"
          prop="companyName">
          <div v-if="!isRead">
            <i-input
              class="form_input"
              v-model="formData.companyName"
              :disabled="isRead"
            ></i-input>
          </div>
          <div v-else>
            {{formData.companyName}}
          </div>
        </FormItem>
        <FormItem label="证件类型">
          <span>统一社会信用代码</span>
        </FormItem>
        <FormItem label="证件号码" prop="identityNo">
          <div v-if="!isRead">
            <i-input v-model="formData.identityNo" class="form_input"></i-input>
          </div>
          <div v-else>
            {{formData.identityNo}}
          </div>
        </FormItem>
        <FormItem label="商户类型" prop="merchantType">
          <div v-if="!isRead">
            <i-select v-model="formData.merchantType" class="form_input" @on-change="merchantTypeChange" >
              <i-option v-for="(item,index) in businessType" :key="index" :value="item.value">
                {{item.label}}
              </i-option>
            </i-select>
          </div>
          <div v-else>
            {{getLabel(formData.merchantType,this.businessType)}}
          </div>
        </FormItem>
        <FormItem
          :label="formData.merchantType == 1 ? '姓名':'法人姓名'"
          prop="userName"
        >
          <div v-if="!isRead">
            <format-input
              v-model="formData.userName"
              class="form_input"
              :disabled="isRead"
            >
            </format-input>
          </div>
          <div v-else>
            {{formData.userName}}
          </div>
        </FormItem>
        <FormItem
          :label="formData.merchantType == 1 ? '身份证号':'法人身份证号'"
          prop="idCardNo"
        >
          <div v-if="!isRead">
            <format-input
              v-model="formData.idCardNo"
              class="form_input"
            >
            </format-input>
          </div>
          <div v-else>
            {{formData.idCardNo}}
          </div>
        </FormItem>



      <FormItem label="账户类型">
        <i-select v-model="formData.merchantType" class="form_input" clearable @on-change="selectChange" >
          <i-option v-for="(item,index) in accountType" :key="index" :value="item.value">
            {{item.label}}
          </i-option>
        </i-select>
      </FormItem>
      <FormItem
        label="开户名称"
        prop="bankUserName"
      >
        <i-input
          class="form_input"
          v-model="formData.bankUserName"
        ></i-input>
        <span class="rightTips">对公账户名称需与营业执照登记公司名称一致，绑定后不支持修改</span>
      </FormItem>
      <FormItem
        label="银行账号"
        prop="bankAccount"
      >
        <format-input
          reg="PRECISION"
          class="form_input"
          v-model="formData.bankAccount"
          @on-change="bankAccountChange"
        >
        </format-input>
      </FormItem>
      <FormItem
        label="开户银行"
        prop="bankName"
      >
        <Select
          v-model="formData.bankName"
          @on-change="bankNameChange"
          class="form_input"
        >
          <Option
            v-for="(item, index) in bankList"
            :key="index"
            :value="item"
          >
            {{ item }}
          </Option>
        </Select>
      </FormItem>
      <FormItem
        v-if=" formData.bankName==='上海银行' || formData.bankName==='中国银行'"
        label="开户分行"
      >
        <Select
          class="form_input"
          v-model="branchBankName"
        >
          <Option
            v-for="(item, index) in branchBankList[formData.bankName]"
            :key="index"
            :value="item"
          >
            {{ item }}
          </Option>
        </Select>
      </FormItem>
      <FormItem
        label="手机号码"
        prop="bankUserMobile"
      >
        <format-input
          maxlength="11"
          reg="PRECISION"
          v-model="formData.bankUserMobile"
          class="form_input"
        >
        </format-input>
        <span class="rightTips">请填写您在银行预留的手机号码，以验证银行卡是否属于您本人</span>
      </FormItem>
      <FormItem label="">
        <i-button
          @click="cancel"
        >取消</i-button>
        <i-button
         style="margin-left:20px;"
          type="primary"
          @click="onOk"
        >确定</i-button>
     
      </FormItem>
    </Form>

    <Modal v-model="checkMobileModal" 
       class="checkMobileModal"
       :mask-closable="false"
      :closable="false"
      width="580"
      cancel-text="取消"
      ok-text="确定">
      <p class="title">
        <i class="iconfont icon-gantan primaryColor"></i>手机验证
      </p>
      <p class="content">请输入手机 <span>{{formData.bankUserMobile}}</span> 收到的验证码</p>
      <div class="code">
           <span class="code-text">验证码</span>
            <Input class="code-input" v-model="checkCode" :maxlength="6" ref="codeInput">
                <Button 
                    :class="{disabled: !this.canClick}" 
                    slot="append" 
                    type="primary"   
                    @click.native.stop="getCode">
                    {{content}}
                </Button>
            </Input>
      </div>
      <div slot="footer">
        <Button  class="btn" type="default" size="large" @click.native.stop="checkMobileModal=false">暂不处理</Button>
        <Button  
          class="btn"
          type="primary" 
          size="large"
          @click.native.stop="confirm"
          :loading="loading">确认
        </Button>
      </div>
    </Modal>
  </div>
</template>

<script>
/**
 * 开户名称：广东修炼科技股份有限公司
 * 开户银行：中国光大银行
 * 银行账号：38830188000039676
 * 统一社会信用代码：91440101MA59HWGA8P
 * 手机号码：13660770763
 */
import countDownMinix from "../../../mixins/countDownMinix"
import '@/styles/components/form.less'
import '@/styles/views/account/bindingCard/index.less'
import { mapGetters } from 'vuex'
import { verify, formVerify } from '@/assets/js/utils.js'
import { bankCardAttribution } from "@/commons/bank_ka.js";
import { getLabel, businessType, accountType } from '@/store/json/default.js';
export default {
   mixins:[countDownMinix],
  components: {},
  data () {
    const phoneValidator = (rule, value, callback) => {
      if (value === '' || !this.verify('PHONE_NUMBER', value)) {
        callback(new Error())
      } else {
        callback()
      }
    }
    const socialValidator = (rule, value, callback) => {
      if (value === '' || !this.verify('SOCIAL_CODE', value)) {
        callback(new Error())
      } else {
        callback()
      }
    }
    const idCardValidator = (rule, value, callback) => {
      if (value === '' || !this.verify('ID_CARD', value)) {
        callback(new Error())
      } else {
        callback()
      }
    }
    return {
      businessType,
      accountType,
      checkMobileModal:false,
      checkCode:'',
      formData: {
        bankUserName: '',
        bankAccount: '',
        bankName: '',
        bankUserMobile: '',
        eiconBankBranchId:'',
        bankAccountType: "对公账户",
        merchantType:'2' //1-个体工商户 2-企业
      },
      rules: {
        companyName: [
          { required: true, message: '请输入开户名称', trigger: 'blur' }
        ],
        userName: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ],
        merchantType: [
          { required: true, message: '请选择商户类型', trigger: 'change' }
        ],
        identityNo: [
          {
            required: true,
            message: '请输入正确的统一社会信用代码',
            trigger: 'blur',
            validator: socialValidator
          }
        ],
        idCardNo: [
          {
            required: true,
            message: '请输入正确的身份证号',
            trigger: 'blur',
            validator: idCardValidator
          }
        ],
        bankUserName: [
          { required: true, message: '请输入开户名称', trigger: 'blur' }
        ],
        bankAccount: [
          { required: true, message: '请输入银行账号', trigger: 'blur' }
        ],
        bankName: [{ required: true, message: '请选择银行', trigger: 'blur' }],
        bankUserMobile: [
          {
            required: true,
            trigger: 'blur',
            reg: 'MOBILE',
            message: '请输入正确的手机号码', 
            formatTip: '请输入正确的手机号码', 
            validator: formVerify.format,
          }
        ]
      },
      bankList: [],
      branchBankList: {},
      superBankNumber: '',
      branchBankName: '',
      isRead:false,
      codeDisabled:false, 
    }
  },

  created () {
    this.getSupportedBanks()
  },

  watch: {
    'formData.bankName' (value) {
      this.formData.eiconBankBranchId = ''
      switch (value) {
        case '平安银行':
          break;
        case '中国银行':
          break;
        case '上海银行':
          break;
        default:
          this.getSuperBankNumber(value);
      }
    },
    branchBankName (value) {
      this.getSuperBankNumber(value)  
    }
    
  },

  computed: {},

  methods: {
    verify,
    getLabel,
    bankAccountChange (e) {
      let value = e.target.value;
      if (value) {
        let bankInfo = bankCardAttribution(value);
        this.formData.bankName = bankInfo.bankName;
      }
    },
    //商户类型
    merchantTypeChange(value){
        this.formData.bankAccountType = value==1?'个人账户':'对公账户'
        setTimeout(() => {
          this.$forceUpdate()
      }, 1)

    },
    //账户类型
    selectChange(value){
        this.formData.bankAccountType = value==1?'个人账户':'对公账户'
        setTimeout(() => {
          this.$forceUpdate()
      }, 1)
    },

    bankNameChange (value) {
      this.formData.bankName = value
      if (value === '上海银行' || value === '中国银行') {
        this.branchBankName = this.branchBankList[value][0]
      }
      setTimeout(() => {
        this.$forceUpdate()
      }, 1)
    },
    async getSuperBankNumber (bankName) {
      this.loading = true
      const params = {
        bankName: bankName
      }
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getSuperBankNumber',
          params: params,
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.formData.eiconBankBranchId = res.data.superBankNumber
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    async getSupportedBanks () {
      this.loading = true
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getSupportedBanks',
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.bankList = res.data.banks
          this.branchBankList = res.data.branchBank
          this.formData.bankName = this.bankList[0]
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
      this.loading = false
    },

    onOk () {
        this.$refs.form.validate(async valid => {
            if (valid) {
              try {
                const res = await this.$store.dispatch('actionPost', {
                  name: 'setTiedCard',
                  params: this.formData,
                  host: 'jjb_host'
                })
                if (Number(res.code) === 0) {
                    this.$Message.success('成功')
                     //账户类型选择: 如果是对公账户直接走下一步，如果是对私账户，需要弹窗
                    if (this.formData.merchantType === '1') {
                    //显示弹窗
                     this.checkMobileModal = true
                      return
                    }
                    this.$emit('next')
                    this.$emit('bankInfo', {
                      bankAccount: this.formData.bankAccount,
                      bankName: this.formData.bankName
                    })
                } else {
                  this.$Message.error(res.msg)
                }
              } catch (error) {
                console.log(error)
              }
            } else {
              this.$Message.warning('请填写完整信息再提交')
            }
        })
    },
    //重新获取按钮
    getCode(){
        let _this = this
        this.$nextTick(() =>{
            _this.$refs.codeInput.focus();
            _this.countDown()
            //重新获取验证码
            this.onOk()
        })
    },
    //弹窗确定按钮
    async confirm(){
        if (!this.checkCode) {
            this.$Message.error('验证码不能加为空')
        }
        this.loading = true
        try {
            const res = await this.$store.dispatch('actionPost', {
              name: 'privateCode',
              host: 'jjb_host',
            params: {
                checkCode: this.checkCode
            },
            })
            if (Number(res.code) === 0) {
                this.$Message.success('成功')
                this.$router.push('/account/balance')
            } else {
              this.$Message.error(res.msg)
            }
        } catch (error) {
            console.log(error)
        }
          this.loading = false

    },

    cancel () {
      this.$emit('on-cancel')
    }
  }
}
</script>
<style lang="less" scoped>
    .checkMobileModal{
        .content{
            padding: 10px 0;
        }
        .code{
            padding-top: 10px;
            display: flex;
            .code-text{
                line-height: 35px;
            }
            .code-input{ 
                padding-left: 10px;
                width: 60% !important;
            }
            .disabled{
                color: #fff;
                background-color: #FF8000;
                border-color: #FF8000;
                cursor: not-allowed; // 鼠标变化
            }
         }
        .btn{
            width: 17%; 
        }
    }
    
/deep/ .ivu-input-group-append{
            color: #fff;
            background-color: #FF8000;
            border-color: #FF8000;

}
</style>
