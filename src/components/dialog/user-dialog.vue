<template>
  <Modal title="健康档案账号绑定" 
    v-model="modal" 
    :mask-closable="false"
    @on-cancel="onCancel"
    class="w-dialog user-dialog">
    <Alert type="warning" show-icon>绑定账号后，维修记录将自动上传到汽车维修电子健康档案系统。</Alert>
    <Form ref="form" :model="formData" :rules="rules" label-position="left" :label-width="60">
      <FormItem label="区域">
        <div class="area-container">
          <Select v-model="formData.provinceCode" @on-change="provinceChange">
            <Option v-for="(item) in provinceList" :value="item.value" :key="item.value">{{ item.name }}</Option>
          </Select>
          <Select v-model="formData.cityCode" v-if="cityList.length">
            <Option v-for="(item) in cityList" :value="item.value" :key="item.value">{{ item.name }}</Option>
          </Select>
        </div>
      </FormItem>
      <FormItem label="账号" prop="eRecordAccount">
        <Input type="text" v-model="formData.eRecordAccount"/>
      </FormItem>
      <FormItem label="密码" prop="eRecordPwd" style="margin-bottom: 20px">
        <Input :type="type" @on-focus="type='password'" v-model="formData.eRecordPwd"/>
      </FormItem>
    </Form>
    <div slot="footer">
      <Button type="text" size="large" @click.stop="onCancel">取消</Button>
      <Button type="error" size="large" @click.stop="submit" :loading="loading">确定</Button>
    </div>
  </Modal>
</template>

<script>
  import '@/styles/components/dialog.less';
  import { formVerify, storage } from '@/assets/js/utils';
  import { BUSINESS_CITY_DATA } from '@/store/mutation-types';
  export default {
    data () {
      return {
        busindessCityData: {},
        modal: false,
        loading: false,
        token: '',
        type: "text",
        provinceList: [],
        cityList: [],
        formData: {
          eRecordAccount: '',
          eRecordPwd: '',
          provinceCode: "",
          cityCode: ""
        },
        rules: {
          eRecordAccount: [
            {
              required: true, 
              message: '请输入正确的道路运输许可证号或手机号码或登录ID或备案号', 
              // reg: 'USERNAME',
              // formatTip: '请输入正确的道路运输经营许可证号或手机号',
              trigger: 'blur', 
              // validator: formVerify.format 
            }
          ],
          eRecordPwd: [
            {
              required: true, 
              message: '请输入密码',
              trigger: 'blur'
            }
          ]
        }
      }
    },

    // watch: {
    //   busindessCityData (to) {
    //     this.setCityData(to);
    //   }
    // },

    // computed: {
    //   busindessCityData () {
    //     return this.$store.getters[BUSINESS_CITY_DATA];
    //   }
    // },

    methods: {
      openModal () {
        this.busindessCityData = this.$store.getters[BUSINESS_CITY_DATA];
        this.setCityData(this.busindessCityData);
        this.modal = true;
        this.token = this.$route.query.token;
        if (this.token) this.getBusinessData();
      },

      provinceChange (provinceCode) {
        let province = this.getCityList(this.provinceList, provinceCode);
        this.cityList = province.children;
        this.formData.cityCode = this.cityList[0] ? this.cityList[0].value : "";
      },

      setCityData ({ store, data }) {
        let { provinceCode, cityCode } = store;
        this.provinceList = data;
        let province = this.getCityList(data, provinceCode);
        this.cityList = province.children;
        this.formData.provinceCode = province.value;
        let city = this.getCityList(this.cityList, cityCode);
        this.formData.cityCode = city.value;
      },

      getCityList (list, code) {
        let data = list.find(elm => elm.value == code) || list[0] || {};
        return {
          children: data.children || [],
          name: data.name || "",
          value: data.value || ""
        }
      },

      onCancel () {
        this.modal = false;
        this.$emit("on-cancel");
      },

      // 获取企业端信息填充到页面
      async getBusinessData () {
        this.loading = true;
        const res = await this.$store.dispatch({
          type: 'toGetBusiness',
          params: {
            token: this.token
          }
        })
        // http://app.xlbzone.com:1080/showdoc/web/#/4?page_id=167
        if (res.code === 200) {
          const data = res.data;
          this.formData.eRecordAccount = data.mobile;
        }
        this.loading = false;
      },
      submit () {
        this.$refs.form.validate( async valid => {
          if (valid) {
            this.loading = true;
            const res = await this.$store.dispatch({
              type: 'erecordSet',
              params: this.formData
            })

            if (res.code === '0') {
              this.$Message.success({
                content: '绑定成功',
                onClose: () => {
                  this.loading = false;
                  this.onCancel();
                }
              })
            } else {
              this.$Message.error({
                content: res.msg,
                onClose: () => {
                  this.loading = false;
                }
              })
            }
          }
        })
      },
    }
  }
</script>
