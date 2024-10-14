<template>
  <div class="time-group">
    <RadioGroup class="radio-group" v-model="formData[radioKey]" type="button">
      <template v-for="(item, index) in data">
        <Radio :key="index" :label="item[valueKey]" @click.native="radioChange(item, index)">{{item[labelKey]}}</Radio>
      </template>
    </RadioGroup>
    <DatePicker class="start-date" v-model="formData[startKey]" type="date" @click.native="startChange" placeholder="开始日期"></DatePicker> -
    <DatePicker class="end-date" v-model="formData[endKey]" type="date" @click.native="endChange" placeholder="结束日期"></DatePicker>
  </div>
</template>

<script>
export default {
  props: {
    // 列表数据
    data: {
      type: Array,
      default () {
        return []
      }
    },
    // 列表的value的key值
    valueKey: {
      type: String,
      default: 'value'
    },
    // 列表的label的key值
    labelKey: {
      type: String,
      default: 'label'
    },
    radioKey: {
      type: String,
      default: 'p'
    },
    startKey: {
      type: String,
      default: 'dateFrom'
    },
    endKey: {
      type: String,
      default: 'dateTo'
    },
    // 表单数据
    value: {
      type: Object,
      default () {
        return {}
      }
    },
  },
  data () {
    return {
      formData: {},
    }
  },
  watch: {
    value (to) {
      this.formData = JSON.parse(JSON.stringify(to));
    },
  },
  methods: {
    radioChange (data, index) {
      this.onChange();
    },
    startChange (value) {
      this.onChange();
    },
    endChange (value) {
      this.onChange();
    },
    onChange () {
      this.$emit('on-change', this.formData);
      this.$emit('value', this.formData);
    }
  }
}
</script>

<style lang="less">
  .time-group {
    .radio-group {
      margin-right: 10px;
    }
  }
</style>
