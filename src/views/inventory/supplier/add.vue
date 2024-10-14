<template>
  <!-- 新增编辑供应商 -->
  <div class="supplier-add add-page">
    <saas-bread :title="breadName"></saas-bread>
    <Form ref="form" 
      :model="formData" 
      :rules="rules" 
      label-position="right"
      :label-width="125"
      class="w-form">
      <FormItem label="供应商编码" prop="supplierCode">
        <Input v-model="formData.supplierCode" disabled/>
      </FormItem>
      <FormItem label="供应商名称" prop="supplierName">
        <Input v-model="formData.supplierName"
          :maxlength="15"/>
      </FormItem>
      <FormItem label="联系人" prop="contact">
        <Input v-model="formData.contact"/>
      </FormItem>
      <FormItem label="联系电话" prop="tel">
        <Input v-model="formData.tel"/>
      </FormItem>
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
      <FormItem label="详细地址" prop="address">
        <Input v-model="formData.address" />
      </FormItem>
      <FormItem label="电子邮箱" prop="email">
        <Input v-model="formData.email"/>
      </FormItem>
      <FormItem label="备注" prop="remark">
        <Input type="textarea" v-model="formData.remark"/>
      </FormItem>
    </Form>
    <bottom-submit 
      @on-cancel="$router.go(-1)" 
      @on-confirm="submit"
      :loading="btnLoading">
    </bottom-submit>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import CitySelect from '@/components/city-select';
import { formVerify } from '@/assets/js/utils.js';
import { supplierCate } from '@/store/json/default';
import '@/styles/views/inventory/supplier-form.less';
import '@/styles/components/form.less';

export default {
  components: { CitySelect },
  data () {
    return {
      supplierCate,
      id: this.$route.params.id,
      breadName: '新增供应商',
      btnLoading: false,
      formData: {
        supplierCode: ''
      },
      citys: {},
      rules: {
        supplierCode: [
          { required: true, message: '请输入供应商编码', trigger: 'blur' }
        ],
        supplierName: [
          { required: true, message: '请输入供应商名称', trigger: 'blur' }
        ],
        contact: [
          // { required: true, message: '请输入联系人', trigger: 'blur' }
        ],
        tel: [
          { 
            // required: true, 
            // message: '请输入联系电话', 
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

  mounted () {
    if (this.$route.params.id !== 'create') {
      this.breadName = '编辑供应商'
      this.getDetail();
    } else {
      this.$store.dispatch('toGetSuppliercode');
    }
  },

  computed: {
    ...mapGetters({
      detailData: 'getSupplierDetail',
      suppliercode: 'getSuppliercode'
    }),
  },

  watch: {
    suppliercode (code) {
      if (code) {
        this.formData.supplierCode = code.supplierCode;
      }
    },

    detailData (to) {
      if (to) {
        this.formData = to;
        this.citys = {};
        this.citys.provinceCode = to.provinceCode;
        this.citys.cityCode = to.cityCode;
        this.citys.countyCode = to.countyCode;
      }
    }
  },

  methods: {
    getDetail () {
      this.$store.dispatch({
        type: 'toGetSupplierDetail',
        params: {
          supplierId: this.id
        }
      })
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
          let request = 'supplierAdd';
          let tip = '添加';
          const formData = Object.assign({}, this.formData);

          if (this.$route.params.id !== 'create') {
            request = 'supplierUpdate';
            tip = '更新';
          }

          const payload = {
            formData: formData,
            request: request
          }

          this.$store.dispatch({
            type: 'toOptSupplier',
            params: payload
          }).then( res => {
            if (res.code === '0') {
              this.$Message.success({
                content: tip + '成功',
                onClose: () => {
                  // this.$router.push('/inventory/supplier/detail');
                  this.$router.go(-1);
                  this.btnLoading = false;
                }
              })
            } else {
              if (res.code === '107120') {
                this.$Message.warning(res.msg);
              } else {
                this.$Message.error(tip + '失败');
              }
              this.btnLoading = false;
            }
          }).catch(err => {
            this.btnLoading = false;
          })
        }
      })
    }
  }
}
</script>
