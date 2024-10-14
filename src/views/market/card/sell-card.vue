<template>
  <div class="add-form add-page">
    <saas-bread :title="breadName">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <i-form ref="form" :model="formData" :rules="rules" label-position="top" :show-message="true">
      <div class="search-form header">
        <span>工单号：{{formData.statementNo}}</span>
        <i class="line"></i>
        <span>开单时间：{{formData.createdAt}}</span>
      </div>

      <h2 class="title">客户信息</h2>
      <customer-select class="search-form  customer-information" ref="customerSelect" @on-change="customerSelectChange" :multiple="true" :disabled="disabled">
        <template slot-scope="slotScope">
        <div class="form-box">
          <i-form-item class="form-item" prop="customerName" label="客户姓名">
            <i-input v-model="formData.customerName" disabled></i-input>
          </i-form-item>
          <i-form-item class="form-item" label="联系方式" prop="mobile">
            <i-input v-model="formData.mobile" :maxlength="11"></i-input>
          </i-form-item>
          <!-- <i-form-item class="form-item" label="车辆搜索">
            <Select placeholder="请选择" filterable class="filter-select">
              <Option 
                :class="{select: slotScope.selectList.indexOf(item.vehicleId) > -1}"
                class="filter-option"
                v-for="item in slotScope.filterList"
                :value="item.vehicleId" 
                :key="item.vehicleId"
                @click.native="slotScope.filterSelect(item)">{{ item.plateNo }}</Option>
            </Select>
          </i-form-item> -->
        
        </div>
          <i-form-item class="form-item check-car" label="选择车辆" >
            <!-- <div style="text-align: left" v-if="customer.create"> -->
              <!-- <div style="text-align: left"> -->
              <span   @click="slotScope.openDialog" style="
                background: #00000000;
                border: transparent;
                color: #FF8000;
                cursor:pointer;"
              >添加车辆</span>
            <!-- </div> -->
          </i-form-item>
        </template>
      </customer-select>
<!--  -->
      <h2 class="title">会员卡信息</h2>
      <div class="search-form">
        <member-list v-model="memberCard" @on-change="memberChange" :disabled="disabled"></member-list>
      </div>
      
      <h2 class="title">销售信息</h2>
      <div class="search-form vehicle">
        <div class="form-box">
          <i-form-item class="form-item" label="销售人员" prop="saleUserId">
            <Select v-model="formData.saleUserId" placeholder="请选择" placement="top" :disabled="disabled">
              <Option 
                v-for="item in staffList"
                :value="item.userId" 
                :key="item.userId">
                {{ item.username }}
              </Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" label="销售渠道" prop="channel">
            <Select v-model="formData.channel" placeholder="请选择" placement="top" :disabled="disabled">
              <Option 
                v-for="item in memberCardOrderChannel" 
                :value="item.value" 
                :key="item.value">
                {{ item.label }}
              </Option>
            </Select>
          </i-form-item>
          <i-form-item class="form-item" prop="saleAt" label="出售日期">
            <i-input v-model="formData.saleAt" v-if="disabled" :disabled="disabled"></i-input>
            <DatePicker 
              v-else
              type="date" 
              v-model="formData.saleAt"
              :options="timeOptions"
              placement="top" 
              placeholder="请选择"></DatePicker>
          </i-form-item>
        </div>
      </div>
       <h2 class="title">密码设定</h2>
      <div class="search-form psw-setting">
       <RadioGroup v-model="formData.verify" vertical @on-change="checkPsw">
        <Radio label="0">
            <Icon type="0"></Icon>
            <span>无需密码</span>
        </Radio>
        <Radio label="1">
            <Icon type="1"></Icon>
            <span>设置密码</span>
        </Radio> 
    </RadioGroup>
    <div class="card-psw" v-if="settingPsw">
       <i-form-item  prop="cardPassword" >
        <i-input v-model=" formData.cardPassword" type="password" password  placeholder="请输入核销密码" style="width: 200px;margin-right:20px" />  </i-form-item>
          <i-form-item  prop="enterCardPassword" > <i-input v-model="formData.enterCardPassword" type="password" password placeholder="请再次输入核销密码" style="width: 200px" /> </i-form-item>
    </div>
      </div>
      <Spin v-if="loading" fix></Spin>
    </i-form>
    <bottom-submit>
      <div class="slot-left">
        <p class="workorder-price">金额：<span>￥{{formData.cost | toFixed}}</span></p>
        <p>
          <span>{{formData.memberName || '未选择会员卡'}}</span>
        </p>
      </div>
      <i-button type="error" 
        :loading="btnLoading"
        @click="submit">{{btnName}}</i-button>
    </bottom-submit>
  </div>
</template>

