<template>
  <div class="workorder-balance">
    <saas-bread title="收款">
      <template slot="actions">
        <Button type="default" @click="back">返回</Button>
      </template>
    </saas-bread>
    <p class="order-detail">
      <span>工单号：{{ workDetail.statementNo }}</span>
      <span>开单时间：{{ workDetail.createdAt }}</span>
      <span v-if="workDetail.finishDate"
        >施工完成时间：{{ workDetail.finishDate }}</span
      >
      <span class="time-item" v-if="type === 'worker' && !isSettle"
        >结算时间：
        <DatePicker
          type="datetime"
          placeholder="选择时间"
          style="width: 180px"
          v-model="time"
          :clearable="false"
          :editable="false"
          :options="timeOptions"
          @on-open-change="changeTime"
          @on-clear="clearTime"
        >
        </DatePicker>
      </span>
    </p>
    <div class="balance-content">
      <table class="first-table">
        <tbody>
          <tr>
            <td
              class="work-first"
              v-if="type === 'worker' || type === 'cleanout'"
            >
              <my-img :src="GET_BRAND_LOGO + workDetail.brandId" />
              <div class="img-block">
                <p>{{ workDetail.plateNo }}</p>
                <p>
                  {{ workDetail.vehicleBrand }}-{{ workDetail.carSeries }}
                  {{ workDetail.carStyle }}
                </p>
              </div>
            </td>
            <td v-if="type === 'worker' || type === 'cleanout'">
              {{ workDetail.vehicleOwner }}<br />{{ workDetail.ownerMobile }}
            </td>

            <td v-if="type === 'sparepart'">
              {{ workDetail.vehicleOwner || "匿名客户" }}
            </td>
            <td v-if="type === 'sparepart'">
              {{ workDetail.ownerMobile || "无手机号码" }}
            </td>
            <td class="last-td">
              <p>
                工单金额：<span class="price"
                  >￥{{ workDetail.receivable }}</span
                >
              </p>
              <p>
                <span v-if="type !== 'sparepart'"
                  >工时费￥{{ workDetail.totalItemCost }} +</span
                >
                <span>材料费￥{{ workDetail.totalPartCost }} +</span>
                <span>其他费用￥{{ workDetail.totalOtherCost }}</span>
                <Button type="text" v-if="isShow" @click="tableShow"
                  >收起费用明细
                  <Icon type="arrow-up-b"></Icon>
                </Button>
                <Button type="text" v-else @click="tableShow"
                  >展开费用明细
                  <Icon type="arrow-down-b"></Icon>
                </Button>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
      <expand-table :tableItem="workDetail" :isShow="isShow"></expand-table>
      <div class="opt-btn">
        <Button
          v-if="!isSettle"
          type="default"
          @click="showTax"
          :class="{ active: isTax }"
        >
          <Icon type="checkmark"></Icon>税费
        </Button>
        <Button
          v-if="!isSettle && workDetail.leftReceivable !== '0'"
          type="default"
          @click="showDiscounts"
          :class="{ active: isCoupon }"
        >
          <Icon type="checkmark"></Icon>优惠
        </Button>
        <Button
          v-if="!isSettle && workDetail.leftReceivable !== '0'"
          type="default"
          @click="notCount"
          :class="{ active: isNotCount }"
        >
          <Icon type="checkmark"></Icon>抹零
        </Button>
        <p>
          应收金额：<span class="price"
            >￥{{ receivableCost > 0 ? receivableCost : 0 }}</span
          >
        </p>
        <p>
          工单总额￥{{ workDetail.receivable }}
          <span v-if="parseFloat(tax) > 0"> + 税费￥{{ tax }}</span>
          <span v-if="workDetail.realCost !== '0'">
            - 预付款￥{{ workDetail.realCost }}</span
          >
          <span v-if="parseFloat(discountCost) > 0">
            - 优惠￥{{ discountCost }}</span
          >
          <span v-if="parseFloat(smallChange) > 0">
            - 抹零￥{{ smallChange }}</span
          >
        </p>
      </div>

      <div class="pay-content" v-if="receivableCost > 0">
        <div class="pay-box">
          <p class="pay-title">支付方式</p>
          <CheckboxGroup
            class="pay-way"
            v-model="payCheck"
            @on-change="changePay"
          >
            <template v-for="(item, index) in payWay">
              <Checkbox
                :key="index"
                :label="item.payTypeId"
                v-if="item.status === 'enabled'"
              >
                <i
                  :class="['iconfont', item.icon]"
                  v-if="item.status === 'enabled'"
                ></i>
                <span>{{ item.name }}</span>
              </Checkbox>
            </template>

            <!-- 有可用的会员卡及不是预收才显示选择按钮  -->
            <Checkbox label="card" v-if="cardList.length > 0 && !isSettle">
              <i class="iconfont"></i>
              <span>会员卡</span>
            </Checkbox>
          </CheckboxGroup>
        </div>

        <div class="pay-box">
          <p class="pay-title">收款金额</p>
          <ul class="pay-price">
            <li v-for="(item, index) in pay" :key="index">
              <span class="add" v-if="index > 0">+</span>
              <div style="display: inline-block">
                <p>{{ item.name }}支付</p>
                <format-input
                  v-model="item.price"
                  reg="PRECISION"
                  @on-change="changePrice"
                >
                  <span slot="prepend">￥</span>
                </format-input>
              </div>
              <div class="errTip" v-if="validate(item.price, index)">
                {{ item.errTip }}
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div class="card-content" v-show="payCheck.includes('card') && !isSettle">
        <p class="card-title">会员卡支付</p>
        <div class="card-item">
          <label>会员卡</label>
          <Select v-model="cardData.memberCardOrderId" @on-change="changeCard">
            <Option
              v-for="item in cardList"
              :key="item._id"
              :value="item._id"
              >{{ item.memberCard.name }}</Option
            >
          </Select>
          <p v-if="isCardService" class="card-tip">{{ cardTip }}</p>
        </div > 
             <div class="card-item" v-if="inputPsw">
          <label>核销密码</label>
          <format-input
            v-model="cardData.password"
            type="password"
              style="width:240px;height:40px"
              
            @on-change="changeMobile"
          >
          </format-input>
             <p v-if="isPsw" class="card-tip">{{ tipPsw }}</p>
        </div>
        <!-- <div class="card-item">
          <label>手机号码</label>
          <format-input 
            v-model="cardData.mobile"
            :disabled="true"
            maxlength="11"
            reg="NUMBER" 
            @on-change="changeMobile"
          >  
          </format-input>
        </div> -->
        <!-- <div class="card-item" style="display: flex; height: 50px">
          <label>图形验证码</label>
          <format-input
            v-model="cardData.captchaStr"
            maxlength="4"
            style="width: 128px"
            @on-change="changeMobile"
          >
          </format-input>
          <i-col span="4"
            ><div class="captcha" ref="captcha" @click="getCaptcha">
              加载中...
            </div></i-col
          >
          <i-col span="1" class="change-captcha">
            <div @click="getCaptcha">
              <i class="icon iconfont icon-shuaxin"></i></div
          ></i-col>
        </div> -->
        <!-- <div class="card-item">
          <label>验证码</label>
          <format-input
            v-model="cardData.validationCode"
            maxlength="4"
            reg="NUMBER"
          >
          </format-input>
          <vaildate
            :mobile="cardData.mobile"
            :disabled="valiDisabled"
            :captchaStr="cardData.captchaStr"
            type="primary"
            smsType="2"
          ></vaildate>
        </div> -->
      </div>

      <div class="balance-bottom">
        <Checkbox
          v-model="isSettle"
          v-if="receivableCost > 0 || unable"
          :disabled="unable"
          @on-change="changeCheck"
          >收取预付款</Checkbox
        >
        <div class="bottom-text">
          <p v-if="parseFloat(tax) > 0">+ 税费：￥{{ tax || 0 }}</p>
          <p v-if="parseFloat(discountCost) > 0">
            - 优惠：￥{{ discountCost }}
          </p>
          <p v-if="parseFloat(smallChange) > 0">- 抹零：￥{{ smallChange }}</p>
          <p v-if="parseFloat(workDetail.realCost)">
            - 预付款：￥{{ workDetail.realCost }}
          </p>
          <p v-if="!isSettle" class="price-text">
            实收金额：<span class="price big-price"
              >￥{{ receivableCost > 0 ? receivableCost : 0 }}</span
            >
          </p>
          <p v-else class="price-text">
            预收金额：<span class="price big-price"
              >￥{{ settlePrice || 0 }}</span
            >
          </p>
          <p v-if="cardDiscountCost">
            - 会员卡折扣金额：<span class="price little-price"
              >￥{{ cardDiscountCost }}</span
            >
          </p>
          <p v-if="finalCardPay">
            - 会员卡收款：<span class="price little-price"
              >￥{{ finalCardPay }}</span
            >
          </p>
          <p>
            还需支付：
            <span class="price little-price"
              >￥{{ arrears || receivableCost }}</span
            >
          </p>
        </div>
        <Button
          type="error"
          :disabled="disabled && receivableCost > 0"
          :loading="btnLoading"
          @click="submit"
          >确认收款</Button
        >
      </div>
    </div>
    <Spin fix v-if="loading"></Spin>
    <discounts-dialog ref="discounts" @on-ok="discountsOk"></discounts-dialog>
    <tax-dialog ref="taxDialog" @on-ok="taxOk"> </tax-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import expandTable from "./components/expand-table";
