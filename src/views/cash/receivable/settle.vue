<template>
  <!-- 合并收款 -->
  <div class="receivable-settle">
    <saas-bread title="合并收款">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <Alert type="warning" show-icon>合并收款无法使用税费计算、优惠计算、抹零功能，并只能选择一种支付方式，如需使用以上功能请选择单独收款。</Alert>

    <div class="settle-title">
      <span class="label">结算时间：</span>
      <DatePicker type="datetime" v-model="formData.settlementDate" placeholder="" :options="dateOption" style="width: 200px"></DatePicker>
    </div>

    <div class="content">
      <div class="row">
        <span class="col">{{data.customerId ? data.customerName : "匿名用户"}}</span>
        <span class="col">{{data.mobile || "无联系方式"}}</span>
        <span class="col">收款工单数：{{data.count}}</span>
        <span class="col">收款金额：￥{{data.leftReceivable | toFixed}}</span>
      </div>
      <div class="bottom">应收金额：<span class="price">￥{{data.leftReceivable | toFixed}}</span></div>
    </div>

    <div class="content">
      <div class="pay-wrapper">
        <div class="left">
          <div class="title">付款方式</div>
          <div class="pay-list">
            <RadioGroup type="button" size="large" @on-change="payChange">
              <Radio class="pay-item" v-for="(item, index) in payList" :key="index" :label="item.payTypeId">
                <i v-if="item.icon" :class="['iconfont', item.icon]"></i>{{item.name}}</Radio>
            </RadioGroup>
          </div>
        </div>
        <div class="right">
          <div class="title">付款金额</div>
          <div class="pay-list">
            <p class="pay-title">{{payItem.name}}</p>
            <i-input class="pay-input" v-model="formData.price" v-if="formData.payTypeId" @on-change="onPriceChange">
              <span class="prepend" slot="prepend">￥</span>
            </i-input>
          </div>
        </div>
      </div>
      <div class="bottom-wrap">
        <div class="content">
          <div class="price">应收金额：<span>￥{{data.leftReceivable | toFixed}}</span></div>
          <div class="sub">未收金额：<span>￥{{noPrice | toFixed}}</span></div>
        </div>
        <i-button type="primary" :disabled="disabled" @click="submit">确定收款</i-button>
      </div>
    </div>
  </div>
</template>

<script>
  import { formatTime } from "@/assets/js/utils";
  import { getUri } from "@/https/api";
  export default {
    data () {
      return {
        getUri,
        disabled: true,
        params: {},
        ids: [],
        payList: ["支付宝", "微信"],
        payItem: "",
        data: {},
        noPrice: 0,
        formData: {
          settlementDate: "",
          payTypeId: "",
          price: ''
        },
        dateOption: {
          disabledDate (date) {
              return date && date.valueOf() > Date.now();
          }
        },
      }
    },

    async created () {
      this.formData.settlementDate = formatTime(new Date(), 'yyyy-MM-dd HH-mm-ss');
      // let id = this.$route.query.customerId;
      // if (!id) this.params.anonymous = true;
      // else this.params.customerId = id;
      this.ids = this.$route.query.ids;
      this.loading = true;
      try {
        await this.getData();
        await this.getPayList();
        this.loading = false;
      } catch (err) {
        this.loading = false;
      }
    },

    methods: {
      async submit () {
        if (this.payItem) {
          let res = await this.$store.dispatch({
            type: "actionPost", 
            name: "onCreditPay",
            params: {
              statementNo: this.ids.split(","),
              settlementDate: this.formData.settlementDate,
              payInfo: [this.payItem]
            }
          });

          if (res.code === "0") {
            this.$Message.success("收款成功");
            this.$router.push("/cash/receivable/list");
          } else {
            this.$Message.error("收款失败");
          }
        } else {
          this.$Message.error("请选择支付方式");
        }
      },

      async getData () {
        let res = await this.$store.dispatch({
          type: "actionGet",
          name: "onCreditList",
          params: {
            statementNo: this.ids
          }
        });
        if (res.code === '0') {
          this.data = res.data.rows[0];
          this.noPrice = this.data.leftReceivable;
        }
      },

      async getPayList () {
        let res = await this.$store.dispatch({
          type: "actionGet",
          name: "paytypeList"
        });
        this.payList = res.data.rows.map(item => {
          if (item.name === '现金') item.icon = 'icon-xianjin';
          if (item.name === '银行卡') item.icon = 'icon-yinhangqia';
          if (item.name === '支付宝') item.icon = 'icon-zhifubao';
          if (item.name === '微信') item.icon = 'icon-weixin';
          return item;
        });
      },

      payChange (v) {
        this.payItem = this.payList.find(elm => elm.payTypeId === v);
        this.formData.payTypeId = this.payItem.payTypeId;
      },

      onPriceChange ({ target }) {
        let v = target.value;
        this.disabled = v * 1 !== this.data.leftReceivable * 1;
        this.noPrice = this.data.leftReceivable - this.formData.price;
      }
    },

    filters: {
      toFixed (v) {
        return Number(v).toFixed(2);
      }
    }
  }
</script>

<style lang="less">
  .receivable-settle {
    .settle-title {
      padding: 15px 20px;
      background: #FCFBFA;
      font-size: 14px;
      color: #332e29;
    }

    .content {
      background: white;
      padding: 0 20px;
      margin-bottom: 10px;
      .row {
        display: flex;
        align-items: center;
        font-size: 14px;
        color: #332e29;
        line-height: 30px;
        padding: 20px 0;
        justify-content: space-between;
        border-bottom: 1px solid #f2f2f2;
      }
      .bottom {
        text-align: right;
        padding: 20px 0;
        font-size: 14px;
        color: #332e29;
        .price {
          color: #ff8000;
          font-size: 14px;
        }
      }
    }

    .pay-wrapper {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #f2f2f2;
      >div {
        flex-grow: 1;
        width: 50%;
        margin-right: 40px;
        &:last-child {
          margin-right: 0;
        }
      }
      .title {
        font-size: 14px;
        color: #332e29;
        padding: 15px 0;
        border-bottom: 1px solid #f2f2f2;
      }

      .pay-list {
        padding: 20px 0 10px;
        .ivu-radio-group-button.ivu-radio-group-large .ivu-radio-wrapper {
          height: 60px;
          line-height: 60px;
          font-size: 14px;
          margin-right: 20px;
          min-width: 100px;
          width: auto;
          text-align: center;
          border-radius: 3px;
          margin-bottom: 10px;
          color: #332e29;
        }
        .pay-input {
          width: 300px;
          .ivu-input-group-prepend {
            width: 50px;
            border-radius: 3px;
            font-size: 14px;
          }
        }

        .pay-title {
          font-size: 14px;
          color: #332e29;
          margin-bottom: 5px;
        }

        .pay-item {
          .iconfont {
            font-size: 36px;
            vertical-align: middle;
            margin-right: 10px;
          }
          .icon-weixin {
            color: #05AF10;
          }
          .icon-zhifubao {
            color: #03AAEF;
          }
          .icon-yinhangqia {
            color: #317EF3;
          }
          .icon-xianjin {
            color: #FF8000;
          }
        }
      }
    }

    .bottom-wrap {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      padding-bottom: 20px;
      .content {
        border: 1px solid #ff8000;
        width: 300px;
        padding: 20px;
        margin-top: 20px;
        text-align: right;
        .price {
          font-size: 14px;
          color: #332e29;
          span {
            font-size: 18px;
            color: #ff8000;
          }
        }
      }
    }
  }
</style>
