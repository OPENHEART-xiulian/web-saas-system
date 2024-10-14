<!-- 统计图 -->
<template>
	<div class="charts-content" :style="chartsStyle">
    <div class="charts-title">
      <span>{{ title }}</span>
      <ButtonGroup>
        <Button 
          v-for="(item, index) in chartBtns"
          :key="index"
          @click="renewCharts( item.value )"
          :class="{ active: curKey === item.value }">{{ item.name }}
        </Button>
      </ButtonGroup>
    </div>
    <div style="position: relative;" >
      <chart :options="options" 
        :auto-resize="true" 
        v-if="!$slots.data">
      </chart>
      <slot name="data" v-else></slot>
      <Spin fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import '@/styles/components/echarts.less';

export default {
  props: {
  	options: Object,
    chartBtns: Array,
    title: String,
    loading: Boolean,
    chartsStyle: Object
  },

  data () {
    return {
      curKey: this.chartBtns[0].value
    }
  },

  methods: {
    renewCharts (index) {
      this.curKey = index;
      this.$emit('renew-charts', this.curKey)
    }
  }
};
</script>
