<template>
  <Modal title="新增角色" v-model="modal" 
    class="w-dialog role-dialog">
    <Form ref="form" :model="formData" :rules="rules">
      <FormItem prop="roleName">
        <Input v-model="formData.roleName" type="text" placeholder="输入角色名称" />
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="onCancel">取消</Button>
      <Button type="error" size="large" 
        @click.native.stop="onOk"
        :loading="loading">确定
      </Button>
    </div>
  </Modal>
</template>

<script>
  import '@/styles/components/dialog.less';
  export default {
    data () {
      return {
        modal: false,
        loading: false,
        formData: {},
        rules: {
          roleName: [{required: true, message: '角色名称不能为空', trigger: 'blur'}]
        }
      }
    },

    methods: {
      openModal () {
        this.$refs.form.resetFields();
        this.modal = true;
      },

      onCancel () {
        this.modal = false;
      },

      onOk () {
        this.$refs.form.validate((valid) => {
          if (valid) {
            this.loading = true;
            this.$store.dispatch({
              type: 'toAddRole',
              params: this.formData
            }).then((res) => {
              if (res.code === '0') {
                this.$Message.success({
                  content: '添加成功',
                  onClose: () => {
                    this.modal = false;
                    this.loading = false;
                    this.$emit('add-success');
                  }
                });
              } else {
                this.loading = false;
                if (res.code === '107084') {
                  this.$Message.warning('你已添加过重复的角色罗');
                } else this.$Message.warning('添加失败，请稍后重试');
              }
            }).catch((err) => {
              this.loading = false;
              this.$store.commit('REQUEST_ERROR', { err });
            })
          }
        })
      }
    }
  }
</script>