import DiscountsDialog from "@/components/dialog/discounts-dialog";
import taxDialog from "@/components/dialog/tax-dialog";
import vaildate from "@/components/vaildate";
import { formatTime } from "@/assets/js/utils.js";
import { GET_BRAND_LOGO } from "@/https/api";
import "@/styles/views/workorder/balance.less";
import { regexEnum } from "@/assets/js/regexEnum";

export default {
  components: { DiscountsDialog, taxDialog, expandTable, vaildate },
  data() {
    return {
     

      valiDisabled: true,
      GET_BRAND_LOGO, // 车辆品牌logo
      id: this.$route.params.id,
      type: this.$route.path.split("/")[2],
      btnLoading: false,
      isShow: false,
      payCheck: [],
      disabled: true,
      discount: 0, // 折扣
      discountCost: 0, // 折扣金额
      taxRate: 0, // 税率
      tax: 0, // 税费
      smallChange: 0, // 抹零
      arrears: "", // 还需支付金额
      receivableCost: "", // 应收金额
      pay: [], // 选中支付方式
      isSettle: false, // 是否收取预收款
      unable: false, // 收取预收款是否禁止改变
      settlePrice: 0, // 本次预收金额
      isCoupon: false, // 是否优惠
      isNotCount: false, // 是否抹零
      isTax: false, // 是否收税
      time: new Date(), // 结算时间修改，目前只有维修工单
      timeOptions: {
        // 时间限制
        disabledDate(date) {
          return date && date.valueOf() > Date.now();
        },
      },
      cardData: {  password:"" }, // 会员卡参数
      curCard: {}, // 选择的会员卡
      finalCardPay: 0, // 会员卡最终支付金额
      isCardService: false, // 是否会员卡能支付
      availableService: [], // 会员卡中可用的项目
      cardTip: "暂无可用项目，请重新选择其他会员卡支付或取消会员卡支付", // 会员卡不能使用的提示
      tipPsw:"请输入密码",
      cardDiscountCost: 0, // 会员卡打折减去的金额
      inputPsw:false,//判断会员卡是否有密码
      isPsw:false,//密码提示信息
    };
  },

  created() {
    this.init();
  },
  mounted() {

    this.getCaptcha();
   
  },

  computed: {
    ...mapGetters({
      workDetail: "getWorkDetail",
      payWay: "getTableData",
      cardList: "getCardForSettle",
    }),

    ...mapState({ loading: (state) => state.global.isLoading }),
  },

  watch: {

    workDetail(data) {
      if (data) {
        this.calculation();
        if (this.type === "worker" && !this.isSettle) {
          const finishDate = new Date(this.workDetail.finishDate) - 86399999; // 24 * 60 * 60 * 1000 = 一天（8640000）
          this.timeOptions = {
            disabledDate(date) {
              return (
                date &&
                (date.valueOf() > Date.now() || date.valueOf() < finishDate)
              );
            },
          };
        }

        if (data.vehicleId && data.customerId) {
          // 有车牌号码才可能有会员卡
          this.$store.dispatch({
            type: "toGetCardForSettle",
            params: {
              vehicleId: data.vehicleId,
              customerId: data.customerId,
            },
          });
        }
      }
    },

    payWay(value) {
      if (value) {
        value.forEach((item, index) => {
          if (item.name === "现金") item.icon = "icon-xianjin";
          if (item.name === "银行卡") item.icon = "icon-yinhangqia";
          if (item.name === "支付宝") item.icon = "icon-zhifubao";
          if (item.name === "微信") item.icon = "icon-weixin";
        });
      }
    },

    payCheck(value) {
      if (value) {
        const arr = [];
        value.forEach((item, index) => {
          this.payWay.forEach((vv, kk) => {
            if (item === vv.payTypeId) {
              arr.push(vv);
            }
          });
        });

        this.pay = arr;
      }
    },
  },

  methods: {
    changeMobile(e) {
      // const reg = regexEnum.MOBILE;
      // const imgReg = regexEnum.IMGCODE;
      // // if (!reg.test(this.cardData.mobile)) {
      // //    this.valiDisabled = true;

      // // } else {
      // if (!imgReg.test(this.cardData.captchaStr)) {
      //   // console.log("enter")
      //   this.valiDisabled = true;
      // } else {
      //   // console.log("faiul")
      //   this.valiDisabled = false;
      //   // }
      // }
    },
    getCaptcha() {
      if (this.captchaLogin) return; //如果正在加载验证码，则不做任何操作
      console.log("this.$refs.captcha:", this.$refs.captcha);
      //设置验证码相关初始状态
      // this.form.captcha = "";
      // this.captchaLogin = true;
      this.$refs.captcha.innerHTML = "加载中...";

      this.$store
        .dispatch({
          type: "imageCaptcha",
          params: {
            // mobile: this.formData.mobile,
          },
        })
        .then((res) => {
          // console.log("图形验证码", res);
          this.$refs.captcha.innerHTML = res;
          // if (res.code !== "0") {

          //   // rules.message = '短信验证码不正确';
          //   // return callback(rules.message);
          // }
          callback();
        });
      //获取后端验证码
      // this.$ajax(this.$api.login.captcha,'',(RES)=>{
      //     //设置验证码返回值
      //     this.captcha = RES.text;
      //     this.$refs.captcha.innerHTML = RES.data;
      //     this.captchaLogin = false;
      // },(error)=>{
      //     this.captchaLogin = false;
      //     this.$refs.captcha.innerHTML = '加载失败';
      //     this.$Message.error('服务器出错');
      // })
    },
    init() {
      let request = "";
      switch (this.type) {
        case "worker":
          request = "workDetail";
          break;
        case "sparepart":
          request = "saleDetail";
          break;
        case "cleanout":
          request = "careDetail";
          break;
        default:
          break;
      }
      this.$store.dispatch({
        type: "toGetWorkDetail",
        params: {
          params: {
            statementNo: this.id,
          },
          request: request,
        },
      });

      const payload = {
        request: "paytypeList",
        params: {},
      };
      this.$store.dispatch({
        type: "toGetTableData",
        payload,
      });

      // 未完成施工的单只能预收款 
      if (this.$route.query.advance) {
        this.unable = true;
        this.isSettle = true;
      }
    },

    showDiscounts() {
      this.$refs.discounts.openModal(this.workDetail.receivable);
    },

    showTax() {
      this.$refs.taxDialog.openModal(this.workDetail.receivable);
    },

    // 抹零
    notCount() {
      this.isNotCount = !this.isNotCount;
      this.calculation();
    },

    discountsOk(data, realCost) {
      this.discount = (data.discount / 100).toFixed(2);
      this.discountCost = data.discountCost.toFixed(2);
      this.discountType = data.discountType;
      this.calculation();

      if (parseFloat(this.discountCost) > 0) {
        this.isCoupon = true;
      } else {
        this.isCoupon = false;
      }
    },

    taxOk(data, realCost) {
      this.tax = parseFloat(data.tax.toFixed(2));
      this.taxRate = parseFloat((data.taxRate / 100).toFixed(2));
      this.calculation();

      if (parseFloat(this.tax) > 0) {
        this.isTax = true;
      } else {
        this.isTax = false;
      }
    },

    // 计算应收金额：工单总金额+税费-优惠-抹零
    calculation() {
      const cost =
        Math.round(
          parseFloat(
            this.workDetail.receivable -
              this.workDetail.realCost +
              this.tax -
              this.discountCost
          ) * 10000
        ) / 10000;

      if (this.isNotCount) {
        this.smallChange =
          Math.round(parseFloat(cost - Math.floor(cost)) * 10000) / 10000;
        this.receivableCost = Math.floor(cost); // 直接取整
      } else {
        this.smallChange = 0;
        this.receivableCost = cost;
      }

      this.changePrice();
    },

    back() {
      this.$router.go(-1);
    },

    tableShow() {
      this.isShow = !this.isShow;
    },

    changePrice(e) {
      // 有选择了会员卡
      let cardArrears; // 用了会员卡后还需要付的钱
      this.cardDiscountCost = 0; // 会员卡折扣先置0
      if (Object.keys(this.curCard).length > 0) {
        if (this.curCard.memberCard.type === "1") {
          // 充值卡不能混搭其他支付方式，充值卡不够钱提醒充值
          if (this.curCard.memberCard.discount > 0) {
            // 打折卡
            this.cardDiscountCost =
              Math.round(
                (this.receivableCost -
                  this.receivableCost * this.curCard.memberCard.discount) *
                  100
              ) / 100;

            cardArrears =
              Math.round(
                (this.receivableCost * this.curCard.memberCard.discount -
                  this.curCard.amount) *
                  100
              ) /
                100 <=
              0
                ? "0.00"
                : Math.round(
                    (this.receivableCost * this.curCard.memberCard.discount -
                      this.curCard.amount) *
                      100
                  ) / 100;

            this.finalCardPay =
              Math.round(
                (this.receivableCost * this.curCard.memberCard.discount -
                  this.curCard.amount) *
                  100
              ) /
                100 <=
              0
                ? Math.round(
                    this.receivableCost * this.curCard.memberCard.discount * 100
                  ) / 100
                : this.curCard.amount;
          } else {
            // 不打折
            cardArrears =
              this.receivableCost - this.curCard.amount <= 0
                ? "0.00"
                : this.receivableCost - this.curCard.amount;

            this.finalCardPay =
              this.receivableCost - this.curCard.amount < 0
                ? this.receivableCost
                : this.curCard.amount;
          }

          this.isCardService = false; // 会员卡错误提示先置否
          if (cardArrears > 0) {
            cardArrears = 0;
            this.finalCardPay = 0;
            this.isCardService = true;
            this.cardTip =
              "该充值卡不够钱支付该工单罗，请及时充值或使用其他支付方式！";
          }
        } else {
          // 服务卡
          this.checkIsAvailable();
          cardArrears =
            this.receivableCost - this.finalCardPay <= 0
              ? "0.00"
              : this.receivableCost - this.finalCardPay;
        }
      }

      let total = 0;
      this.pay.forEach((item, index) => {
        if (
          item.price &&
          !isNaN(item.price) &&
          this.payCheck.includes(item.payTypeId)
        ) {
          total = total + parseFloat(item.price);
        }
      });

      if (cardArrears) {
        this.arrears = (parseFloat(cardArrears) - total).toFixed(2);
      } else {
        // 还需支付金额 = 应收金额 - 选择支付金额
        this.arrears =
          this.receivableCost - total === 0 || this.receivableCost - total
            ? (this.receivableCost - total).toFixed(2)
            : "";
      }

      this.settlePrice = total;
      setTimeout(() => {
        this.isDisabled();
      }, 100);
    },

    changePay(value) {
     
      // 重新选择时自动选择第一张会员卡
      if (value.includes("card") && Object.keys(this.curCard).length === 0) {
        // 是否需要密码
    if(this.cardList[0].verify=="1"){
      this.inputPsw = true
    }
        this.cardData.memberCardOrderId = this.cardList[0]._id;
        this.cardData.mobile = this.cardList[0].mobile;
       
        this.cardData.verify=(this.inputPsw?"1":"0");
        this.curCard = this.cardList[0];
      }

      if (!value.includes("card")) {
        this.curCard = {};
      }

      this.finalCardPay = 0; // 会员卡付款置0

      setTimeout(() => {
        this.changePrice();
      }, 100);
    },

    isDisabled() {
      let isErr = false;
      this.pay.forEach((item, index) => {
        if (item.errTip) {
          isErr = true;
        }
      });

      if (
        !isErr &&
        (Number(this.arrears) === 0 ||
          (this.isSettle && Number(this.arrears) > 0))
      ) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },

    changeCheck(val) {
      this.discount = 0;
      this.discountCost = 0;
      this.discountType = "nodiscount";
      this.tax = 0;
      this.taxRate = 0;
      this.isCoupon = false;
      this.isNotCount = false;
      this.isTax = false;
      this.finalCardPay = 0; // 会员卡付款置0
      this.curCard = {};
      this.payCheck.forEach((item, index) => {
        if (item === "card") {
          this.payCheck.splice(index, 1);
        }
      });
      this.calculation();
    },

    validate(price, index) {
      if (!price) {
        this.pay[index].errTip = "请输入金额";
        return true;
      } else if (!/^\d+\.?\d{0,2}$/.test(price)) {
        this.pay[index].errTip = "请输入正确的金额";
        return true;
      } else {
        this.pay[index].errTip = "";
      }
    },

    getPayInfo() {
      const arr = [];
      this.pay.forEach((item) => {
        arr.push({
          payTypeId: item.payTypeId,
          name: item.name,
          amount: item.price,
     
        });
      });

      return arr;
    },

    changeTime(value) {
      if (!value && this.type === "worker" && !this.isSettle) {
        // 维修工单并且不是预收
        if (
          this.time &&
          new Date(this.workDetail.finishDate) > new Date(this.time)
        ) {
          this.$Message.warning("结算时间不能小于施工完成时间");
          this.time = new Date();
        }
      }
    },

    clearTime() {
      this.time = new Date();
    },

    // 选择会员卡
    changeCard(value) {
      console.log("value:",value)
      this.finalCardPay = 0;
      this.cardList.forEach((item) => {
        if (value === item._id) {
          this.curCard = item;
          if(item.verify=="1"){
            this.inputPsw = true
            this.cardData.verify = "1"
          }else if(item.verify=="0"){
            this.inputPsw = false
            this.cardData.verify = "0"
          }
        }
      });

      this.cardData.mobile = this.curCard.mobile;
      this.changePrice();
    },

    // 检查会员卡是否可用
    checkIsAvailable() {
      let deduction = 0; // 会员卡抵扣的钱  
      const serviceList = [];
      this.curCard.serviceList.forEach((item) => {
        this.workDetail.repairItems.forEach((wItem) => {
          if (item.serviceId === wItem.serviceId && item.remainCount > 0) {
            deduction = deduction + parseFloat(wItem.cost);
            serviceList.push({
              serviceId: item.serviceId,
            });
          }
        });
      });
      this.availableService = serviceList;
      if (deduction > 0) {
        // 能抵扣，不显示提示
        this.isCardService = false;
      } else {
        this.isCardService = true;
        this.cardTip =
          "暂无可用项目，请重新选择其他会员卡支付或选择其他支付方式！";
      }
      this.finalCardPay = deduction;
    },

    // 获取会员卡参数
    getCardPayInfo() {
      const obj = {
        amount: this.finalCardPay,
      };
      const params = Object.assign({}, obj, this.cardData);

      // 服务卡需要传可用服务id 
      if (this.availableService.length > 0)
        params.serviceList = this.availableService;

      return params;
    },

    submit() {
      this.btnLoading = true;
      if(this.inputPsw&&this.cardData.password.trim()=="") this.isPsw = true
      const params = {
        statementNo: this.id,
        discount: String(this.discount),
        discountCost: String(this.discountCost),
        payInfo: this.getPayInfo(),
        discountType: this.discountType || "nodiscount",
        isSettle: this.isSettle ? "0" : "1",
        tax: String(this.tax),
        taxRate: String(this.taxRate),
        smallChange: String(this.smallChange),
    
      };

      if (this.payCheck.includes("card") && this.finalCardPay > 0) {
        // 包含会员卡付款
        params.memberCardPayInfo = this.getCardPayInfo();
        // if (!params.memberCardPayInfo.validationCode) { 
        //   this.$Message.warning("请输入手机验证码再结算哦！");
        //   this.btnLoading = false;
        //   return;
        // }
      }

      if (this.type === "worker" && !this.isSettle) {
        // 维修工单并且不是预收
        if (this.time) {
          params.settlementDate = formatTime(this.time, "yyyy-MM-dd HH:mm:ss");
        } else {
          params.settlementDate = formatTime(new Date(), "yyyy-MM-dd HH:mm:ss");
        }
      }

      let request = "";
      switch (this.type) {
        case "worker":
          request = "workPay";
          break;
        case "sparepart":
          request = "salePay";
          break;
        case "cleanout":
          request = "carePay";
          break;
        default:
          break;
      }
      this.$store
        .dispatch({
          type: "toPayWork",
          params: {
            params: params,
            request: request,
          },
        })
        .then((res) => {
          let content = "收款成功！3s后返回工单管理页面"
          if(this.$route.query.from === 'cashier'){
            content = "收款成功！3s后返回收银管理页面"
          }
          if (res.code === "0") {
            this.$Message.success({
              content: content,
              onClose: () => {
                this.btnLoading = false;
                if(this.$route.query.from === 'cashier'){
                  this.$router.push({path: '/cash'})
                }else{
                  if (this.type === "worker") {
                    this.workSuccess();
                  }
  
                  if (this.type === "sparepart" || this.type === "cleanout") {
                    this.partSuccess();
                  }
                }

              },
            });
          } else {
            this.btnLoading = false;
            if (res.code === "107099") {
              this.$Message.warning(res.msg);
            } else {
              this.$Message.error("收款失败，请稍后再试");
            }
          }
        })
        .catch((err) => {
          this.btnLoading = false;
          this.$store.commit("REQUEST_ERROR", { err });
        });
    },

    // 维修工单成功返回
    workSuccess() {
      let type = 2;
      if (
        this.workDetail.workStatus === "3" &&
        this.workDetail.payStatus === "3"
      ) {
        type = 4; // 已出厂已挂账，收款完成跳到已完成
      } else if (
        this.workDetail.workStatus === "1" &&
        this.workDetail.payStatus === "1"
      ) {
        type = 0; // 预收款未施工完成
      } else if (
        this.workDetail.workStatus === "2" &&
        this.workDetail.payStatus === "3" &&
        this.isSettle
      ) {
        type = 3; // 预收款施工完成，收款完成跳到已挂账
      } else if (this.isSettle) {
        type = 1; // 预收款施工完成，收款完成跳到待结算
      }

      this.$router.push({
        path: "/workorder/worker/list",
        query: { type: type, refresh: true },
      });
    },

    // 销售配件、洗美工单成功返回
    partSuccess() {
      let type = 3;
      if (this.workDetail.workStatus === "1") {
        type = 0; // 待施工预收款，收款完成跳到待出库
      } else if (
        this.workDetail.workStatus === "2" &&
        this.workDetail.payStatus === "1" &&
        this.isSettle
      ) {
        type = 1; // 待结算预收，收款完成跳到待结算
      } else if (
        this.workDetail.workStatus === "2" &&
        this.workDetail.payStatus === "3" &&
        this.isSettle
      ) {
        type = 2; // 已挂账预收，收款完成跳到已挂账
      } else {
        type = 3; // 收款完成跳到已完成
      }

      this.$router.push({
        path: "/workorder/" + this.type + "/list",
        query: { type: type, refresh: true },
      });
    },
  },
};
</script>
