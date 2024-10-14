import '@/styles/components/input-list.less'
import { storage } from '@/assets/js/utils.js'
import { mapGetters } from 'vuex'
export default {
  props: {
    defaultList: {
      type: Array
    }
  },
  computed: {
    ...mapGetters({
      billUsers: 'getBillUsers'
    })
  },
  data () {
    return {
      focusIndex: 0,
      formRows: [],
      row: {}
    }
  },
  filters: {
    toFixed (v) {
      return Number(v || 0).toFixed(2)
    }
  },
  watch: {
    defaultList (to) {
      this.setFormRows(to)
    }
  },
  created () {
    if (this.defaultList && this.defaultList.length > 0) {
      this.setFormRows(this.defaultList)
    }
    // this.getBillUsers()
  },
  methods: {
    // getBillUsers () {
    //   this.$store.dispatch('toGetBillUsers')
    // },
    setFormRows (to) {
      // this.formRows.splice(0);
      if (this.initList) this.initList(to.slice(0))
      // if (this.formRows.length === 0) this.formRows.push(Object.assign({}, this.row));
      this.getSum()
    },
    onFocus (index) {
      this.focusIndex = index
    },
    addFormRows () {
      this.formRows.push(Object.assign({}, this.row))
    },
    removeFormRows (index) {
      if (this.formRows.lenght <= 1) return
      this.formRows.splice(index, 1)
      this.getSum()
    },
    getFormRows () {
      let data = []
      this.formRows.forEach(item => {
        let i = 0
        for (const key in item) {
          if (key !== 'realityCost' && item.hasOwnProperty(key) && item[key]) {
            i++
          }
        }
        if (i !== 0) data.push(item)
      })
      return data
    },
    getSum () {
      let sum = 0
      this.formRows.forEach(item => {
        sum += parseFloat(item.cost || '0')
      })
      this.$emit('on-change', sum)
    },
    product (a, b, num) {
      // 两个数相乘精度转换
      let newNum = num || 100
      let newA = Number(a) * newNum
      let newB = Number(b) * newNum
      return (newA * newB) / (newNum * newNum)
    }
  }
}
