import {
  vehicleType,
  repairType,
  vehicleEquipment,
  appearance,
  term,
  getLabel
} from '@/store/json/default.js'
import { mapGetters } from 'vuex'
export default {
  computed: {
    ...mapGetters({
      billUsers: 'getBillUsers'
    })
  },
  data () {
    return {
      needRemark:false,
      isRemark:false,
      remarkText:''
    }
  },
  created () {
    this.getBillUsers()
  },
  methods: {
    isRemarkFromData(formData){
      if(this.formData.workOrderRemark){
        this.remarkText = this.formData.workOrderRemark
        this.needRemark = true
      }else{
        this.needRemark = false
      }
    },
    toogleRemark(){
      this.isRemark = true
      this.needRemark = true
    },
    requireRemark(){
      this.formData.workOrderRemark = this.remarkText
      this.afterRemark()
    },
    cancelRemark(){
      this.afterRemark()
    },
    afterRemark(){
     this.isRemark = false
      if(!this.formData.workOrderRemark){
        this.needRemark = false
      }
    },
    getBillUsers () {
      this.$store.dispatch('toGetBillUsers')
    },
    
    getAppearance (obj) {
      let strArr = []
      for (const key in obj) {
        let str
        switch (key) {
          case 'front':
            str = this.getStr1(obj[key], appearance)
            if (str) strArr.push('正前：' + str)
            break
          case 'left':
            str = this.getStr1(obj[key], appearance)
            if (str) strArr.push('左侧：' + str)
            break

          case 'right':
            str = this.getStr1(obj[key], appearance)
            if (str) strArr.push('右侧：' + str)
            break

          case 'top':
            str = this.getStr1(obj[key], appearance)
            if (str) strArr.push('车顶：' + str)
            break

          case 'back':
            str = this.getStr1(obj[key], appearance)
            if (str) strArr.push('正后：' + str)
            break
        }
      }
      return strArr.join(';') || '无'
    },

    getStr1 (arr1, arr2) {
      if (!arr1 || arr1.length === 0) return ''
      let strArr = []
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i]) {
          strArr.push(getLabel(arr1[i].desc, arr2))
        }
      }
      return strArr.join('、') || ''
    },

    getStr (arr1, arr2) {
      if (!arr1 || arr1.length === 0) return ''
      let strArr = []
      for (let i = 0; i < arr1.length; i++) {
        if (arr1[i]) {
          strArr.push(getLabel(arr1[i], arr2))
        }
      }
      return strArr.join('、') || ''
    },

    getStuff (array) {
      return this.getStr(array, vehicleEquipment) || '--'
    },

    getMalfunction (array) {
      return this.getStr(array, term) || '无'
    }
  },
  filters: {
    getFixed (v) {
      if (!v) return '0.00'
      return Number(v).toFixed(2)
    },
    getRepairType (v) {
      return getLabel(v, repairType)
    },
    getVehicleType (v) {
      return getLabel(v, vehicleType)
    },
    getDate (v) {
      return v ? v.split(' ')[0] : '--'
    }
  }
}