<script>
  import "@/styles/views/workorder/add.less";
  import '@/styles/components/search-form.less';

  import {formatTime, randomStr, verify} from '@/assets/js/utils';
  import { memberCardOrderChannel } from '@/store/json/default';

  import CustomerSelect from '@/components/customer-select';
  import MemberList from './members';
// import { delete } from 'vue/types/umd';

  export default {
    components: { MemberList, CustomerSelect },
    data () {
      let { customer, marketCardTemplate } = this.$permission.data;
      // const state = this.$route.params.id;
      const state = this.$route.params.id === 'create';
      const validate = (rules, value, callback) => {
        if (rules.required && value === '') {
          return callback(rules.message);
        }
        // 格式错误的时候 提示错误
        if ( value !== '' && rules.reg && !verify(rules.reg, value)) {
          rules.message = rules.formatTip;
          return callback(rules.message);
        }
        callback();
      }
           const validateenterCardPassword = (rules, value, callback) => {
    
             
        if (this.formData.enterCardPassword!=this.formData.cardPassword) {
         
          return callback(rules.message);
        }
        callback();
      }
      return {
        settingPsw:false,                                               //控制是否出现设置密码
        // vertical:'0',                                                    // 选择是否设置密码

        customer,
        marketCardTemplate,
        breadName: '出售会员卡',                                        // 面包屑文字
        btnName: '保存',                                                // 提交按钮文字 
        loading: false,
        btnLoading: false,
        state: state,                                                   // 状态 true 新增  false 更新
        staffList: [],
        memberCard: [],
        memberCardOrderChannel,
        disabled: false,                                                // 是否可以编辑客户信息、销售信息

        formData: { 
            verify:'0',                                                    // 选择是否设置密码
          createdAt: '',                                                // 开单时间 格式： YYYY-MM-DD HH:mm:ss
          customerId: '',                                               // 客户id
          customerName: '',                                             // 客户姓名
          mobile: '',                                                   // 联系方式
          memberName: '',
          memberCardId: '',                                             // 会员卡id
          saleUserId: '',                                               // 销售员id
          saleAt: '',                                                   // 销售时间
          channel: '',                                                  // 销售渠道
          amount: 0,                                                    // 面额
          cost: 0,                                                      // 售价
          statementNo: '',                                              // 结算单编号 20位数字
          plateNo: '',                                                  // 车牌号码
          vehicleList: [],                                              // 车辆id列表
             cardPassword:'',
        enterCardPassword:'',
        },
        timeOptions: { // 时间限制
          disabledDate (date) {
            return date && date.valueOf() > Date.now();
          }
        },
        isPswRules:{
            cardPassword: [
            { 
              required: true, 
              message: '密码不能为空', 
              trigger: 'blur',
            }, { type: 'string', pattern: /^[0-9A-Za-z]{6,20}$/, message: '密码最少6位，可输入数字、字母（区分大小写）', trigger: 'blur' }
          ],
          enterCardPassword: [
            { 
              required: true, 
              message: '密码不一致', 
              trigger: 'blur', 
              validator: validateenterCardPassword 
            }
          ]
        },
        rules: {
          customerName: [
            { 
              required: true, 
              message: '客户姓名不能为空', 
              trigger: 'blur', 
              validator: validate 
            }
          ],
          mobile: [
            { 
              required: true, 
              message: '联系方式不能为空', 
              reg: 'MOBILE',
              formatTip: '电话号码格式不正确',
              trigger: 'blur', 
              validator: validate 
            }
          ],
          saleUserId: [{ required: true, message: '请选择销售员' }],
          channel: [{ required: true, message: '请选择销售渠道' }],
          saleAt: [{ required: true, message: '请选择出售日期' }],
          cardPassword: [
            { 
              required: true, 
              message: '密码不能为空', 
              trigger: 'blur',
            }, { type: 'string', pattern: /^[0-9A-Za-z]{6,20}$/, message: '密码最少6位，可输入数字、字母（区分大小写）', trigger: 'blur' }
          ],
          enterCardPassword: [
            { 
              required: true, 
              message: '密码不一致', 
              trigger: 'blur', 
              validator: validateenterCardPassword 
            }
          ]
        } 
      };
    },
    mounted () {
      this.init();
    },
    methods: {
        checkPsw(e){
            // console.log(e)
            if(e==1){
              this.settingPsw = true
              // this.rules = {...this.rules,...this.isPswRules}
              // console.log(this.rules)
            }else{

              this.settingPsw = false
              // delete this.rules.cardPassword
              // delete this.rules.enterCardPassword

            }
        },
      init () {
        if (this.state) {
          this.formData.statementNo = randomStr(4) + formatTime(new Date(), "yyMMddHHmmss") + randomStr(4);
          this.formData.createdAt = formatTime(new Date(), 'yyyy-MM-dd HH:mm:ss');
        } else {
          console.log("h uidg")
          this.getData();
        }
        this.getStaffList();
      },

      async getData () {
        this.loading = true;
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'memberCardOrderDetail',
          params: {
            _id: this.$route.params.id
          }
        });

        if (res.code === '0') {
          
          let data = res.data;
          if (data.memberCard) {
            data.memberName = data.memberCard.name;
            this.memberCard = [data.memberCard]
          };
          this.formData = res.data;
          if(this.formData.verify=="1")  {
            this.settingPsw = true
            this.formData.cardPassword = this.formData.password
            this.formData.enterCardPassword = this.formData.password
          } 
          let customer = JSON.parse(JSON.stringify(res.data));
          customer.name = customer.customerName;
          customer.mobile = customer.mobile;
          // 2 有效， 0 无效， 1 未结算 未结算才可以编辑disable: false
          this.disabled = !(data.status != 2);
          this.$refs.customerSelect.setData(customer);
        }
        this.loading = false;
      },

      async getStaffList () {
        const res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'staffList',
        });

        if (res.code === '0') {
          this.staffList = res.data.rows;
        }
      },

      submit () {
        if (!this.formData.memberCardId) {
          this.$Message.warning('请选择会员卡');
          return;
        }

        if (!this.formData.customerName) {
          this.$Message.warning('请检查客户信息');
          return;
        }

// 动态添加效验密码
      if(this.settingPsw){
              if(!this.rules.cardPassword){
                  this.rules = {...this.rules,...this.isPswRules}
              console.log(this.rules)
              }
            
            }else{
              delete this.rules.cardPassword
              delete this.rules.enterCardPassword

            }
        this.$refs.form.validate( valid => {
          if (valid) this.save();
        });
      },

      async save () {
        this.btnLoading = true;
        const params = {
          verify:this.formData.verify.toString(),
          password:this.formData.cardPassword,
          memberCardId: this.formData.memberCardId,
          customerId: this.formData.customerId,
          plateNo: this.formData.plateNo,
          saleAt: formatTime(this.formData.saleAt, 'yyyy-MM-dd'),
          cost: this.formData.cost,
          amount: this.formData.amount,
          mobile: this.formData.mobile,
          saleUserId: this.formData.saleUserId,
          channel: this.formData.channel,
          statementNo: this.formData.statementNo,
          vehicleIdList: this.formData.vehicleIdList
        }

        if (this.formData._id) params._id = this.formData._id;
        try {
          const res = await this.$store.dispatch({
            type: 'actionPost',
            name: 'memberCardOrderSave',
            params
          });

          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                this.btnLoading = false;
                this.$router.push('/market/card');
              }
            });
          } else {
            this.btnLoading = false;
          }
        } catch (error) {
          this.btnLoading = false;
        }
      },

      customerSelectChange (data) {
        this.formData.vehicleIdList = data.vehicleIdList;
        // 是否更新客户信息
        if (data.isUpdateCustomer) {
          this.formData.customerId = data.customerId;
          this.formData.customerName = data.name;
          this.formData.mobile = data.mobile;
        }
      },

      memberChange (data) {
        this.formData.memberCardId = data._id;
        this.formData.cost = data.salePrice;
        this.formData.amount = data.amount;
        this.formData.memberName = data.name;
      },
    },
    filters: {
      toFixed (v) {
        return Number(v || 0).toFixed(2);
      }
    }
  };
