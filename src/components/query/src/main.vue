<template>
  <!-- 筛选表单 -->
  <div class="saas-query">
    <Form ref="form" :model="formData" label-position="top" :rules="rules">
      <div :class="['query-box', queryClass]">
        <template v-for="(item, index) in data">
          <FormItem class="query-box__item" :label="item.label || ' '" :prop="item.key" :key="index">
            <!-- 自定义 -->
            <slot v-if="item.slot" :name="item.slot" :form-data="formData" :item="item"></slot>
            <!-- 普通输入框 -->
            <i-input
              v-else-if="item.type === 'text'"
              type="text"
              v-model.trim="formData[item.key]"
              :disabled="item.disabled"
              :placeholder="item.holder">
            </i-input>
            <!-- 数字输入框 -->
            <format-input
              v-else-if="item.type === 'number'"
              type="text"
              v-model.trim="formData[item.key]"
              :disabled="item.disabled"
              :placeholder="item.holder"
              reg="NUMBER">
            </format-input>
            <!-- 下拉选择框 -->
            <Select
              v-else-if="item.type === 'select'"
              v-model="formData[item.key]"
              :multiple="item.multiple"
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

            <!-- 日期选择框 -->
            <DatePicker v-else-if="item.type === 'date'" type="date"
              v-model="formData[item.key]"
              :disabled="item.disabled"
              :placeholder="item.holder"
              :clearable="item.clearable">
            </DatePicker>

            <!-- 多个日期 -->
            <div class="multiple" v-else-if="item.type === 'multipleDate'">
              <div class="multiple__item">
                <DatePicker type="date"
                  v-model="formData[item.start.key]"
                  :options="dateOptions[item.start.key]"
                  :disabled="item.start.disabled"
                  :readonly="item.start.readonly"
                  :placeholder="item.start.holder"
                  :clearable="item.start.clearable"
                  @on-change="onStartDateChange(item)">
                </DatePicker>
              </div>
              <span class="horizontal-line">-</span>
              <div class="multiple__item">
                <DatePicker type="date"
                  v-model="formData[item.end.key]"
                  :options="dateOptions[item.end.key]"
                  :disabled="item.end.disabled"
                  :readonly="item.end.readonly"
                  :placeholder="item.end.holder"
                  :clearable="item.end.clearable"
                  @on-change="onEndDateChange(item)">
                </DatePicker>
              </div>
            </div>

            <!-- 多个输入框 -->
            <div class="multiple" v-else-if="item.type === 'multipleInput'">
              <format-input
                class="multiple__item"
                v-model="formData[item.start.key]"
                :disabled="item.start.disabled"
                :readonly="item.start.readonly"
                :placeholder="item.start.holder"
                :reg="item.reg"
                :min="item.min">
                <span v-if="item.append" slot="append">{{item.append}}</span>
              </format-input>
              <span style="width: 10%; text-align: center;">-</span>
              <format-input
                class="multiple__item"
                v-model="formData[item.end.key]"
                :disabled="item.end.disabled"
                :readonly="item.end.readonly"
                :placeholder="item.end.holder"
                :reg="item.reg"
                :min="formData[item.start.key]">
                <span v-if="item.append" slot="append">{{item.append}}</span>
              </format-input>
            </div>
            <!-- 占位 -->
            <div v-else></div>
          </FormItem>
        </template>
      </div>
      <div class="query-box__btn" v-if="showBtn">
        <i-button type="default" :loading="loading" @click.stop="reset">重置</i-button>
        <i-button type="warning" :loading="loading" @click.stop="query">筛选</i-button>
      </div>
    </Form>
  </div>
</template>

<script>
export default {
  name: "SaasQuery",
  props: {
    // 是否在加载中
    loading: {
      type: Boolean,
      default: false
    },
    auto: {
      type: Boolean,
      default: true
    },
    data: {
      /**
       * 查询 输入框的数据，是一个对象数组
       * {
       *  label: "标题"
       *  slot: 自定义
       *  type: { 类型
       *    text: 文本输入
       *    select： 下拉选择
       *    radio：单选
       *    date：日期
       *    multipleDate: 两个日期
       *  }
       *  data: 下拉框数据
       *  key: 键值，当key为对象时，以下数据存放在start和end对象里面，如：start: {disabled, clearable, holder, readonly}
       *  disabled: 是否可用
       *  readonly: 是否只读
       *  clearable: 是否有清除按钮 仅支持type为select date
       *  holder: 提示文字
       * }
       */
      type: Array,
      required: true
    },
    rules: {              // 验证规则
      type: Object
    },
    showBtn: {            // 是否显示查询按钮
      type: Boolean,
      default: true
    },
    queryClass: {         // 自定义类名 column-3
      type: String,
      default: ""
    }
  },

  data () {
    return {
      backupData: {}, // 备份默认数据
      formData: {},   // 查询表单数据
      dateOptions: {}
    }
  },

  created () {
    this.init();
  },

  mounted () {
    if (this.auto) this.$nextTick(this.query);
  },

  methods: {
    init () {
      let formData = {};
      let data = this.data;
      // 初始化表单默认值
      data.forEach(item => {
        // 判断是否存在start，end对象，如果是，表示该列是多个表单
        if (typeof item.start === "object") {
          formData[item.start.key] = item.start.value || "";
          formData[item.end.key] = item.end.value || "";
        }
        if (typeof item.end === "object") {
          formData[item.start.key] = item.start.value || "";
          formData[item.end.key] = item.end.value || "";
        }

        // 如果是单列，直接赋值
        if (!item.start && !item.end) {
          formData[item.key] = item.value || "";
        }

        // 设置日期最小值
        if (item.type == "multipleDate") {
          this.dateOptions = {};
          this.dateOptions[item.start.key] = {
            disabledDate (date) {
              if (date && item.min) {
                return date.valueOf() < new Date(item.min).getTime() - 24 * 60 * 60 * 1000;
              }
              if (date && item.max) {
                return date.valueOf() > new Date(item.max).getTime();
              }
              return false;
            }
          }
          this.dateOptions[item.end.key] = {
            disabledDate (date) {
              if (date && item.min) {
                return date.valueOf() < new Date(item.min).getTime() - 24 * 60 * 60 * 1000;
              }
              if (date && item.max) {
                return date.valueOf() > new Date(item.max).getTime();
              }
              return false;
            }
          };
        }
      });
      this.formData = formData;
      this.backupData = JSON.parse(JSON.stringify(formData));
    },

    onStartDateChange (item, value) {
      let start = new Date(this.formData[item.start.key]).getTime();
      let end = new Date(this.formData[item.end.key]).getTime();
      if (end <= start) {
        this.formData[item.end.key] = new Date(start);
      }
    },
    onEndDateChange (item, value) {
      let start = new Date(this.formData[item.start.key]).getTime();
      let end = new Date(this.formData[item.end.key]).getTime();
      if (end <= start) {
        this.formData[item.start.key] = new Date(end);
      }
    },

    // 重置表单
    reset () {
      this.formData = JSON.parse(JSON.stringify(this.backupData));
      this.$emit("on-reset");
      this.query();
    },

    query () {
      let formData = JSON.parse(JSON.stringify(this.formData));
      for (let key in formData) {
        if (formData[key] === "") {
          delete formData[key];
        }
      }
      this.$emit("on-query", formData);
    }
  }
}
</script>
