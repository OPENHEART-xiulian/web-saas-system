// 新建供应商弹窗
<template>
  <Modal title="新建供应商" v-model="modal"
    @on-cancel="cancel" 
    class="w-dialog add-supplier-dialog"
    width="700">
    <Form ref="form" :model="formData" :rules="rules" label-position="top">
      <div class="item-box">
        <FormItem label="供应商编码" prop="supplierCode">
          <Input v-model="formData.supplierCode" disabled/>
        </FormItem>
        <FormItem label="供应商名称" prop="supplierName">
          <Input v-model="formData.supplierName" 
            :maxlength="15"
            placeholder="输入供应商名称" />
        </FormItem>
      </div>
      <div class="item-box">
        <FormItem label="联系人" prop="contact">
        <Input v-model="formData.contact"/>
      </FormItem>
      <FormItem label="联系电话" prop="tel">
        <Input v-model="formData.tel"/>
      </FormItem>
      </div>
      <div class="item-box">
        <FormItem label="供应商分类" prop="supplierType">
          <Select class="supplier-width"
            v-model="formData.supplierType">
            <Option v-for="(item, index) in supplierCate"
              :key="index"
              :value="item.value">{{ item.label }}</Option>
          </Select>
        </FormItem>
        <FormItem label="所在地区">
          <city-select class="supplier-width" :city-data="citys" @on-change="cityChange"></city-select>
        </FormItem>
      </div>
      <div class="item-box">
        <FormItem label="详细地址" prop="address">
          <Input v-model="formData.address" />
        </FormItem>
        <FormItem label="电子邮箱" prop="email">
          <Input v-model="formData.email"/>
        </FormItem>
      </div>
      <div class="item-box">
        <FormItem label="备注" prop="remark">
          <Input type="textarea" v-model="formData.remark"/>
        </FormItem>
        <FormItem></FormItem>
      </div>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click.native.stop="cancel">取消</Button>
      <Button type="error" size="large" 
        :loading="btnLoading"
        @click.native.stop="submit">确定</Button>
    </div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import CitySelect from '@/components/city-select';
import { supplierCate } from '@/store/json/default';
import { formVerify } from '@/assets/js/utils.js';
import '@/styles/components/dialog.less';

export default {
  data () {
    return {
      supplierCate,
      modal: false,
      btnLoading: false,
      citys: {},
      formData: {
        supplierCode: "",
        supplierName: "",
        tel: "",
        email: ""
      },
      rules: {
        supplierCode: [
          { required: true, message: '请输入供应商编码', trigger: 'blur' }
        ],
        supplierName: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        tel: [
          { 
            trigger: 'blur',
            reg: 'PHONE_NUMBER',
            formatTip: '请输入正确的联系电话',
            validator: formVerify.format
          }
        ],
        email: [
          {
            trigger: 'blur',
            reg: 'EMAIL',
            formatTip: '请输入正确的邮箱',
            validator: formVerify.format
          }
        ]
      }
    }
  },

  computed: {
    ...mapGetters({
      suppliercode: 'getSuppliercode'
    }),
  },

  watch: {
    suppliercode (code) {
      if (code) {
        this.formData.supplierCode = code.supplierCode;
      }
    }
  },

  methods: {
    openModal () {
      this.$refs.form.resetFields();
      this.$store.dispatch('toGetSuppliercode');
      this.modal = true;
    },

    cancel () {
      this.modal = false;
      this.$emit('on-cancel');
    },

    cityChange (object) {
      this.formData.provinceCode = object.provinceCode;
      this.formData.cityCode = object.cityCode;
      this.formData.countyCode = object.countyCode;
    },

    submit () {
      this.$refs.form.validate( bol => {
        if (bol) {
          this.btnLoading = true;
          const formData = Object.assign({}, this.formData);

          const payload = {
            formData: formData,
            request: 'supplierAdd'
          }

          this.$store.dispatch({
            type: 'toOptSupplier',
            params: payload
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: '添加成功',
                onClose: () => {
                  this.modal = false;
                  this.btnLoading = false;
                }
              })
            } else {
              if (res.code === '107120') {
                this.$Message.warning(res.msg);
              } else {
                this.$Message.error('添加失败');
              }
              this.btnLoading = false;
            }
          }).catch(err => {
            this.btnLoading = false;
          })
        }
      })
    }
  },

  components: { CitySelect }
}
</script>
