<template>
	<!-- 打印模板  print-repair-bg -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area print-repair" ref="printForm">
          <h2 class="title">挂账单</h2>
          <p class="statement-no">
            <span>打印时间：{{now || '--'}}</span>
          </p>
          <div class="print-form">
            <table>
              <tr>
                <td style="width: 80px">客户姓名</td>
                <td>{{formData.customerName || '--'}}</td>
                <td style="width: 80px">联系方式</td>
                <td>{{formData.mobile}}</td>
                <td style="width: 80px">录单人</td>
                <td>{{userName || '--'}}</td>
                <td style="width: 80px">结算人</td>
                <td>{{userName || '--'}}</td>
              </tr>
              <tr>
                <td>挂账单信息</td>
                <td colspan="7" style="padding: 0">
                  <table class="takestock-table">
                    <tr>
                      <td style="width:180px">工单号</td>
                      <td>车牌号</td>
                      <td>工单类型</td>
                      <td style="width:180px">挂账时间</td>
                      <td>挂账金额</td>
                    </tr>
                    <tr v-for="(item, index) in tableData" :key="index">
                      <td>{{item.statementNo || '--'}}</td>
                      <td>{{item.plateNo || '--'}}</td>
                      <td>{{item.orderType | getWorkType}}</td>
                      <td>{{item.creditDate}}</td>
                      <td>￥{{item.leftReceivable}}</td>
                    </tr>
                    <tr>
                      <td colspan="4" style="text-align: right;padding-right: 20px">合计</td>
                      <td>￥{{ formData.leftReceivable | getFixed }}</td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td colspan="8">
                  <p style="margin-bottom: 10px">客户签名：</p>
                  <p>日期：&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;&nbsp;日</p>
                </td>
              </tr>
            </table>
          </div>
        </div>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>
    <div class="bottom-btn">
      <div>
        <i-button type="default" @click.stop="closePrint">取消</i-button>
        <i-button type="primary" @click.stop="print">打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
  import Print from '@/assets/js/print.js';
  import { workType, getLabel } from '@/store/json/default';
  import { formatTime, storage } from '@/assets/js/utils.js';
  import '@/../public/css/print.css';
  export default {
    props: {

    },
    data () {
      return {
        loading: false,
        show: false,
        formData: {},
        tableData: {},
        now: "",
        customerId: "",
        userName: ""
      }
    },

    methods: {
      openPrint (value) {
        this.userName = storage.get("USER").username;
        this.show = true;
        this.now = formatTime(new Date(), "yyyy.MM.dd");
        if (value === this.customerId) return;
        this.customerId = value;
        this.getData();
      },
      async getData () {
        this.loading = true;
        try {
          let params = {};
          if (this.customerId) params.customerId = this.customerId;
          else params.anonymous = true;
          let res = await this.$store.dispatch({
            type: "actionGet",
            name: "onCreditByCustomer",
            params
          });

          this.loading = false;
          if (res.code === '0') {
            this.tableData = res.data.rows;
            this.formData = res.data.customer;
          }
        } catch (err) {
          this.loading = false;
          console.log(err);
        }
      },
      closePrint () {
        this.show = false;
      },
      print () {
        const newPrint = new Print(this.$refs.printForm, '/css/print.css');
      },
    },
    filters: {
      getFixed (v) {
        if (!v) return '0.00';
        return Number(v).toFixed(2);
      },
      getWorkType (v) {
        return getLabel(v, workType);
      }
    },
  }
</script>
