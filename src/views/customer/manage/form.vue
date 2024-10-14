<template>
  <!-- 新增编辑客户 -->
  <div class="customer-form">
    <saas-bread :title="breadName"></saas-bread>
    <i-form class="w-form-wrap" ref="form" :model="formData" :rules="rules" label-position="top">
      <div class="form-item-wrap">
        <i-form-item label="客户名称" prop="name">
          <i-input v-model="formData.name" :maxlength="25"></i-input>
        </i-form-item>
        <i-form-item label="联系电话" prop="mobile">
          <i-input v-model="formData.mobile"></i-input>
        </i-form-item>
        <i-form-item label="客户类型">
          <div class="flex">
            <i-select v-model="formData.customerType" placeholder="请选择">
              <i-option v-for="(item, index) in clientType" :key="index" :value="item.value">{{item.label}}</i-option>
            </i-select>
            <i-select v-model="formData.gender" v-if="formData.customerType === 'personal'" placeholder="请选择">
              <i-option v-for="(item, index) in sex" :key="index" :value="item.value">{{item.label}}</i-option>
            </i-select>
          </div>
        </i-form-item>
        <i-form-item label="生日" v-if="formData.customerType === 'personal'">
          <DatePicker v-model="formData.birthday" type="date" placeholder="请选择"></DatePicker>
        </i-form-item>
        <i-form-item label="单位名称" v-else>
          <i-input v-model="formData.companyName"></i-input>
        </i-form-item>
      </div>
      <div class="form-item-wrap">
        <i-form-item label="客户标签">
          <i-select v-model="formData.tagList" placeholder="请选择" multiple>
            <i-option v-for="(item, index) in tagList" :key="index" :value="item._id">{{item.name}}</i-option>
          </i-select>
          <router-link class="form-item-rt" to="/customer/label">标签管理</router-link>
        </i-form-item>
        <i-form-item label="所在地区">
          <city-select :city-data="cityData" @on-change="cityChange"></city-select>
        </i-form-item>
        <i-form-item label="详细地址">
          <i-input v-model="formData.address" :maxlength="15"></i-input>
        </i-form-item>
        <i-form-item label="备注">
          <i-input v-model="formData.remark" :maxlength="15"></i-input>
        </i-form-item>
      </div>
    </i-form>
    <div class="table-wrap">
      <vehicle-list ref="vehicle" :data="formData.vehicles"></vehicle-list>
    </div>
    <bottom-submit 
      @on-confirm="submit"
      @on-cancel="$router.go(-1)"
      :loading="loading">
    </bottom-submit>
  </div>
</template>

<script>
  import '@/styles/views/customer/customer-form.less';
  import { clientType, sex } from '@/store/json/default';
  import { formVerify, formatTime } from '@/assets/js/utils.js'; // , verify, storage
  // import { regexEnum } from '@/assets/js/regexEnum';
  import CitySelect from '@/components/city-select';
  import VehicleList from './vehicle-list';
  export default {
    components: { CitySelect, VehicleList },
    data () {
      return {
        sex,
        loading: false,
        clientType,
        breadName: '',
        cityData: {
          provinceCode: '',
          cityCode: '',
          countyCode: '',
        },
        formData: {
          name: '',                       // 客户名称
          mobile: '',                     // 联系电话
          customerType: 'personal',       // 客户类型
          gender: 'male',                 // 性别
          birthday: '',                   // 生日
          companyName: '',                // 单位名称
          tagList: [],                    // 标签id
          address: '',                    // 详细地址
          remark: '',                     // 备注
          provinceCode: '',               // 省份代码
          cityCode: '',                   // 城市代码
          countyCode: '',                 // 区县代码
          vehicles: [],                   // 车辆列表
        },
        rules: {
          name: [
            { required: true, message: '客户名称不能为空' },  
          ],
          mobile: [
            { 
              trigger: 'blur',
              reg: 'PHONE_NUMBER',
              formatTip: '电话格式不正确 ',
              validator: formVerify.format
            }
          ]
        }
      }
    },

    watch: {
      detail (to) {
        let formData = JSON.parse(JSON.stringify(to));
        let cityData = {
          provinceCode: formData.provinceCode,
          cityCode: formData.cityCode,
          countyCode: formData.countyCode
        };
        formData.tagList = formData.tagList.map(elm => elm._id);
        this.formData = formData;
        this.cityData = cityData;
      },
      tagList (list) {
        if (list.length) {
          const data = list.find(elm => elm.isDefault);
          this.formData.tagList = [data._id];
        }

        this.id = this.$route.params.id;
        if (this.id !== 'create') {
          this.breadName = '编辑客户';
          this.getDetail();
        } else {
          this.breadName = '新建客户';
        }
      }
    },

    computed: {
      detail () {
        return this.$store.getters.getClientDetail;
      },
      tagList () {
        return this.$store.getters.getCustomerTagList;
      }
    },

    created () {
      this.$store.dispatch({
        type: 'toGetCustomerTagList',
        params: { type: '1' }
      });
    },

    methods: {
      getDetail () {
        this.$store.dispatch({
          type: 'toGetClientDetail',
          params: {
            customerId: this.id
          }
        });
      },

      cityChange (data) {
        this.cityData.provinceCode = data.provinceCode;
        this.cityData.cityCode = data.cityCode;
        this.cityData.countyCode = data.countyCode;
      },

      submit () {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.save();
          }
        });
      },

      async save () {
        this.loading = true;
        let request = 'clientAdd';
        if (this.id !== 'create') request = 'clientUpdate';
        let formData = JSON.parse(JSON.stringify(this.formData));
        Object.assign(formData, this.cityData);
        if (formData.birthday) formData.birthday = formatTime(formData.birthday, 'yyyy-MM-dd');
        formData.vehicles = this.$refs.vehicle.getFormRows();
        formData.tagList = formData.tagList.map(elm => {
          return { _id: elm };
        });
        formData.client = 'pc';
        const res = await this.$store.dispatch({
          type: request,
          params: formData
        });
        if (res.code === '0') {
          this.$Message.success({
            content: '保存成功',
            onClose: () => {
              // if (this.id !== 'create') {
              //   this.$router.push('/store/client/detail/' + this.formData.customerId);
              // } else {
                this.$router.push('/customer');
              // }
              this.loading = false;
            }
          });
        }else if(res.code === 403){
          this.$Modal.confirm({
            title: '提示',
            content: res.msg+"已存在，是否确认重复创建客户？",
            okText: "确认创建",
            onOk: () => {
              this.formData.status=1;
              this.save();
            },
            onCancel: () => {
              this.loading = false;
            }
          });
        } else {
          this.$Message.warning(res.msg);
          this.loading = false;
        }
      }
    }
  }
</script>
