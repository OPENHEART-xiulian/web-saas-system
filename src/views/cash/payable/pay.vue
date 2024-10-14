<template>
  <!-- 应付账款付款页面 -->
  <div class="payable-balance">
    <saas-bread title="付款">
      <template slot="actions">
        <i-button type="default" @click="back">返回</i-button>
      </template>
    </saas-bread>
    <p class="order-detail">
      <span>供应商：{{ (detail.length > 0 && detail[0].supplierName) || '--' }}</span>
      <span>付款单数：{{ detail.length || '--' }}</span>
    </p>
    <div class="balance-content">
      <table class="first-table">
        <tbody>
          <tr v-for="(item, index) in detail"
            :key="index">
            <td>采购单号：{{ item.purchaseCode }}</td>
            <td>采购数量：{{ item.totalQuantity }}</td>
            <td class="last-td">采购金额：￥{{ item.totalCost }}</td>
          </tr>
        </tbody>
      </table>

      <div class="opt-btn">
        <p>应付金额：<span class="price">￥{{ receivableCost }}</span></p>
      </div>

      <div class="pay-content" v-if="receivableCost > 0">
        <div class="pay-box">
          <p class="pay-title">付款方式</p>
          <RadioGroup v-model="payCheck" class="pay-way"
            @on-change="changePay">
            <Radio :label="item.payTypeId" 
              v-for="(item, index) in payWay" 
              :key="index">
              <i :class="['iconfont', item.icon]" v-if="item.status === 'enabled'"></i>
              <span>{{ item.name }}</span>
            </Radio>
          </RadioGroup>
        </div>

        <div class="pay-box">
          <p class="pay-title">付款金额</p>
          <ul class="pay-price" v-if="payTypeName">
            <li>
              <div style="display: inline-block;">
                <p>{{ payTypeName }}支付</p>
                <i-input v-model="price" @on-change="changePrice">
                  <span slot="prepend">￥</span>
                </i-input>
              </div>
              <div class="errTip" v-if="validate(price)">{{ errTip }}</div>
            </li>
          </ul>
        </div>
      </div>

      <div class="balance-bottom">
        <div class="bottom-text">
          <p class="price-text">应付金额：<span class="price big-price">￥{{ receivableCost }}</span></p>
          <p>还需支付：
            <span class="price little-price">￥{{ arrears || receivableCost }}</span>
          </p>
        </div>
        <Button type="error" :disabled="disabled && receivableCost > 0" 
          :loading="btnLoading"
          @click="submit">确认付款</Button>
      </div>
    </div>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { storage } from '@/assets/js/utils';
import '@/styles/views/cash/payable-balance.less';

export default {
  data () {
    return {
      id: this.$route.params.id,
      payItem: storage.get('payItem'),
      btnLoading: false,
      payCheck: '',
      disabled: true,
      arrears: '', // 还需支付金额
      payTypeName: '',   // 支付名称
      price: '',
      errTip: ''
    }
  },

  created () {
    if (!this.payItem) {
      this.$store.dispatch({
        type: 'toGetPurchaseList',
        params: {
          supplierId: this.id,
          purchaseStatus: '2',
          settleStatus: '1'
        }
      })
    }

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
      purchaseDetail: 'getPurchaseList',
      payWay: 'getTableData'
    }),

    ...mapState({ loading: (state) => state.global.isLoading }),

    detail () {
      let arr = [];
      if (this.payItem) {
        arr = this.payItem;
      } else {
        arr = this.purchaseDetail;
      }
      return arr;
    },

    receivableCost () {
      let cost = 0;
      if (this.detail) {
        this.detail.forEach(item => {
          cost += parseFloat(item.totalCost);
        })
      }
      return cost;
    }
  },

  watch: {
    payWay (value) {
      if (value) {
        value.forEach((item, index) => {
          if (item.name === '现金') item.icon = 'icon-xianjin';
          if (item.name === '银行卡') item.icon = 'icon-yinhangqia';
          if (item.name === '支付宝') item.icon = 'icon-zhifubao';
          if (item.name === '微信') item.icon = 'icon-weixin';
        })
      }
    }
  },

  beforeDestroy () {
    storage.remove('payItem');
  },

  methods: {
    back () {
      this.$router.go(-1);
    },

    changePrice (e) {
      // 还需支付金额 = 应收金额 - 选择支付金额
      this.arrears = (this.receivableCost - this.price).toFixed(2);
      setTimeout(() => {
        this.isDisabled();
      }, 100)
    },

    changePay (value) {
      this.payWay.forEach((item) => {
        if (item.payTypeId === value) {
          this.payTypeName = item.name;
        } 
      })
    },

    isDisabled () {
      if (!this.errTip && Number(this.arrears) === 0) {
        this.disabled = false;
      } else {
        this.disabled = true;
      }
    },

    validate (price) {
      if (!price) {
        this.errTip = '请输入金额';
        return true;
      } else if (!/^\d+\.?\d{0,2}$/.test(price)) {
        this.errTip = '请输入正确的金额';
        return true;
      } else {
        this.errTip = '';
      }
    },

    getPurchaseCode () {
      let arr = [];
      this.payItem.forEach(item => {
        arr.push(item.purchaseCode);
      })

      return arr;
    },

    submit () {
      const params = {
        supplierId: this.id,
        payTypeId: this.payCheck,
        payTypeName: this.payTypeName,
        purchaseCode: this.payItem ? this.getPurchaseCode() : undefined
      }

      this.btnLoading = true;
      this.$store.dispatch({
        type: 'toPayableOpt',
        params
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success({
            content: '付款成功',
            onClose: () => {
              this.btnLoading = false;
              this.$router.push('/cash/payable');
            }
          });
        } else {
          this.btnLoading = false;
          this.$Message.error('付款失败，请稍后再试');
        }
      }).catch((err) => {
        this.btnLoading = false;
        this.$store.commit('REQUEST_ERROR', { err });
      });
    }
  }
}
</script>
