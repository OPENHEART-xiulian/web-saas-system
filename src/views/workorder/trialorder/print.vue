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
          <!-- 结算清单 试算单 -->
          <table9 v-if="type === 9" :form-data="formData" statement-name="试算单号"></table9>
          <!-- 派工单 -->
          <table2 v-else-if="type === 1" :form-data="formData" statement-name="试算单号"></table2>
          <!-- 委托书 -->
          <table3 v-else-if="type === 2" :form-data="formData" statement-name="试算单号"></table3>
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
import Print from '@/assets/js/print.js'
import table9 from '../print-temp/table9'
import table2 from '../print-temp/table2'
import table3 from '../print-temp/table3'
import { mapGetters } from 'vuex'
import '@/../public/css/print.css'
export default {
  components: { table9, table2, table3 },
  props:{
    shareStoreId:{
      type:String,
      default:''
    }
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
      this.formData = to
    }
  },
  mounted () {},
  methods: {
    openPrint (value, type) {
      this.type = type || 0
      this.show = true
      if (typeof value === 'object') {
        this.formData = value
      } else {
        this.$store.dispatch({
          type: 'toGetWorkDetail',
          params: {
            params: {
              statementNo: value,
              shareStoreId: this.shareStoreId
            },
            request: 'trialOrderDetail'
          }
        })
      }
    },
    closePrint () {
      this.show = false
    },
    print () {
      const newPrint = new Print(this.$refs.printForm, '/css/print.css')
    }
  },
  computed: {
    ...mapGetters({ detailData: 'getWorkDetail' })
  }
}
</script>
