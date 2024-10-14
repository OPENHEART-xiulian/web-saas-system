<!-- 车牌选择组件 -->
<template>
  <div class="plate-no">
    <select-input :array="textArray" v-model="text" @on-change="change"></select-input>
    <select-input :array="letterArray" v-model="letter" @on-change="change"></select-input>
    <i-input ref="plateNo" v-model="plateNo" @on-change="inputChange" @on-blur="inputBlur" :maxlength="6" placeholder="输入车牌号"></i-input>
    <Checkbox v-if="showCheck" v-model="isSelect" @on-change="radioChange">车辆未上牌</Checkbox>
  </div>
</template>
<script>
import '@/styles/components/plate-no.less';
import SelectInput from './select-input';

export default {
  components: { SelectInput },
  props: {
    value: {
      type: String
    },
    showCheck: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      timer: null,
      userInfo: null,
      text: '粤',
      letter: 'A',
      plateNo: '',
      isSelect: false,
      textArray: [
        '鲁', '皖', '澳', '京', '闽', '甘', '粤', '桂', '贵', '琼', '冀', '豫', '黑', '鄂', '湘', '吉', '苏', '赣', '辽', '蒙', '宁', 
        '青', '晋', '陕', '沪', '川', '台', '津', '藏', '港', '新', '云', '浙', '渝'
      ],
      letterArray: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    }
  },
  watch: {
    value (to) {
      if (to) {
        this.updatePlateNo(to)
      } else {
        this.text = '粤';
        this.letter = this.letterArray[0];
        this.plateNo = '';
      }
    },
  },
  mounted () {
    if (this.value) this.updatePlateNo(this.value);
  },
  methods: {
    updatePlateNo (plateNo) {
      this.text = plateNo.substr(0, 1);
      this.letter = plateNo.substr(1, 1);
      this.plateNo = plateNo.substr(2);
      if (this.plateNo !== '00000') this.isSelect = false;
      else this.isSelect = true;
      this.plateNo = this.plateNo.toUpperCase();
      this.$emit('input', this.text + this.letter + this.plateNo);
    },
    change () {
      this.plateNo = this.plateNo.toUpperCase();
      if (this.plateNo !== '') this.$emit('input', this.text + this.letter + this.plateNo);
    },
    inputChange () { // 输入框内容不为五个0， 将选择按钮选中状态去掉
      if (this.plateNo !== '00000') this.isSelect = false;
      else this.isSelect = true;
    },  
    inputBlur () {
      this.plateNo = this.plateNo.toUpperCase();
      if (this.plateNo === '') {
        this.$emit('input', '');
        return
      }
      this.$emit('input', this.text + this.letter + this.plateNo);
    },
      // 选择未上牌
    radioChange () {
      if (this.isSelect) {
        this.plateNo = '00000'
        this.$refs.plateNo.focus();
        this.plateNo = this.plateNo.toUpperCase();
        this.$emit('input', this.text + this.letter + this.plateNo);
      } else {
        this.plateNo = ''
        this.$emit('input', '');
      };
    }
  }
}
</script>
