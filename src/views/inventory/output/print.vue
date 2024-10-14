<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <print-temp :form-data="formData"></print-temp>
        </div>
      </div>
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
  import PrintTemp from './print-temp';
  import '@/../public/css/print.css';
  export default {
    components: { PrintTemp },
    props: {

    },
    data () {
      return {
        userList: [],
        loading: false,
        show: false,
        formData: {}
      }
    },
    mounted () {

    },
    methods: {
      async getBillUsersList (stockOutNo) {
        this.loading = true;
        let data = await this.$store.dispatch({
          type: "getBillUsersList"
        });
        this.userList = data;
        this.getData(stockOutNo);
      },
      openPrint (stockOutNo) {
        this.show = true;
        this.getBillUsersList(stockOutNo);
      },

      async getData (stockOutNo) {
        let res = await this.$store.dispatch({
          type: "actionGet",
          name: "outputCheck",
          params: { stockOutNo }
        });
        this.formData = res.data;
        // 领料人
        let user = this.userList.find(elm => elm._id == this.formData.billUserId);
        let username = user ? user.username : "--";
        this.formData.username = username;
        this.loading = false;
      },

      closePrint () {
        this.show = false;
      },
      print () {
        const newPrint = new Print(this.$refs.printForm, '/css/print.css');
      },
    }
  }
</script>
