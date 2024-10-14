// 施工完成弹窗
<template>
  <Modal title="施工完成" 
    v-model="modal" 
    @on-cancel="onCancel" 
    @on-ok="onOk"
    class="w-dialog construction-dialog"
    width="600">
    <div class="order-detail">
      <span>车牌号码：{{ tableItem.plateNo }}</span>
      <span>进厂里程：{{ tableItem.deliveryMileage }}KM</span>
    </div>
    <Form ref="form" :model="formData" :rules="rules" label-position="left">
      <FormItem class="mar-r" label="出厂里程" :label-width="75" prop="factoryMileage">
        <i-input v-model="formData.factoryMileage" placeholder="输入出厂里程">
          <span slot="append">KM</span>
        </i-input>
      </FormItem>
      <FormItem label="完成时间" :label-width="65" prop="finishDate">
        <DatePicker type="datetime" 
          placeholder="选择时间" 
          style="width: 180px"
          v-model="formData.finishDate"
          :clearable="false"
          :editable="false"
          :options="timeOptions"
          @on-clear="clearTime">
        </DatePicker>
      </FormItem>
      <div class="order-detail">质保方案</div>
      <FormItem>
        <RadioGroup v-model="way" @on-change="radioChange">
          <Radio label="3">一级维护/小修/专项修理
            <i v-if="way === '3'" class="ivu-icon ivu-icon-ios-checkmark-empty check-icon"></i>
          </Radio>
          <Radio label="2">二级维护
            <i v-if="way === '2'" class="ivu-icon ivu-icon-ios-checkmark-empty check-icon"></i>
          </Radio>
          <Radio label="1">整车/总成修理
            <i v-if="way === '1'" class="ivu-icon ivu-icon-ios-checkmark-empty check-icon"></i>
          </Radio>
        </RadioGroup>
      </FormItem>
      <div class="warranty" style="margin-bottom: 15px;">
        <FormItem :label-width="0" prop="warranty">
          <span>质量保证时间</span>
          <i-input v-model="formData.warranty" placeholder="30">
            <span slot="append">日</span>
          </i-input>
        </FormItem>
        <FormItem :label-width="0" 
          prop="warrantyMileage" 
          class="warranty-mileage">
          <span class="text-mar">质量保证里程</span>
          <i-input v-model="formData.warrantyMileage" placeholder="5000">
            <span slot="append">KM</span>
          </i-input>
        </FormItem>
      </div>
      <FormItem label="保养到期时间" :label-width="100">
        <DatePicker type="date" 
          placeholder="选择时间" 
          style="width: 180px"
          v-model="formData.maintainExpDate"
          :clearable="false"
          :editable="false"
          :options="timeOptions2"
          @on-clear="clearTime">
        </DatePicker>
      </FormItem>
      <FormItem label="建议保养里程" :label-width="100" prop="adviceMileage" v-if="isWorkOrder">
        <format-input v-model="formData.adviceMileage" :min="0" reg="PRECISION">
          <span slot="append">KM</span>
        </format-input>
      </FormItem>
    </Form>
    <div slot="footer">
      <i-button type="text" size="large" @click="onCancel">取消</i-button>
      <i-button type="primary" 
        size="large" 
        :loading="btnLoading"
        @click="submit(tableItem.statementNo)">确定</i-button>
    </div>
  </Modal>
</template>

<script>
import mixins from './dialog.mixin.js';
import { formVerify, verify, formatTime } from '@/assets/js/utils.js';

