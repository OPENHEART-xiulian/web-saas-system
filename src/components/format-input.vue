<!-- 限制输入格式的input -->
<template>
  <div class="m-input">
    <i
      v-if="lIcon"
      :class="['iconfont', 'left', lIcon]"
    ></i>
    <i
      v-if="rIcon"
      :class="['iconfont', 'right', rIcon]"
    ></i>
    <i-input
      ref="input"
      :value="inputValue"
      autocomplete="new-password"
      :spellcheck="false"
      :type="type"
      :placeholder="placeholder"
      :maxlength="Number(maxlength)"
      :disabled="disabled"
      :readonly="readonly"
      @on-change="onChange"
      @on-focus="onFocus"
      @on-blur="onBlur"
      @on-enter="onEnter"
      :class="[{'left-icon': lIcon}, {'right-icon': rIcon}]"
    >
      <slot
        name="append"
        slot="append"
      ></slot>
    </i-input>
  </div>
</template>

<script>
import '@/styles/components/input.less'
export default {
  name: 'm-input',
  props: {
    prelen: {
      type: [String, Number],
      default: 2
    },
    type: {
      type: String,
      default: 'text'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    min: [String, Number],
    max: [String, Number],
    value: [String, Number],
    placeholder: String,
    reg: String,
    maxlength: [Number, String],
    lIcon: String,
    rIcon: String
  },
  data () {
    return {
      inputValue: '',
      regExp: '',
      regexps: {
        NUMBER: /[\D]/g, // 替换非数字
        PRECISION: /[^\d\.]/g
      }
    }
  },
  watch: {
    value (to) {
      this.inputValue = to
    }
  },
  mounted () {
    this.inputValue = this.value
    if (this.$props.reg) {
      this.setReg()
      // 如果找到验证规则里面的内容， 报错 因为验证规则是为了去除规则里面的内容
      // if (this.inputValue !== '' && this.regExp.test(this.inputValue)) {
      //   try {
      //     throw new Error('It can only be anything other than ' + this.reg);
      //   } catch (error) {
      //     throw new Error(error);
      //   }
      // }
    }

    let _this = this.$refs.input
    _this.handleInput = this.handleInput
  },
  methods: {
    // 设置验证规则
    setReg () {
      let regArr = String(this.regexps[this.$props.reg])
        .substr(1)
        .split('/')
      this.regExp = new RegExp(regArr[0], regArr[1])
    },
    focus () {
      this.$refs.input.focus()
    },
    onBlur (e) {
      if (this.reg === 'PRECISION' || this.reg === 'NUMBER') {
        // if (this.min !== undefined && this.min !== null && e.target.value === '') {
        if (e.target.value === '' || Number(e.target.value) < this.min) {
          e.target.value = this.min || ''
        }

        if (
          this.max !== undefined &&
          this.max !== null &&
          Number(e.target.value) > Number(this.max)
        ) {
          e.target.value = this.max || ''
        }
        // }
      }
      this.$emit('input', e.target.value)
      this.$emit('on-blur', e)
    },
    onFocus (e) {
      this.$emit('on-focus', e)
    },
    onEnter (e) {
      this.$emit('on-enter', e)
    },
    onChange (e) {
      this.$emit('input', e.target.value)
      this.$emit('on-change', e)
    },
    // 修改 iview input 中的onchange
    handleInput (e) {
      if (this.type === 'text' && this.regExp !== '') {
        e.target.value = e.target.value.replace(this.regExp, '')
      }

      if (this.reg === 'NUMBER') {
        if (
          this.max !== undefined &&
          this.max !== null &&
          Number(e.target.value) > Number(this.max)
        ) {
          e.target.value = this.max || ''
        }

        if (
          this.min !== undefined &&
          this.min !== null &&
          e.target.value !== '' &&
          Number(e.target.value) < Number(this.min)
        ) {
          e.target.value = this.min || ''
        }
      }

      // 截取精度
      if (this.reg === 'PRECISION') {
        let val = e.target.value.split('.')
        if (val.length > 1) {
          e.target.value =
            (val[0] === '' ? 0 : Number(val[0])) +
            '.' +
            val[1].slice(0, this.prelen)
        } else {
          e.target.value = val[0]
        }
      }

      let _this = this.$refs.input
      let value = e.target.value
      if (_this.number) { value = Number.isNaN(Number(value)) ? value : Number(value) }
      _this.$emit('input', value)
      _this.setCurrentValue(value)
      _this.$emit('on-change', e)
    }
  }
}
</script>
