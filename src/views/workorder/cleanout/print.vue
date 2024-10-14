<template>
	<!-- 打印模板 -->
  <div class="print-model-bg" v-if="show">
    <div class="print-model clear">
      <div class="print-bg clear">
        <div class="print-area" ref="printForm">
          <table1 v-if="type === 0" :form-data="formData" ref="table1"></table1>
          <table2 v-else-if="type === 1" :form-data="formData" ref="table2"></table2>
          <table8 v-else-if="type === 8" :form-data="formData" ref="table8"></table8>
        </div>
      </div>
    </div>
    <div class="bottom-btn">
      <div>
        <i-button type="default" @click.stop="closePrint">取消</i-button>
        <i-button
          type="default"
           v-if="type === 0 || type === 8"
          @click.stop="remark"
        >备注</i-button>
        <i-button type="primary" @click.stop="print">打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
  import Print from '@/assets/js/print.js';
  import table1 from './../print-temp/table5';
  import table2 from './../print-temp/table4';
  import table8 from './../print-temp/table8';
  import { mapGetters } from 'vuex';
  import '@/../public/css/print.css';
  export default {
    components: { table1, table2, table8 },
    
    data () {
      return {
        show: false,
        type: 0,
        formData: {}
      }
    },

    props:{
      shareStoreId:{
        type:String,
        default:''
      }
    },

    methods: {
      async openPrint (value, type) {
        this.type = type || 0;
        this.show = true;
        if (typeof value === 'object') {
          this.formData = value;
        } else {
          const res = await this.$store.dispatch({
            type: 'toGetCareDetail',
            params: {
              statementNo: value,
              shareStoreId: this.shareStoreId
            }
          });

          if (res.code === '0') {
            this.formData = res.data;
          }
        }
      },
      closePrint () {
        this.show = false;
      },
      print () {
        const newPrint = new Print(this.$refs.printForm, '/css/print.css');
      },
      remark(){
        if(this.$refs.table1){
          this.$refs.table1.toogleRemark()
        }else{
          this.$refs.table8.toogleRemark()
        }
      }
    }
  }
</script>
