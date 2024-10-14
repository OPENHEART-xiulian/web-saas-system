<template>
  <div class="mobile-input">
    <div :class="['mobile-input-item', {focus: focusIndex === index, error: item.error }]" v-for="(item, index) in inputList" :key="index">
      <format-input 
        class="input area"
        :value="item.area"  
        reg="NUMBER" 
        placeholder="区号"
        :maxlength="4" 
        @on-focus="onFocus(index, 'area')" 
        @on-blur="onBlur(index)" 
        @on-change="onChange">
      </format-input>
      <span class="gang">-</span>
      <format-input 
        class="input value" 
        :value="item.value" 
        reg="NUMBER" 
        placeholder="电话号码"
        :maxlength="11" 
        @on-focus="onFocus(index, 'value')" 
        @on-blur="onBlur(index)"
        @on-change="onChange">
      </format-input>
      <div class="error-tip" v-if="item.error">{{item.error}}</div>
    </div>
  </div>
</template>

<script>
// PHONE_NUMBER
import { verify } from "@/assets/js/utils";
export default {
  props: {
    value: {
      type: Array,
      default () {
        return []
      }
    }
  },
  data () {
    return {
      isValid: false,
      focusIndex: "",
      key: "",
      inputList: []
    }
  },

  watch: {
    value (to) {
      if (this.inputList.length) {
        return;
      }
      let newList = [];
      let len = to.length;
      for (let i = 0; i < len; i++) {
        let item = to[i];
        let obj = {
          area: "",
          value: "",
          error: ""
        }
        let arr = item.split("-");
        if (arr.length === 1) {
          obj.value = arr[0];
        } else {
          obj.area = arr[0];
          obj.value = arr[1];
        }
        newList.push(obj);
      }
      for (let i = 0; i < 3 - len; i++) {
        newList.push({
          area: "",
          value: "",
          data: "",
          error: ""
        });
      }
      this.inputList = newList;
    },
  },

  created () {
  },

  methods: {
    onBlur (index) {
      this.focusIndex = "";
      this.key = "";
      this.validate();
      let values = this.getValues();
      this.$emit("input", values);
      this.$emit("on-change", values, index);
    },

    getValues ()  {
      let values = [];
      for (let i = 0; i < this.inputList.length; i++) {
        let item = this.inputList[i];
        if (item.data) values.push(item.data);
      }
      return values;
    },

    validate () {
      let isValid = true;
      for (let i = 0; i < this.inputList.length; i++) {
        let item = this.inputList[i];
        let value = item.area;
        if (value) {
          value += "-" + item.value;
        } else {
          value = item.value;
        }
        item.data = value;
        if (verify("PHONE_NUMBER", value) || !value) {
          item.error = "";
        } else {
          isValid = false;
          item.error = "电话号码格式不正确";
        }
      }
      this.isValid = isValid;
      return isValid;
    },

    onFocus (index, key) {
      this.focusIndex = index;
      this.key = key;
    },
    onChange (e) {
      this.inputList[this.focusIndex][this.key] = e.target.value;
    },
  }
}
</script>

<style lang="less">
  .mobile-input {
    display: flex;
    // 两个输入框组成一个输入框，一部分是区号，一部分是号码
    &-item {
      position: relative;
      display: flex;
      flex-grow: 1;
      border-radius: 3px;
      margin-left: 20px;
      border: 1px solid #E5E2DF;
      transition: border 0.2s ease-in-out, background 0.2s ease-in-out, -webkit-box-shadow 0.2s ease-in-out;
      &:hover {
        border-color: #ff9933;
      }
      &.focus {
        border-color: #ff9933;
        outline: 0;
        box-shadow: 0 0 0 2px rgba(255, 128, 0, 0.2);
      }
      &.error {
        border: 1px solid #F22D00;
        &.focus {
          box-shadow: 0 0 0 2px rgba(242, 45, 0, 0.2);
        }
      }
      &:first-child {
        margin-left: 0;
      }
      .input {
        &.area {
          width: 75px;
        }
        .ivu-input {
          height: 30px;
          min-height: 30px;
          border-color: transparent;
          &:hover {
            border-color: transparent;
          }
          &:focus {
            border-color: transparent;
            box-shadow: none;
          }
        }
      }

      .error-tip {
        position: absolute;
        top: 100%;
        left: 0;
        line-height: 1;
        padding-top: 6px;
        color: #F22D00;
      }
    }
  }
</style>
