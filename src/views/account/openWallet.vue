<template>
  <div>
    <saas-bread :title="isRead?breadTitle:'修炼钱包开通'"></saas-bread>
    <div class="openWallet">
      <Alert
        class="w-alert "
        type="warning"
        show-icon
      >
        <template slot="desc">
          <span>{{desc}}</span>
        </template>
      </Alert>
      <Form
        ref="form"
        class="form"
        :model="formData"
        :rules="rules"
        :label-width="110"
        style="width:600px;margin:0 auto;"
      >
        <FormItem
          label="企业名称"
          prop="companyName"
        >
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
            <i-input v-model="formData.identityNo"></i-input>
          </div>
          <div v-else>
            {{formData.identityNo}}
          </div>
        </FormItem>
        <FormItem label="商户类型" prop="merchantType">
          <div v-if="!isRead">
            <i-select v-model="formData.merchantType">
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
        <FormItem
          label="手机号"
          v-if="isSave"
        >
          <div v-if="!isRead">
            <format-input
              maxlength="11"
              reg="PRECISION"
              v-model="mobile"
              class="form_input"
              :disabled="true"
            >
            </format-input>
          </div>
          <div v-else>
            {{formData.mobile}}
          </div>
        </FormItem>
        <FormItem
          label="验证码"
          prop="smsCode"
          v-if="isSave"
        >
          <format-input
            maxlength="11"
            reg="PRECISION"
            v-model="formData.smsCode"
          >
          </format-input>
        </FormItem>
        <FormItem label="" v-if="!isRead && isSave" prop="isCheck">
          <div class="flex">
            <div class="protocol_radio">
              <i-radio v-model="formData.isCheck"></i-radio>
              <div class="protocol_radio_box" @click="readTips"></div>
            </div>
            <p class="agree">已阅读并同意<span class="PINGA_protocol_btn" @click="openProtocol">平安银行见证宝与商户协议、平安银行数字口袋协议</span></p>
          </div>
        </FormItem>
        <FormItem label="" v-if="!isRead" class="tool_list">
          <i-button
            @click="leftFn"
            size="large"
          >{{isSave?"修改":"保存"}}</i-button>
          <i-button
            type="primary"
            style="margin-left:20px;"
            size="large"
            @click="rightFn"
          >提交</i-button>
        </FormItem>
      </Form>
    </div>
    <Modal v-model="modal" 
      :closable="false"
      width="500">
      <iframe style="width:100%;height:68vh;" src="https://my.orangebank.com.cn/orgLogin/hd/act/jianzb/jzbxy.html" frameborder="0"></iframe>
      <div slot="footer">
        <Button type="text"  @click.native.stop="modal=false">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import '@/styles/components/form.less'
