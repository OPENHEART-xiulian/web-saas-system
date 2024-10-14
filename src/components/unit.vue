<!-- 配件单位组件 -->
<template>
  <div>
    {{unitText}}
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
  props: {
    unit: String,
  },
  computed: {
    ...mapGetters({
      unitList: 'getUnitList',
    }),
    unitText () {
      const reg = new RegExp("[\\u4E00-\\u9FFF]+", "g");
      if (reg.test(this.unit)) {
        return this.unit
      } else {
        let obj = this.unitList.find(item => item.unit === this.unit)
        if (obj) {
          return obj.name
        } else {
          return '--'
        }
      }
    }
  },
  data () {
    return {

    }
  },
  mounted () {

  },
  activated () {
  },
  methods: {

  }
}
</script>
