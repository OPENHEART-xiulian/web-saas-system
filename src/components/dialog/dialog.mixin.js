
import '@/styles/components/dialog.less';
export default {
  data () {
    return {
      formData: {},
      rules: {},
      modal: false
    }
  },
  methods: {
    openModal (params) {
      this.modal = true;
      if (params) this.formData = Object.assign(this.formData, params);
    },
    onOk () {
      this.$emit('on-ok', Object.assign({}, this.formData));
    },
    onCancel () {
      this.modal = false;
      if (this.$refs.form) this.$refs.form.resetFields();
      this.$emit('on-cancel');
    }
  }
}
