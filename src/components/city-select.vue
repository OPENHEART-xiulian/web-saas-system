<!-- 城市选择组件 -->
<template>
  <div class="city-select">
    <Select v-model="formData.provinceCode" size="large" placeholder="省份" @on-open-change="provinceChange">
      <Option v-for="item in provinceList" :value="item.value" :key="item.value">{{ item.name }}</Option>
    </Select>
    <Select v-model="formData.cityCode" size="large" placeholder="城市" @on-open-change="cityChange" :disabled="cityList.length === 0">
      <Option v-for="item in cityList" :value="item.value" :key="item.value">{{ item.name }}</Option>
    </Select>
    <Select v-model="formData.countyCode" size="large" placeholder="区域" @on-open-change="onChange" :disabled="countyList.length === 0">
      <Option v-for="item in countyList" :value="item.value" :key="item.value">{{ item.name }}</Option>
    </Select>
  </div>
</template>

<script>
import {provinceJson, cityJson, countyJson} from '@/store/json/city.js';
export default {
  props: {
    cityData: {
      type: Object,
      default () {
        return {}
      }
    }
  },
  data () {
    return {
      provinceList: provinceJson,
      cityList: [],
      countyList: [],
      formData: {
        provinceCode: '',
        cityCode: '',
        countyCode: '',
      },
    };
  },
  watch: {
    'cityData.provinceCode' (to) {
      this.formData.provinceCode = to;
    },
    'cityData.cityCode' (to) {
      this.formData.cityCode = to;
      if (!to) return;
      this.getCityList();
    },
    'cityData.countyCode' (to) {
      if (!to) return;
      this.formData.countyCode = to;
      this.getCountyList();
    }
  },
  mounted () {
    if (this.cityData.countyCode) {
      this.formData.provinceCode = this.cityData.provinceCode;
      this.formData.cityCode = this.cityData.cityCode;
      this.formData.countyCode = this.cityData.countyCode;
      this.getCityList();
      this.getCountyList();
    }
  },
  methods: {
    getCityList () {
      this.cityList = cityJson.filter(item => item.value.slice(0, 2) === this.formData.provinceCode.slice(0, 2));
    },

    getCountyList () {
      this.countyList = countyJson.filter(item => item.value.slice(0, 4) === this.formData.cityCode.slice(0, 4));
    },

    provinceChange (v) {
      if (v || !this.formData.provinceCode) return;
      this.getCityList();
      this.formData.cityCode = this.cityList[0].value;
      this.cityChange();
    },

    cityChange (v) {
      if (v || !this.formData.cityCode) return;
      this.getCountyList();
      this.formData.countyCode = this.countyList[0].value;
      this.onChange();
    },

    onChange (v) { 
      if (v || !this.formData.countyCode) return;
      this.$emit('on-change', Object.assign({}, this.formData));
    }
  }
};
</script>