export default {
  mixins: [mixins],
  props:{
    isWorkOrder: false
  },
  data () {
    let _this = this;
    const adValidator = (rules, value, callback) => {
  
      if(Number(_this.formData.adviceMileage)<Number(_this.formData.factoryMileage) || 
          Number(_this.formData.adviceMileage)===Number(_this.formData.factoryMileage)
      ){
        rules.message = '*车辆已保养？如已保养请变更建议保养里程';
        return callback(rules.message);
      }
      
      callback();
      
    };
    return {
      tableItem: {},
      formData: {
        maintainExpDate: "",
        finishDate: new Date(), // 完成时间
        factoryMileage: '', // 出厂里程
        warranty: 10, // 质保时间
        warrantyMileage: 2000, // 质保里程
        adviceMileage: -1
      },
      way: '3', // 质保方案
      btnLoading: false,
      timeOptions: {
        disabledDate (date) {
          return date && date.valueOf() > Date.now();
        }
      },
      timeOptions2: {
        disabledDate (date) {
          return date && date.valueOf() < Date.now();
          // return date && date.valueOf() < Date.now() - 24 * 60 * 60 * 1000;
        }
      },
      rules: {
        factoryMileage: [
          { required: true, message: '送修里程不能为空', trigger: 'blur' },
          { 
            trigger: 'blur',
            reg: 'NUMBER',
            formatTip: '请输入正确的里程数',
            validator: (rules, value, callback) => {
              if (Number(value) < Number(_this.tableItem.deliveryMileage)) {
                rules.message = '出厂里程必须大于等于进厂里程';
                return callback(rules.message);
              }
              // 格式错误的时候 提示错误
              if (!verify(rules.reg, value)) {
                rules.message = rules.formatTip;
                return callback(rules.message);
              }
              callback();
            }
          }
        ],
        warranty: [
          { 
            trigger: 'change',
            reg: 'NUMBER',
            formatTip: '请输入正确的天数',
            validator: formVerify.format
          }
        ],
        warrantyMileage: [
          { 
            trigger: 'change',
            reg: 'NUMBER',
            formatTip: '请输入正确的里程数',
            validator: formVerify.format
          }
        ],
        adviceMileage:[
          { 
            trigger: 'blur',
            reg: 'NUMBER',
            validator: adValidator
          }
        ]
      },
      isEditAd: false
    }
  },

  methods: {
    radioChange (value) {
      switch (value) {
        case '1':
          this.formData.warranty = 100;
          this.formData.warrantyMileage = 20000;
          break;
        case '2':
          this.formData.warranty = 30;
          this.formData.warrantyMileage = 5000;
          break;
        case '3':
          this.formData.warranty = 10;
          this.formData.warrantyMileage = 2000;
          break;
        default:
          break;
      }
    },
    formatTime,
    submit (statementNo) {
      this.$refs.form.validate( valid => {
        if(this.isEditAd){
          if (valid) {
            this.submitFn(statementNo)
          }
        }else{
          if (this.formData.factoryMileage) {
            this.submitFn(statementNo)
          }
        }
      })
    },

    submitFn(statementNo){
      this.btnLoading = true;
      const form = JSON.parse(JSON.stringify(this.formData));
      form.statementNo = statementNo;
      form.finishDate = this.formatTime(form.finishDate || new Date(), 'yyyy-MM-dd HH:mm:ss');
      form.adviceMileage = Number(form.adviceMileage) || 0
      if (form.maintainExpDate) form.maintainExpDate = this.formatTime(form.maintainExpDate, 'yyyy-MM-dd');
      if (form.warranty) form.warranty = form.warranty.toString();
      if (form.warrantyMileage) form.warrantyMileage = form.warrantyMileage.toString();
      this.$store.dispatch({
        type: 'toFinishWork',
        params: form
      }).then((res) => {
        this.btnLoading = false;
        if (res.code === '0') {
          this.$Message.success('操作成功');
          this.modal = false;
          this.$emit('on-ok', 1)
        } else {
          if (res.code === '107099') {
            this.$Message.warning(res.msg);
          }
        }
      }).catch((err) => {
        this.btnLoading = false;
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    openModal (data) {
      if(Number(data.adviceMileage) === -1){
        this.isEditAd = true
      }
      this.modal = true;
      this.tableItem = data;
      this.formData.factoryMileage = data.deliveryMileage;
      this.formData.adviceMileage = Number(data.adviceMileage) === -1? 0:data.adviceMileage
      this.way = '3';
      this.radioChange('3');
      this.formData.finishDate = new Date();
      const startDate = new Date(data.deliveryDate).valueOf() - 86399999;
      this.timeOptions = {
        disabledDate (date) {
          return date && ((date.valueOf() > Date.now()) || (date.valueOf() < startDate));
        }
      }
    },

    clearTime () {
      this.formData.finishDate = new Date();
    }
  }
}
</script>
