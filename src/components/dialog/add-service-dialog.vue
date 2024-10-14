// 新建项目弹窗
<template>
  <Modal title="新建项目" v-model="modal"
    @on-cancel="cancel" 
    class="w-dialog add-service-dialog"
    width="600">
    <Form ref="form" :model="formData" :rules="rules" label-position="top">
      <div class="item-box">
        <FormItem label="项目名称" prop="serviceName">
          <Input v-model="formData.serviceName" 
            :maxlength="30"
            placeholder="输入项目名称" />
        </FormItem>
        <FormItem label="项目类别" prop="code">
          <Cascader :data="codeData" v-model="formData.code"  placeholder="选择项目类别"></Cascader>
        </FormItem>
      </div>
      <div :class="['item-box', {'half': formData.pricingType !== 'A'}]">
        <FormItem label="定价方式" prop="pricingType">
          <Select v-model="formData.pricingType">
            <Option v-for="item in pricingMode" :value="item.value" :key="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="项目价格" prop="cost"
           v-if="formData.pricingType === 'A'">
          <i-input v-model="formData.cost" 
            placeholder="输入数字，如：100">
            <span slot="append">元</span>
          </i-input>
        </FormItem>
      </div>
      <div class="item-box" v-if="formData.pricingType === 'B'">
        <FormItem label="标准工时" prop="hours">
          <i-input v-model="formData.hours" 
            placeholder="输入数字，如：1">
            <span slot="append">小时</span>
          </i-input>
        </FormItem>
        <FormItem label="工时单价" prop="price">
          <i-input v-model="formData.price" 
            placeholder="输入数字，如：1">
            <span slot="append">元/小时</span>
          </i-input>
        </FormItem>
      </div>
      <div class="item-box">
        <FormItem label="成本价格" prop="tPrice">
          <i-input v-model="formData.tPrice" 
            placeholder="输入数字，如：100">
            <span slot="append">元</span>
          </i-input>
        </FormItem>
        <FormItem label="备注" prop="remark">
          <Input v-model="formData.remark" 
            placeholder="输入备注" />
        </FormItem>
      </div>
    </Form>
    <div slot="footer">
      <Checkbox class="add-check" v-model="isCheck">同时添加到已选项目</Checkbox>
      <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
      <Button type="error" size="large" 
        :loading="btnLoading"
        @click.native.stop="submit">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import { pricingMode } from '@/store/json/default';
import { formVerify } from '@/assets/js/utils.js';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      modal: false,
      isCheck: true, // 是否同时添加到已选项目
      pricingMode,
      btnLoading: false,
      formData: {  
        pricingType: 'A'
      },
      rules: {
        serviceName: [
          { 
            required: true, 
            message: '服务名称不能为空', 
            trigger: 'blur',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              this.$store.dispatch({
                type: 'checkServiceName',
                params: {
                  serviceName: value
                }
              }).then( res => {
                if (res.code !== '0') {
                  rules.message = '该服务名称已存在';
                  return callback(rules.message);
                }
                callback();
              }).catch(err => {
                callback();
              })
            }
          },
        ],
        code: [
          { required: true, message: '请选择项目类别', trigger: 'change', type: 'array' }
        ],
        pricingType: [
          { required: true, message: '请选择作业定价', trigger: 'change' }
        ],
        cost: [
          { required: true, message: '请输入项目价格', trigger: 'blur' },
          { 
            trigger: 'blur',
            reg: 'NUMBER_SECOND',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format
          }
        ],
        hours: [
          { required: true, message: '请输入标准工时', trigger: 'blur' },
          { 
            trigger: 'blur',
            reg: 'NUMBER',
            formatTip: '请输入正确的数字',
            validator: formVerify.format
          }
        ],
        price: [
          { required: true, message: '请输入工时单价', trigger: 'blur' },
          { 
            trigger: 'blur',
            reg: 'NUMBER_SECOND',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format
          }
        ],
        tPrice: [
          { 
            trigger: 'blur',
            formatTip: '请输入正确的数字，至多保留2位小数',
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (value && !/^\d+\.?\d{0,2}$/.test(value)) {
                callback(rules.formatTip);
              } else {
                callback();
              }
            }
          }
        ]
      },
      codeData: []
    }
  },

  watch: {
    serviceCategory (value) {
      if (value) {
        this.codeData = value;
        this.codeData.forEach((item, index) => {
          item.value = item.code;
          item.label = item.name;
          if (item.children) {
            item.children.forEach(citem => {
              citem.value = citem.code;
              citem.label = citem.name;
              if (citem.children) {
                citem.children.forEach(titem => {
                  titem.value = titem.code;
                  titem.label = titem.name;
                })
              }
            })
          }
        })
      }
    }
  },

  methods: {
    openModal () {
      this.formData = {  
        pricingType: 'A'
      }
      this.$refs.form.resetFields();
      this.modal = true;
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    submit () {
      this.$refs.form.validate( bol => {
        if (bol) {
          this.btnLoading = true;

          const formData = Object.assign({}, this.formData);
          if (formData.code) formData.code = formData.code.pop();
          if (formData.pricingType === 'A') {
            delete formData.hours;
            delete formData.price;
          } else {
            delete formData.cost;
          }

          this.$store.dispatch({
            type: 'addService',
            params: formData
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: '添加成功',
                onClose: () => {
                  this.modal = false;
                  this.btnLoading = false;
                  this.$emit('add-success', res.data, this.isCheck);
                }
              })
            } else {
              this.$Message.error('添加失败');
              this.btnLoading = false;
            }
          }).catch(err => {
            this.btnLoading = false;
          })
        }
      })
    }
  },
  computed: {
    ...mapGetters({
      serviceCategory: 'getServiceCateList'
    }),
  }
}
</script>
