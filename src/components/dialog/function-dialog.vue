// 车辆功能检查问题弹窗
<template>
  <Modal title="车辆功能检查问题" v-model="modal" 
    @on-cancel="cancel"
    class="w-dialog function-dialog"
    width="600">
    <Form ref="formData" :model="formData" 
      label-position="top" :rules="ruleValidate">
      <FormItem label="问题" prop="term">
        <CheckboxGroup v-model="formData.term">
          <Checkbox v-for="item in term"
            :label="item.value"
            :key="item.value">{{ item.label }}
          </Checkbox>
        </CheckboxGroup>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
      <Button type="error" size="large" @click.native.stop="confirm">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { term, getLabel } from '@/store/json/default';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      modal: false,
      formData: {
        term: [],
      },
      term,
      ruleValidate: {
        term: [
          { required: true, type: 'array', message: '问题不能为空', trigger: 'change' }
        ],
      },
      callback: null,
      item: null
    }
  },

  methods: {
    openModal (callback, item, data) {
      this.$refs.formData.resetFields();
      this.formData.term = data;
      this.item = item;
      this.callback = callback;
      this.modal = true;
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    getStr (arr) {
      let strArr = [];
      arr.forEach(item => {
        strArr.push(getLabel(item, term));
      });
      return strArr.join('、');
    },

    confirm () {
      this.$refs.formData.validate((valid) => {
        if (valid) {
          this.callback(this.getStr(this.formData.term), this.item.value);
          this.$emit('select-success', this.formData);
          this.modal = false;
        }
      })
    }
  }
}
</script>
