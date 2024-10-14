<template>
  <div class="query-form" v-if="inputData && inputData.length !== 0">
    <Form ref="form" label-position="top">
      <div class="form-box">
          <FormItem class="form-item" v-for="(item, index) in inputData" :key="index" :label="item.label">
            <!-- 下拉选择框 -->
            <Select 
              v-if="item.type === 'select'" 
              v-model="formData[item.key]" 
              :disabled="item.disabled" 
              :placeholder="item.holder" 
              :clearable="item.clearable">
              <Option 
                v-for="(cItem, cIndex) in item.data" 
                :key="cIndex" 
                :value="cItem.value">
                {{cItem.label}}
              </Option>
            </Select>

            <!-- 单选按钮 -->
            <RadioGroup 
              v-else-if="item.type === 'radio'" 
              v-model="formData[item.key]"
              :disabled="item.disabled" >
              <Radio 
                v-for="(cItem, cIndex) in item.data" 
                :key="cIndex" 
                :label="cItem.value">
                {{cItem.name}}
              </Radio>
            </RadioGroup>

            <!-- 城市选择 -->
            <!-- <city-select 
              :city-data="cityData"
              v-else-if="item.type === 'city'" 
              @on-change="cityChange"
              :show-county="item.showCounty">
            </city-select> -->

            <!-- 日期选择框 -->
            <div v-else-if="item.type === 'date'" class="date-con">
              <DatePicker type="date" 
                v-model="formData[item.key[0]]" 
                :disabled="item.disabled" 
                :placeholder="item.holder[0]">
              </DatePicker>
              <DatePicker type="date" 
                v-model="formData[item.key[1]]" 
                placement="bottom-end"
                :disabled="item.disabled" 
                :placeholder="item.holder[1]">
              </DatePicker>
            </div>

            <!-- 普通输入框 -->
            <i-input 
              v-else type="text" 
              v-model.trim="formData[item.key]" 
              :disabled="item.disabled" 
              :placeholder="item.holder">
            </i-input>

          </FormItem>
          <FormItem class="form-item search-btn" label=" ">
            <i-button type="default" @click="reset">重置</i-button>
            <i-button type="primary" :loading="loading" @click.stop="search">筛选</i-button>
          </FormItem>
      </div>
    </Form>
  </div>
</template>

<script>
import '@/styles/components/query-form.less';

// import CitySelect from './city-select';
import { formatTime } from '@/assets/js/utils.js';

export default {
  // components: { CitySelect },
  props: {
    inputData: {
      // 查询 输入框的数据
      /**
      * {
      *  disabled: 是否可用,
      *  key: 键值
      *  holder: 提示文字
      *  type: 类型 text select date city 4种
      *  clearable: 是否有清除按钮 仅支持type为select date
      *  data: 下拉框数据
      * }
      */
      type: Array
    },
    params: {             // 表单默认数据
      type: Object,
      default () {
        return {}
      }
    },
    loading: {            // 是否在加载中
      type: Boolean,
      default: false
    }
  },

  data () {
    return {
      // cityData: {},
      formData: {},       // 查询表单数据
    }
  },
  mounted () {
    this.formData = Object.assign({}, this.params);
    // this.formData = params;
  },
  methods: {
    reset () {
      // 重置表单
      this.formData = {};
      this.$emit('reset', this.formData);
    },
    search () {
      const formData = Object.assign({}, this.params, this.formData);
      formData.page = 1;
      for (const key in formData) {
        if (formData.hasOwnProperty(key)) {
          const element = formData[key];
          if (element === '') delete formData[key];
          if (element instanceof Date) {
            formData[key] = formatTime(element, 'yyyy-MM-dd');
          }
        }
      }
      
      this.$emit('search', formData);
    },

    // cityChange (data) {
    //   this.cityData = data;
    //   this.formData.provinceCode = data.provinceCode;
    //   this.formData.cityCode = data.cityCode;
    //   if (data.countyCode) this.formData.countyCode = data.countyCode;
    // }
  }
}
</script>
