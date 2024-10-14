
<template>
  <div class="store-info-add add-page">
    <i-form
      ref="form"
      :model="formData"
      :rules="rules"
      label-position="top"
    >
      <!-- <h4 class="title">基本信息</h4>
      <div class="content">
        <div class="form-row grow">
          <FormItem
            label="门店名称"
            prop="storeName"
          >
            <i-input
              v-model="formData.storeName"
              :maxlength="20"
              placeholder="输入门店名称(1-20个字符)"
            ></i-input>
          </FormItem>
          <FormItem
            label="业务类型"
            prop="category">
            <Select
              v-model="formData.category"
              disabled
              placeholder="选择业务类型">
              <Option
                v-for="(item, index) in manageTypeArr"
                :key="index"
                :value="item.value">{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem
            label="统一社会信用代码"
            prop="socialCode">
            <i-input
              v-model="formData.socialCode"
              disabled
              placeholder="输入统一社会信用代码">
            </i-input>
          </FormItem>
          <FormItem
            label="道路运输经营许可证号"
            prop="licenseNo">
            <i-input
              v-model="formData.licenseNo"
              :maxlength="15"
              placeholder="输入道路运输经营许可证号">
            </i-input>
          </FormItem>
        </div>
        <div class="form-row grow">
          <FormItem
            label="门店区域"
            prop="countyCode">
            <city-select
              :city-data="citys"
              @on-change="cityChange"
            ></city-select>
          </FormItem>
          <FormItem
            label="详情地址"
            prop="address">
            <i-input
              v-model="formData.address"
              placeholder="输入详情地址">
            </i-input>
          </FormItem>
        </div>
      </div> -->

      <h4 class="title">营业信息</h4>
      <div class="content">
        <div class="form-row">
          <FormItem
            label="门店类型"
            prop="storeType">
            <Select
              v-model="formData.businessInfo.storeType"
              placeholder="选择门店类型">
              <Option
                v-for="(item, index) in storeType"
                :key="index"
                :value="item.value">{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem
            label="营业时间"
            prop="businessHours">
            <TimePicker
              v-model="time"
              confirm
              type="timerange"
              format="HH:mm"
              placement="bottom-start"
              placeholder="请选择营业时间"
              style="width: 100%"></TimePicker>
          </FormItem>
          <FormItem
            label="联系电话（手机号无需填写区号，最多可填写3个联系方式）"
            style="width: 50%"
            prop="businessInfo.serviceTelList">
            <!-- <tag-input
              v-model="formData.businessInfo.serviceTelList"
              reg="PHONE_NO"
              :max="3"
              placeholder="输入门店联系电话"></tag-input> -->
            <mobile-input v-model="formData.businessInfo.serviceTelList" ref="mobileInput"></mobile-input>
            <!-- <i-input v-model="formData.businessInfo.serviceTelList" placeholder="输入门店联系电话"></i-input> -->
          </FormItem>
        </div>

        <div class="form-row grow">
          <FormItem
            label="主修车型"
            prop="businessInfo.majorCarStyle">
            <Select
              v-model="formData.businessInfo.majorCarStyle"
              placeholder="选择主修车型">
              <Option
                v-for="(item, index) in majorCar"
                :key="index"
                :value="item.value"
              >{{item.label}}</Option>
            </Select>
          </FormItem>
          <FormItem
            label="主营业务"
            style="width: 76%"
            prop="businessInfo.majorBusiness">
            <multiple-input
              :is-array="true"
              :label-data="formData.businessInfo.majorBusiness"
              @click-handle="showModalDialog(1)"
              placeholder="选择门店主营业务"
            ></multiple-input>
          </FormItem>
        </div>

        <div class="form-row grow">
          <FormItem
            label="主修品牌"
            prop="businessInfo.majorBrand">
            <multiple-input
              :is-array="true"
              :label-data="formData.businessInfo.majorBrand"
              @click-handle="showModalDialog(0)"
              placeholder="选择门店主营品牌">
            </multiple-input>
          </FormItem>
        </div>

        <div class="form-row grow">
          <FormItem label="门店介绍">
            <i-input
              v-model="formData.businessInfo.scope"
              type="textarea"
              :maxlength="200"
              placeholder="输入门店的简单介绍"
              :rows="3">
            </i-input>
          </FormItem>
        </div>
        <div class="form-row grow">
          <FormItem
            label="门店实景图(至少上传两张图片)"
            prop="businessInfo.imgId">
            <upload-img
              v-model="formData.businessInfo.imgId"
              :headers="headers"
              :isCut="true">
            </upload-img>
          </FormItem>
        </div>
      </div>
      <Spin
        fix
        v-if="loading"
      ></Spin>
    </i-form>
    <bottom-submit
      @on-cancel="$router.go(-1)"
      @on-confirm="submit"
      :loading="btnLoading"
    >
    </bottom-submit>
    <brand-dialog
      v-if="requestDataOk"
      ref="brandModal"
      :data-json="brandJson"
      :resultArr="brandArray"
      @selectResult="brandSelect"
    ></brand-dialog>
    <brand-dialog
      v-if="requestDataOk"
      ref="majorModal"
      :data-json="majorJson"
      :result-arr="majorArray"
      @selectResult="majorSelect"
    ></brand-dialog>
  </div>
</template>

<script>
import '@/styles/views/store/information-add.less'
import { mapGetters, mapState } from 'vuex'
import CitySelect from '@/components/city-select'
import UploadImg from '@/components/upload-image'
import TagInput from '@/components/tag-input'
import MultipleInput from '@/components/multiple-input' // 多选输入框
import MobileInput from "./components//mobile-input";
import BrandDialog from '@/components/dialog/brand-dialog'
import { storeType, manageTypeArr, majorCar } from '@/store/json/default.js'
import { storage, formVerify } from '@/assets/js/utils'
export default {
  components: { CitySelect, UploadImg, TagInput, MultipleInput, BrandDialog, MobileInput },
  data () {
    const validateStoreType = (rule, value, callback) => {
      if (
        !this.formData.businessInfo.storeType ||
        this.formData.businessInfo.storeType === ''
      ) {
        // 对第二个密码框单独验证
        callback(new Error())
      } else {
        callback()
      }
    }
    const validateBusinessHours = (rule, value, callback) => {
      if (this.time.length < 2 || !this.time[0] || !this.time[1]) {
        // 对第二个密码框单独验证
        callback(new Error())
      } else {
        callback()
      }
    }
    return {
      requestDataOk: false,

      brandJson: [],
      brandArray: [],

      majorJson: [],
      majorArray: [],

      btnLoading: false,
      informationDetail: storage.get('STORE'),
      storeType,
      majorCar,
      manageTypeArr,
      headers: {
        Authorization: storage.get('TOKEN')
      },
      citys: {},
      time: ['9:00', '18:00'],
      formData: {
        storeName: '',
        category: '',
        socialCode: '',
        licenseNo: '',
        address: '',
        provinceCode: '',
        cityCode: '',
        countyCode: '',
        businessInfo: {
          openAt: '',
          closeAt: '',
          majorCarStyle: [],
          majorBrand: [],
          majorBusiness: [],
          imgId: [],
          storeType: ''
        }
      },
      rules: {
        storeName: [
          { required: true, message: '请填写门店名称', trigger: 'blur' }
        ],
        category: [
          { required: true, message: '请选择门店业务类型', trigger: 'change' }
        ],
        socialCode: [
          { required: true, message: '请输入营业执照代码', trigger: 'blur' }
        ],
        licenseNo: [
          { 
            required: false, 
            trigger: 'blur', 
            message: '请输入道路运输许可证号', 
            reg: 'NUMBER_LETTER',
            formatTip: '道路运输许可证号只能为15位以内的数字或字母',
            validator: formVerify.format,
            // callback: (rules, value, callback) => {
            //   this.$store.dispatch({
            //     type: 'checkLicenseNo',
            //     params: {
            //       licenseNo: value
            //     }
            //   }).then( res => {
            //     if (res.code !== '0') {
            //       rules.message = '该道路运输经营许可证号已注册，如有问题，请联系客服';
            //       return callback(rules.message);
            //     }
            //     callback();
            //   }).catch(err => {
            //     callback();
            //   })
            // }
          }
        ],
        countyCode: [
          { required: true, message: '请选择门店区域', trigger: 'change' }
        ],
        address: [
          { required: true, message: '请输入门店详细地址', trigger: 'blur' }
        ],
        storeType: [
          {
            required: true,
            validator: validateStoreType,
            trigger: 'blur',
            message: '请选择门店类型'
          }
        ],
        businessHours: [
          {
            required: true,
            validator: validateBusinessHours,
            trigger: 'change',
            message: '请选择营业时间'
          }
        ],
        'businessInfo.serviceTelList': [
          {
            required: true,
            message: '请填写联系电话',
            trigger: 'blur',
            type: 'array'
          }
        ],
        'businessInfo.majorCarStyle': [
          { required: true, message: '请选择主修车型', trigger: 'change' }
        ],
        'businessInfo.majorBrand': [
          {
            required: true,
            message: '请选择主修品牌',
            trigger: 'change',
            type: 'array'
          }
        ],
        'businessInfo.majorBusiness': [
          {
            required: true,
            message: '请选择主营业务',
            trigger: 'change',
            type: 'array'
          }
        ],
        'businessInfo.imgId': [
          {
            required: true,
            message: '请上传门店实景图(至少上传两张图片)',
            trigger: 'change',
            type: 'array',
            min: 2
          }
        ]
      }
    }
  },
  watch: {
    detailData (to) {
      this.formData = Object.assign(this.formData, to)
      this.citys = {}
      this.citys.provinceCode = to.provinceCode
      this.citys.cityCode = to.cityCode
      this.citys.countyCode = to.countyCode
      if (to.businessInfo) {
        this.time = to.businessInfo.openAt
          ? [to.businessInfo.openAt, to.businessInfo.closeAt]
          : []
      }
    },
    storeMajor (to) {
      this.majorJson = to.majorBusiness
      this.brandJson = to.majorBrand
      this.requestDataOk = true
    }
  },
  mounted () {
    this.getDetailData()
    this.getStoreMajor()
  },
  methods: {
    // 获取门店主修品牌，业务，项目
    getStoreMajor () {
      this.$store.dispatch({
        type: 'toGetStoreMajor'
      })
    },
    showModalDialog (type) {
      if (!type) {
        this.$refs.brandModal.openModal(this.formData.businessInfo.majorBrand)
      } else {
        this.$refs.majorModal.openModal(
          this.formData.businessInfo.majorBusiness
        )
      }
    },
    // 品牌弹窗确定回调
    brandSelect (v) {
      this.formData.businessInfo.majorBrand = [].concat(v)
    },
    // 业务弹窗确定回调
    majorSelect (v) {
      this.formData.businessInfo.majorBusiness = [].concat(v)
    },

    getDetailData () {
      this.$store.dispatch({
        type: 'toGetStoreDetail',
        params: {
          storeId: this.informationDetail.storeId
        }
      })
    },
    submit () {
      let mobileValid = this.$refs.mobileInput.validate();
      if (!mobileValid) return;
      this.$refs.form
        .validate(valid => {
          if (valid) {
            this.btnLoading = true
            if (this.time[0]) {
              this.formData.businessInfo.openAt = this.time[0]
              this.formData.businessInfo.closeAt = this.time[1]
            } else {
              delete this.formData.businessInfo.openAt
              delete this.formData.businessInfo.closeAt
            }

            this.$store
              .dispatch({
                type: 'toGetUpdateStore',
                params: this.formData
              })
              .then(res => {
                if (res.code === '0') {
                  storage.set('STORE', res.data)
                  this.$Message.success({
                    content: '更新成功',
                    onClose: () => {
                      this.$router.push('/store/setting/info/detail')
                      this.btnLoading = false
                      this.$store.dispatch('getBusinessCityList')
                    }
                  })
                } else {
                  this.$Message.error({
                    content: '更新失败'
                  })
                  this.btnLoading = false
                }
              })
          }
        })
        .catch(err => {
          this.btnLoading = false
        })
    },

    cityChange (object) {
      this.formData.provinceCode = object.provinceCode
      this.formData.cityCode = object.cityCode
      this.formData.countyCode = object.countyCode
    }
  },
  computed: {
    ...mapGetters({
      detailData: 'getStoreDetail',
      storeMajor: 'getStoreMajor'
    }),
    ...mapState({ loading: state => state.global.isLoading })
  }
}
</script>
