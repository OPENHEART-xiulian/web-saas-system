<template>
  <!-- 退货单退款 -->
  <div class="workorder-balance">
    <saas-bread title="退款">
      <template slot="actions">
        <i-button type="default" @click="back">返回</i-button>
      </template>
    </saas-bread>
    <p class="order-detail">
      <span>退货单号：{{ detail.returnFormCode || '--' }}</span>
      <span>退货日期：{{ detail.orderAt || '--' }}</span>
    </p>
    <div class="balance-content">
      <table class="first-table">
        <tbody>
          <tr>
            <td>供应商：{{ detail.supplierName }}</td>
            <td>退货数量：{{detail.totalQuantity || 0}}</td>
            <td class="last-td">退货金额：￥{{ detail.totalCost }}</td>
          </tr>
        </tbody>
      </table>

      <div class="opt-btn">
        <p>退款金额：<span class="price">￥{{ receivableCost > 0 ? receivableCost : 0 }}</span></p>
      </div>

      <div class="pay-content" v-if="receivableCost > 0">
        <div class="pay-box">
          <p class="pay-title">支付方式</p>
          <CheckboxGroup class="pay-way" v-model="payCheck" @on-change="changePay">
            <Checkbox v-for="(item, index) in payWay" :key="index"
              :label="item.payTypeId" v-if="item.status === 'enabled'">
              <i :class="['iconfont', item.icon]" v-if="item.status === 'enabled'"></i>
              <span>{{ item.name }}</span>
            </Checkbox>
          </CheckboxGroup>
        </div>

        <div class="pay-box">
          <p class="pay-title">退款金额</p>
          <ul class="pay-price">
            <li v-for="(item, index) in pay" :key="index">
              <span class="add" v-if="index > 0">+</span>
              <div style="display: inline-block;">
                <p>{{ item.name }}支付</p>
                <format-input v-model="item.price" reg="PRECISION" @on-change="changePrice">
                  <span slot="prepend">￥</span>
                </format-input>
              </div>
              <div class="errTip" v-if="validate(item.price, index)">{{ item.errTip }}</div>
            </li>
          </ul>
        </div>
      </div>

      <div class="balance-bottom">
        <div class="bottom-text">
          <p class="price-text">应退金额：<span class="price big-price">￥{{ receivableCost > 0 ? receivableCost : 0 }}</span></p>
          <p>还需退款：
            <span class="price little-price">￥{{ arrears || receivableCost }}</span>
          </p>
        </div>
        <Button type="error" :disabled="disabled && receivableCost > 0" 
          :loading="btnLoading"
          @click="submit">确认退款</Button>
      </div>
    </div>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import '@/styles/views/workorder/balance.less';

export default {
  data () {
    return {
      id: this.$route.params.id,
      btnLoading: false,
      payCheck: [],
      disabled: true,
      arrears: '', // 还需支付金额
      receivableCost: '', // 应收金额
      pay: [], // 选中支付方式
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetRefundDetail',
      params: {
        returnFormId: this.id
      }
    })

    const payload = {
      request: 'paytypeList',
      params: {}
    }
    this.$store.dispatch({
      type: 'toGetTableData',
      payload
    });
  },

  computed: {
    ...mapGetters({
      detail: 'getRefundDetail',
      payWay: 'getTableData'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    detail (data) {
      this.receivableCost = data.totalCost;
      this.changePrice();
    },
    payWay (value) {
      if (value) {
        value.forEach((item, index) => {
          if (item.name === '现金') item.icon = 'icon-xianjin';
          if (item.name === '银行卡') item.icon = 'icon-yinhangqia';
          if (item.name === '支付宝') item.icon = 'icon-zhifubao';
          if (item.name === '微信') item.icon = 'icon-weixin';
        })
      }
    },

    payCheck (value) {
      if (value) {
        const arr = [];
        value.forEach((item, index) => {
          this.payWay.forEach((vv, kk) => {
            if (item === vv.payTypeId) {
              arr.push(vv);
            }
          })
        });

        this.pay = arr;
      }
    }
  },

  methods: {
    back () {
      this.$router.go(-1);
    },

    changePrice (e) {
      let total = 0;
      this.pay.forEach((item, index) => {
        if (item.price && !isNaN(item.price) && this.payCheck.includes(item.payTypeId)) {
          total = total + parseFloat(item.price);
        }
      });

      // 还需支付金额 = 应收金额 - 选择支付金额
      this.arrears = ((this.receivableCost - total) === 0 || (this.receivableCost - total)) ? (this.receivableCost - total).toFixed(2) : '';
      setTimeout(() => {
        this.isDisabled();
      }, 100)
    },

    changePay (value) {
      setTimeout(() => {
        this.changePrice();
      }, 100)
    },

    isDisabled () {
      let isErr = false;
      this.pay.forEach((item, index) => {
        if (item.errTip) {
           isErr = true;
        }
      });

      if (!isErr && Number(this.arrears) === 0) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },

    validate (price, index) {
      if (!price) {
        this.pay[index].errTip = '请输入金额';
        return true;
      } else if (!/^\d+\.?\d{0,2}$/.test(price)) {
        this.pay[index].errTip = '请输入正确的金额';
        return true;
      } else {
        this.pay[index].errTip = '';
      }
    },

    getPayInfo () {
      const arr = [];
      this.pay.forEach((item) => {
        arr.push({
          payTypeId: item.payTypeId,
          name: item.name,
          amount: item.price
        })
      });

      return arr;
    },

    submit () {
      const params = {
        returnFormId: this.id,
        payInfo: this.getPayInfo()
      }
      this.btnLoading = true;
      this.$store.dispatch({
        type: 'toPayRefund',
        params
      }).then((res) => {
        if (res.code === '0') {
          const cost = this.receivableCost * 100;
          this.$Message.success({
            content: '退款成功',
            onClose: () => {
              this.btnLoading = false;
              // this.$store.commit("setKeepAliveData", { name: "InventoryPurchase", value: false });
              this.$router.replace('/inventory/purchase/list?name=RefundList&refresh=true');
            }
          });
        } else {
          this.btnLoading = false;
          this.$Message.error('退款失败，请稍后再试');
        }
      }).catch((err) => {
        this.btnLoading = false;
        this.$store.commit('REQUEST_ERROR', { err });
      });
    }
  }
}
</script>