import '@/styles/views/account/bindingCard/index.less'
import { mapGetters } from 'vuex'
import { verify, formVerify } from '@/assets/js/utils.js'
import { bankCardAttribution } from "@/commons/bank_ka.js";
import { storage } from '@/assets/js/utils.js'
import { getLabel, businessType } from '@/store/json/default.js';
export default {
  components: {},
  data () {
    const that = this
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
    const checkValidator = (rule, value, callback) => {
      if (!value) {
        callback(new Error())
      } else {
        callback()
      }
    }
    const certifCodeValidator = (rule, value, callback) => {
      console.log(value,that.certifCode)
      if (!value || value != that.certifCode) {
        callback(new Error())
      } else {
        callback()
      }
    }

    return {
      businessType,
      modal:false,
      formData: {
        identityNo: storage.get('STORE').socialCode || "",
        isCheck: false,
        merchantType:'2'
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
        corporationMobile: [
          {
            required: true,
            trigger: 'blur',
            reg: 'MOBILE',
            message: '请输入正确的手机号码', 
            formatTip: '请输入正确的手机号码', 
            validator: formVerify.format,
          }
        ],
        isCheck: [
          { required: true, message: '请勾选平安银行用户服务协议、用户隐私政策再提交', trigger: 'change', validator: checkValidator }
        ],
        smsCode: [
          { required: true, message: '验证码错误', trigger: 'blur', validator: certifCodeValidator }
        ]
      },
      isRead: false, //是否是查看
      protocolClicked: false, //是否点击协议
      certifCode: 123, //验证码
      isSave: false, //是否保存
      mobile:'', //手机号,
      breadTitle:'认证信息查看',
      desc:'',

    }
  },

  created () {
  },
  mounted() {
    this.getDetail()
    if(this.$route.query.watchInfo == '1'){
         this.desc = '当前认证信息不提供变更功能，如企业信息已发生变更请与客户联系再做变更处理'
        this.isRead = true
    }else{
        this.desc = '根据政策要求，开通修炼钱包需完善以下信息，请如实填写。 /  根据政策要求，如需继续使用修炼钱包需完善以下资料，请如实填写。'
    }
  },


  methods: {
    verify,
    getLabel,
    leftFn(){
      if(!this.isSave){
        this.onOk()
      }else{
        this.isSave = !this.isSave
        this.formData.smsCode = ''
      }
    },
    rightFn(){
      if(!this.isSave){
       this.$Message.error('请先保存再提交')
      }else{
        this.isSave = !this.isSave
      }
    },
    readTips(){
      if(!this.protocolClicked){
        this.$Message.warning("请先查看平安银行用户服务协议、用户隐私政策再选择同意")
      }else{
        this.formData.isCheck = true
        this.contractJZB()
      }
    },
    openProtocol(){
      this.modal = true
      this.protocolClicked = true
    },
    getCertifCode(){
      this.$refs.form.validateField('bankUserMobile',(valid)=>{
        if(valid !== "请输入正确的手机号码" && this.certifText === "获取验证码"){
          this.getCodeFn()
        }
      })
    },
    async getCodeFn(){
      try {
        const res = await this.$store.dispatch('actionPost', {
          name: 'addBankBingding',
          params: this.formData,
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          let seconds = 60
          this.codeTimer = setInterval(()=>{
            if(seconds === 0){
              clearInterval(this.codeTimer)
              this.codeTimer = null
              this.certifText = "获取验证码"
              return
            }
            seconds -- ;
            this.certifText = seconds;
          },1000)
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    onOk () {
      this.$refs.form.validate(valid => {
        if (valid) {
          if(!this.isSave){
            this.save1()
          }else{
            this.save2()
          }
        } else {
          this.$Message.warning('请填写完整信息再提交')
        }
      })
    },
    async save1(){
      try {
        const res = await this.$store.dispatch('actionPost', {
          name: 'setJZBAuthInfo',
          params: this.formData,
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.mobile = res.data.mobile
          this.$Message.success('验证码已发送!')
          this.isSave = true
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async save2(){
      try {
        const res = await this.$store.dispatch('actionPost', {
          name: 'postJZBVerifyCode',
          params: { smsCode: this.formData.smsCode },
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.$Message.success('提交成功!')
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },
    async contractJZB(){
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'contractJZBAuthInfo',
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
         
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    },

    cancel () {
      this.$router.go(-1);
    },

    async getDetail(){
      try {
        const res = await this.$store.dispatch('actionGet', {
          name: 'getJZBAuthInfo',
          host: 'jjb_host'
        })
        if (Number(res.code) === 0) {
          this.formData = Object.assign({}, this.formData, res.data)
        } else {
          this.$Message.error(res.msg)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
}
</script>

<style lang="less" scoped>
.openWallet{
  background: #fff;
  padding: 40px 20px;

  .w-alert{
    width: 600px;
    margin: 0 auto;
    font-size: 12px;
    font-family: PingFangSC, PingFangSC-Regular;
    font-weight: 400;
    text-align: left;
    color: #332e29;
    margin-bottom: 24px;
  }

  .agree{
    font-size:12px;
  }

  /deep/ .ivu-input-group-append{
    background: none;
  }
  .code_input{
    /deep/ .ivu-input{
      border-right: none;
    }
  }

  .tool_list{
    button{
      width: 140px;
    }
  }
}
.PINGA_protocol_btn{
  color:#ff9900;
  cursor: pointer;
}
.protocol_radio{
  position: relative;

  &_box{
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 2;
    top: 0;
    left: 0;
    cursor: pointer;
  }
}
</style>