</script>

<style lang="less" scoped>
/deep/ .ivu-form-item-error-tip {
  font-size: 12px;
  width: 260px;
}
.psw-setting
{
  display: flex;
      align-items: flex-end;
    /deep/  .ivu-radio-group {
    display: inline-block;
     height: autos; 
    font-size: 14px;
    vertical-align: middle;
}
      /deep/ .ivu-radio-group-vertical .ivu-radio-wrapper {
    display: block;
    height: 40px;
    line-height: 40px;
}
    .card-psw{
      margin-left: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
/deep/ .ivu-form-item {
    margin-bottom: 0px;
    vertical-align: top;
    zoom: 1;
}

}
}
.customer-information{

 /deep/ .ivu-form-item {
    margin-bottom: 20px;
    vertical-align: top;
    zoom: 1;   
}
 /deep/ .check-car{
           display: flex;
    margin: 0 0 10px 0;
    align-items: flex-start;
    .ivu-form-item-content {
    position: relative;
    line-height: 0px; 
    font-size: 14px;
    margin:0 0 0 10px;
    height:18px;
        display: flex;
    justify-content: center;
    align-items: center;
}
     }
}

  .select {
    color: #fff!important;
    background: rgba(255, 128, 0, 0.9)!important;
  }
  .filter-option /deep/ .ivu-select-item-selected {
    color: #807D7C;
    background: white;
  }
  
  .filter-select /deep/ .ivu-select-arrow {
    font-size: 18px;
    transform: rotate(0)!important;
    margin-top: -9px;
    &::before {
      content: "\F4A5";
    }
  }
</style>
