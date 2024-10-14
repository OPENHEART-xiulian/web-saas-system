<template>
  <!-- 打印模板 -->
  <div
    class="print-model-bg"
    v-if="show"
  >
    <div class="print-model clear">
      <div class="print-bg clear">
        <div
          class="print-area"
          ref="printForm"
        >
          <!-- 结算清单 -->
          <table1
            v-if="type === 0"
            :form-data="formData"
            ref="table1"
          ></table1>
          <table2
            v-else-if="type === 1"
            :form-data="formData"
          ></table2>
          <table3
            v-else-if="type === 2"
            :form-data="formData"
          ></table3>
          <!-- 退货单详情 -->
          <table6
            v-else-if="type === 6"
            :form-data="formData"
          ></table6>
          <!-- 结算清单简单版 -->
          <table7
            v-else-if="type === 7"
            :form-data="formData"
            ref="table7"
          ></table7>
        </div>
      </div>
    </div>
    <div class="bottom-btn">
      <div>
        <i-button
          type="default"
          @click.stop="closePrint"
        >取消</i-button>
        <i-button
          type="default"
           v-if="type === 0 || type === 7"
          @click.stop="remark"
        >备注</i-button>
        <i-button
          type="primary"
          @click.stop="print"
        >打印</i-button>
      </div>
    </div>
  </div>
</template>

<script>
import Print from '@/assets/js/print.js'
import table1 from './print-temp/table1'
import table2 from './print-temp/table2'
import table3 from './print-temp/table3'
import table6 from './print-temp/table6'
import table7 from './print-temp/table7'
import { mapGetters } from 'vuex'
import { TO_GET_WORK_DETAIL } from '@/store/mutation-types';
import '@/../public/css/print.css'
export default {
  components: { table1, table2, table3, table6, table7 },
  props: {
    shareStoreId:{
      type:String,
      default:''
    },
  },
  data () {
    return {
      show: false,
      type: 0,
      formData: {}
    }
  },
  watch: {
    detailData (to) {
      to.workOrderRemark = ""; // 打印里面的备注与工单里面的备注无关，每次打开，用户点击了备注并填写才显示备注
      this.formData = to
    }
  },
  mounted () {},
  methods: {
    openPrint (value, type) {
      this.type = type || 0
      this.show = true
      if (typeof value === 'object') {
        this.$store.commit(TO_GET_WORK_DETAIL, { data: value });
      } else {
    
        this.$store.dispatch({
          type: 'toGetWorkDetail',
          params: {
            params: {
              statementNo: value,
              shareStoreId: this.shareStoreId
            },
            request: 'workDetail'
          }
        })
      }
    },
    closePrint () {
      this.show = false
    },
    print () {
      const newPrint = new Print(this.$refs.printForm, '/css/print.css')
    },
    remark(){
      if(this.$refs.table1){
        this.$refs.table1.toogleRemark()
      }else{
        this.$refs.table7.toogleRemark()
      }
    }
  },
  computed: {
    ...mapGetters({ detailData: 'getWorkDetail' })
  }
}
</script>
