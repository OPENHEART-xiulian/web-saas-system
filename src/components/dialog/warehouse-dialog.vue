<template>
  <Modal :title="opt ? '编辑' + type : '新增' + type" v-model="modal" 
    class="w-dialog warehouse-dialog">
    <Form ref="form" :model="formData" :rules="rules">
      <FormItem prop="name">
        <Input v-model="formData.name" type="text" :maxlength="6" :placeholder="placeholder" />
      </FormItem>
    </Form>
    <div slot="footer">
      <Checkbox v-model="isDefault" v-if="type === '仓库' && isSetDefault">设为默认仓库</Checkbox>
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
      isDefault: false,
      isSetDefault: false,
      opt: 0,
      id: '',
      placeholder: '输入仓库名称',
      formData: {
        name: ""
      },
      type: '仓库',
      rules: {
        name: [{required: true, message: '仓库名称不能为空', trigger: 'blur'}]
      }
    }
  },

  methods: {
    openModal (opt, type, id, name, isDefault) {
      // opt 0：新增， 1：编辑
      this.$refs.form.resetFields();
      this.isDefault = false;
      this.type = type;
      this.opt = opt;
      this.id = id;
      this.placeholder = '输入' + type + '名称';
      this.rules.name[0].message = type + '名称不能为空';
      if (opt) this.formData.name = name;

      if (isDefault === '1') {
        this.isSetDefault = false; 
        this.isDefault = true;
      } else {
        this.isSetDefault = true; 
        this.isDefault = false;
      }

      this.modal = true;
    },

    onCancel () {
      this.modal = false;
    },

    onOk () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.loading = true;
          let payload = {};
          let params = {};
          if (this.type === '仓库') {
            params = {
              warehouseName: this.formData.name,
              isDefault: this.isDefault ? '1' : '0',
              warehouseId: this.id || undefined
            }
            payload = {
              params: params,
              request: this.opt ? 'warehouseUpdate' : 'warehouseAdd' 
            }
          } else {
            params = {
              shelfName: this.formData.name,
              shelfId: this.id || undefined,
              warehouseId: this.$parent.curWarehouseId 
            }
            payload = {
              params: params,
              request: this.opt ? 'shelfUpdate' : 'shelfAdd' 
            }
          }

          this.$store.dispatch({
            type: 'toOptWarehouse',
            payload
          }).then((res) => {
            if (res.code === '0') {
              this.$Message.success({
                content: this.opt ? '编辑成功' : '新增成功',
                onClose: () => {
                  this.modal = false;
                  this.$parent.init();
                  this.loading = false;
                }
              })
            } else {
              this.loading = false;
              this.$Message.error(res.msg)
            }
          }).catch((err) => {
            this.loading = false;
          })
        }
      })
    }
  }
}
</script>
