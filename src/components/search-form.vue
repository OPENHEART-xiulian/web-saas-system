<template>
  <div class="search-form" v-if="inputData && inputData.length !== 0">
    <Form ref="form" :mode="formData" label-position="top" :rules="rules">
      <div class="form-box">
        <div class="form-item" v-for="(item, index) in inputData" :key="index">
          <FormItem :label="item.label" :prop="item.key">
            <slot v-if="item.slot" :name='item.slot'></slot>
            <!-- 普通输入框 -->
            <i-input 
              v-else-if="item.type === 'text'" 
              type="text" 
              v-model.trim="formData[item.key]" 
              :disabled="item.disabled" 
              :placeholder="item.holder">
            </i-input>
            <!-- 下拉选择框 -->
            <Select 
              v-else-if="item.type === 'select'" 
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

            <!-- 数字输入框 -->
            <div class="form-number" v-else-if="item.type === 'number'">
              <div class="number-item">
                <format-input reg="NUMBER" v-model="formData[item.key1]">
                  <span slot="append">次</span>
                </format-input>
              </div>
              <span style="width: 10%; text-align: center;">-</span>
              <div class="number-item">
                <format-input reg="NUMBER" v-model="formData[item.key2]">
                  <span slot="append">次</span>
                </format-input>
              </div>
            </div>
            <!-- 金额输入框 -->
            <div class="form-number" v-else-if="item.type === 'money' || item.type === 'multipleInput'">
              <div class="number-item">
                <format-input reg="PRECISION" v-model="formData[item.key1]">
                  <span slot="append">{{item.util || "元"}}</span>
                </format-input>
              </div>
              <span style="width: 10%; text-align: center;">-</span>
              <div class="number-item">
                <format-input reg="PRECISION" v-model="formData[item.key2]">
                  <span slot="append">{{item.util || "元"}}</span>
                </format-input>
              </div>
            </div>

            <!-- 多个日期 -->
            <div class="multiple-date" v-else-if="item.type === 'multipleDate'">
              <div class="multiple-date__item">
                <DatePicker type="date" 
                  v-model="formData[item.key1]" 
                  :disabled="item.disabled1" 
                  :readonly="item.readonly1"
                  :placeholder="item.holder1">
                </DatePicker>
              </div>
              <span style="width: 10%; text-align: center;">-</span>
              <div class="multiple-date__item">
                <DatePicker type="date" 
                  v-model="formData[item.key2]" 
                  :disabled="item.disabled2" 
                  :readonly="item.readonly2"
                  :placeholder="item.holder2">
                </DatePicker>
              </div>
            </div>
                   <!-- 2个输入框 -->
            <div
              v-else-if="item.type === 'dText'"
              class="doubleText"
            >
              <format-input :reg="item.reg||'NUMBER'" v-model="formData[item.key[0]]">
                <span slot="append" v-if="item.util"> {{item.util}}</span>
              </format-input>
              <span class="splitSympol"> - </span>
              <format-input :reg="item.reg||'NUMBER'" v-model="formData[item.key[1]]">
                <span slot="append" v-if="item.util"> {{item.util}}</span>
              </format-input>
            </div>

            <!-- 日期选择框 -->
            <DatePicker v-else type="date" 
              v-model="formData[item.key]" 
              :disabled="item.disabled" 
              :placeholder="item.holder">
            </DatePicker>
          </FormItem>
        </div>
        <div class="form-item form-btn" v-if="showBtn">
          <i-button type="default" @click="reset">重置</i-button>
          <i-button type="warning" :loading="loading" @click.stop="search">筛选</i-button>
        </div>
      </div>
    </Form>
  </div>
</template>

<script>
import formatInput from '@/components/format-input';
import '@/styles/components/search-form.less';

export default {
  props: {
    inputData: {
      // 查询 输入框的数据
      /**
      * {
      *  disabled: 是否可用,
      *  key: 键值
      *  holder: 提示文字
      *  type: 类型 text select date 三种
      *  clearable: 是否有清除按钮 仅支持type为select date
      *  data: 下拉框数据
      * }
      */
      type: Array
    },
    rules: {
      type: Object
    },
    showBtn: {
      type: Boolean,
      default: true
    },
    initForm: {  // 初始化表单数据
      type: Object,
      default () {
        return {}
      }
    }
  },

  data () {
    return {
      formData: this.initForm, // 查询表单数据
      loading: false, // 是否在加载中
    }
  },

  methods: {
    reset () {
      // 重置表单
      this.formData = {};
      this.$emit('form-reset', this.formData);
      this.search();
    },

    search () {
      this.$emit('form-data', this.formData);
    }
  },

  components: { formatInput }
}
</script>
