<template>
  <div class="store-setting-form">
    <saas-bread :title="breadName"></saas-bread>
    <Form ref="formValidate" class="w-form" :model="formData" :rules="rules" :label-width="200">
      <!-- 基本信息 - start -->
      <div class="form-title">基本信息</div>
      <FormItem class="form-item" label="门店名称" prop="storeName">
        <Input v-model="formData.storeName" placeholder="请填写门店全称" />
      </FormItem>
      <FormItem class="form-item" label="门店区域" prop="countyCode">
        <city-select :city-data="citys" @on-change="onCityChange"></city-select>
      </FormItem>
      <FormItem class="form-item" label="详细地址" prop="address">
        <i-input v-model="formData.address" placeholder="">
          <Button :loading="searchLoading" class="address-search-btn" slot="append" icon="ios-search" @click="onMapSearch"></Button>
        </i-input>
      </FormItem>
      <!-- 地图 -->
      <FormItem :label-width="90" class="form-item">
        <p>注意：下图只是详细地址的模糊定位，准确定位请在地图上移动橙色图标标注！</p>
        <div id="map-container" style="width: 654px; height: 280px;"></div>
        <p>经度：{{location.lng || "--"}}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;纬度：{{location.lat || "--"}}</p>
      </FormItem>
      <FormItem class="form-item" label="统一社会信用代码" prop="socialCode">
        <Input v-model="formData.socialCode" placeholder="" :maxlength="18"/>
      </FormItem>
      <FormItem class="form-item" label="道路运输经营许可证号" prop="licenseNo">
        <Input v-model="formData.licenseNo" placeholder="" />
      </FormItem>
      <FormItem class="form-item" label="门店负责人" prop="contactName">
        <Input v-model="formData.contactName" placeholder="请填写真实姓名" />
      </FormItem>
      <FormItem class="form-item" label="负责人手机" prop="contactMobile">
        <Input v-model="formData.contactMobile" placeholder="" :maxlength="11"/>
      </FormItem>
      <!-- 基本信息 - end -->

      <!-- 账号信息 - start -->
      <div class="form-title">注册账号</div>
      <FormItem label="登录账号" prop="mobile" v-if="!isCreate">
        <p class="form-item-title">{{formData.mobile}}<span class="tip">注：如果要修改账号或密码请使用左侧的账号登录，在右上角的“账号设置”进行相关操作。</span> </p>
      </FormItem>
      <template v-else>
        <FormItem class="form-item" label="登录账号" prop="mobile">
          <i-input v-model="formData.mobile" :maxlength="11" placeholder="请输入手机号" @on-change="onMobileChange"></i-input>
        </FormItem>
         <FormItem class="form-item validate-code imgCode" label="图形验证码" >
          <i-input v-model="formData.captchaStr" :maxlength="4" placeholder="请输入图形验证码" @on-change="onMobileChange">></i-input>
          <i-col span="2"
                    >
                        <div class="captcha" ref="captcha" @click="getCaptcha">
                            加载中...
                        </div>
                    </i-col>
                    <i-col span="1" class="change-captcha">
                        <div @click="getCaptcha">
                            <i class="icon iconfont icon-shuaxin"></i>
                        </div>
                    </i-col>
        </FormItem>
        <FormItem class="form-item validate-code" label="验证码" prop="validationCode">
          <i-input v-model="formData.validationCode" :maxlength="4" placeholder="请输入验证码"></i-input>
          <w-vaildate :mobile="formData.mobile" :disabled="valiDisabled" :captchaStr="formData.captchaStr">获取验证码</w-vaildate>
        </FormItem>
        <FormItem class="form-item" label="登录密码" prop="password">
          <Input v-model="formData.password" :type="type" @on-focus="type = 'password'" placeholder="6-16个字符，区分大小写" />
        </FormItem>
      </template>
      <!-- 账号信息 - end -->
    </Form>
    <bottom-submit  @on-cancel="$router.go(-1)" @on-confirm="submit" :loading="btnLoading"></bottom-submit>
    <Spin fix v-if="loading"></Spin>
  </div>
</template>

<script>
import '@/styles/components/form.less';
import { mapGetters, mapState, mapMutations } from 'vuex';
import CitySelect from '@/components/city-select'
import WVaildate from '@/components/vaildate';
import { storage, formVerify } from '@/assets/js/utils.js';
import { getCityText, getCityCodes } from '@/store/json/city.js';
import { regexEnum } from "@/assets/js/regexEnum";

export default {
  components: { CitySelect, WVaildate },
  data () {
    let id = this.$route.params.id;
    let isCreate = id === 'create';
    let permissionData = this.$permission.data.settingPermission;
    return {
      permissionData,
      id,
      isCreate,
      breadName: isCreate ? "新增分店" : "编辑门店",
      type: 'text',
      loading: false,
      searchLoading: false,
      btnLoading: false,
      valiDisabled: true,    // 验证码按钮状态
      map: null,              // 地图
      geocoder: null,
      cityText: "",
      location: {},
      citys: {
        provinceCode: '',
        cityCode: '',
        countyCode: '',
      },
      formData: {
        captchaStr:'',
        storeName: '',        // 门店名称
        provinceCode: '',     // 省份代码
        cityCode: '',         // 城市代码
        countyCode: '',       // 区县代码
        address: '',          // 详细地址
        socialCode: '',       // 统一社会性用代码
        licenseNo: '',        // 道路运输经营许可证号
        contactMobile: '',           // 负责人手机号码
        contactName: '',      // 负责人姓名
        mobile: '',    // 登录账号
        password: '',  // 登录密码
        validationCode: '',   // 验证码
      },
      rules: {
        storeName: [{ required: true, message: '请输入门店名称', trigger: 'blur' }],
        countyCode: [{ required: true, message: '请选择区域', trigger: 'change' }],
        address: [{ required: true, message: '请输入详细地址', trigger: 'blur' }],
        socialCode: [{ required: true, message: '请输入统一社会性用代码', trigger: 'blur' }],
        contactMobile: [{ required: true, message: '请输入负责人手机号码', trigger: 'blur' }],
        contactName: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
        password: [{ required: id === "create", min: 6, message: '密码长度应在6-16位之间', trigger: 'blur' }],
        mobile: [
          { 
            required: true, 
            trigger: 'blur', 
            reg: 'MOBILE',
            message: '请输入员工手机号', 
            formatTip: '请输入正确的手机号', 
            validator: formVerify.format,
            callback: (rules, value, callback) => {
              if (this.id != "create") return callback();
              this.$store.dispatch({
                type: 'checkMobile',
                params: {
                  mobile: value
                }
              }).then( res => {
                if (res.code !== '0') {
                  rules.message = '该手机号码已存在';
                  this.valiDisabled = true;
                  return callback(rules.message);
                }
                // this.valiDisabled = false;
                callback();
              }).catch(err => {
                callback();
              })
            }
          }
        ],
        validationCode: [{ required: true, message: '请输入短信验证码', trigger: 'blur' }],
      }
    }
  },

  created () {
    if (!this.isCreate) this.getDetail();
  },

  mounted () {
    this.initMap();
    this.getCaptcha();
  },

  methods: {
     getCaptcha() {
                if (this.captchaLogin) return; //如果正在加载验证码，则不做任何操作

                //设置验证码相关初始状态
                // this.form.captcha = "";
                // this.captchaLogin = true;
                this.$refs.captcha.innerHTML = "加载中...";

                this.$store
                    .dispatch({
                        type: "imageCaptcha",
                        params: {
                            // mobile: this.formData.mobile,
                        },
                    })
                    .then((res) => {
                        // console.log("图形验证码", res);
                        this.$refs.captcha.innerHTML = res;
                        // if (res.code !== "0") {

                        //   // rules.message = '短信验证码不正确';
                        //   // return callback(rules.message);
                        // }
                        
                    });
           
            },
    initMap () {
      // 异步同时加载多个插件
      AMap.plugin(['AMap.Geocoder', 'AMap.MarkerClusterer'], () => {
        this.map = new AMap.Map('map-container', {
          zoom: 10, // 级别
          zooms: [2, 18],
          center: [120.157898, 36.465918], // [104, 38], // 中心点坐标
          viewMode: '3D' // 使用3D视图
        });

        this.map.on('complete', () => {
          // this.initMarkers();
          // this.onMapSearch();
        });

        this.map.on('zoomend', () => {
          var zoom = this.map.getZoom()
        });

        this.geocoder = new AMap.Geocoder({
          radius: 3000,
          extensions: 'all'
        });
      });
    },

    onMapSearch (v) {
      this.searchLoading = true;
      this.setZoomAndCenter(this.cityText + this.formData.address, 16);
    },

    initMarkers (lnglats) {
      // 清除地图点标记
      if (lnglats.length === 0) return;
      this.map.clearMap();
      
      var markers = [];
      for (var i = 0; i < lnglats.length; i++) {
        var lnglat = lnglats[i];
        if (lnglat.lng !== '--' && lnglat.lat !== '--') {
          var marker = new AMap.Marker({
            position: [lnglat.lng, lnglat.lat],
            topWhenClick: true,
            clickable: true,
            offset: new AMap.Pixel(-15, -15),
            content: `<img style="width: 36px; height:36px" src="images/location.png">`,
            draggable: true
          })
          marker.on('click', this.onMarkerClick)
          marker.on('dragging', ({ lnglat }) => {
            this.location = lnglat;
          })
          marker.on('dragend', this.onMarkerDragend);
          markers.push(marker)
        }
        // marker.setMap(map);
      }
      this.map.add(markers);
    },

    /**
     * 设置地图中心与缩放
     * @param {String} name 地址
     */
     setZoomAndCenter (name, zoom) {
      this.geocoder.getLocation(name, (status, result) => {
        if (status === 'complete' && result.geocodes.length) {
          let lnglat = result.geocodes[0].location;
          zoom ? this.map.setZoomAndCenter(zoom, lnglat) : this.map.setCenter(lnglat);
          this.initMarkers([lnglat]);
          this.searchLoading = false;
        } else {
          console.error('根据地址查询位置失败');
          this.searchLoading = false;
        }
      })
    },
    // 点标记事件
    onMarkerClick ({ lnglat, target, type, pixel }) {
      // map.zoomIn(); // 放大一级
      this.map.setCenter(lnglat)
    },

    onMarkerDragend ({ lnglat, target, type, pixel }) {
      this.location = lnglat;
      this.geocoder.getAddress(lnglat, (status, result) => {
        if (status === 'complete' && result.regeocode) {
          let addressComponent = result.regeocode.addressComponent;
          let citys = getCityCodes(addressComponent.adcode);
          this.citys.provinceCode = citys.province.value;
          this.citys.cityCode = citys.city.value;
          this.citys.countyCode = citys.county.value;
          let cityText = addressComponent.province + addressComponent.city + addressComponent.district;
          let formattedAddress = result.regeocode.formattedAddress;
          this.formData.address = formattedAddress.substr(cityText.length);
        } else {
          console.error('根据坐标查询位置失败');
        }
      })
    },

      onMobileChange(e) {
                const reg = regexEnum.MOBILE;
                const imgReg = regexEnum.IMGCODE;
                if (!reg.test(this.formData.mobile)) {
                    this.valiDisabled = true;

                } else {
                    if (!imgReg.test(this.formData.captchaStr)) {
                        // console.log("enter")
                        this.valiDisabled = true;
                    } else {
                        // console.log("faiul")
                        this.valiDisabled = false;
                    }
                }
            },

    onCityChange (data) {
      this.formData.provinceCode = data.provinceCode;
      this.formData.cityCode = data.cityCode;
      this.formData.countyCode = data.countyCode;
      this.cityText = getCityText(data.provinceCode) + getCityText(data.cityCode) + getCityText(data.countyCode);
      this.$refs['formValidate'].validate();
      // this.setZoomAndCenter(this.cityText, 16);
    },

    async getDetail (value) {
      this.loading = true;
      try {
        let res = await this.$store.dispatch({
          type: 'actionGet',
          name: 'storeChainDetail',
          params: { storeId: this.id }
        });
        let data = res.data;
        this.formData = data;
        this.citys = {
          provinceCode: data.provinceCode,
          cityCode: data.cityCode,
          countyCode: data.countyCode
        }
        this.cityText = getCityText(data.provinceCode) + getCityText(data.cityCode) + getCityText(data.countyCode);
        this.onMapSearch(data.address);
        this.loading = false;
      } catch (error) {
        this.loading = false;
      }
    },

    submit () {
      this.$refs.formValidate.validate((valid) => {
        if (valid) {
          this.btnLoading = true;
          const params = JSON.parse(JSON.stringify(this.formData));
          let request = "storeChainCreate";
          if (!this.isCreate) {
            request = "storeChainUpdate";
            params.storeId = this.id;
          }
          
          this.$store.dispatch({
            type: 'actionPost',
            name: request,
            params
          }).then((res) => {
            if (res.code === '0') {
              this.$Message.success({
                content: '保存成功！',
                onClose: () => {
                  this.btnLoading = false;
                  this.$router.push('/store/setting/admin/list');
                }
              })
            } else {
              if (res.code === '107013') {
                this.$Message.warning('验证码错误');
              }else {
                this.$Message.warning(res.msg);
              }
              this.btnLoading = false;
            }
          }).catch((err) => {
            this.$store.commit('REQUEST_ERROR', { err });
          })
        }
      })
    },
  },
}
</script>

<style lang="less">
.store-setting-form {
  padding-bottom: 80px;
  .w-form {
    padding-bottom: 40px;
  }
  .form-title {
    line-height: 50px;
    padding: 0 20px;
    background: #fafafa;
    margin-bottom: 20px;
  }

  .form-item-title {
    font-size: 14px; 
    color: #332e29;
    .tip {
      margin-left: 20px;
      font-size: 12px;
      color: #888;
      vertical-align: middle;
    }
  }

  .form-item {
    .city-select {
      line-height: 36px;
      height: 36px;
      width: 544px;
    }
    .vaildate {
      line-height: 36px;
      height: 36px;
    }
    .ivu-input-wrapper {
      width: 544px;
    }

    .ivu-input-group-append {
      padding: 0;
      font-weight: 800;
      color: #fcfbfa;
      font-size: 17px;
      background: #ff8800;
      border-color: #ff8800;
      transition: border 0.2s ease-in-out, background 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
      &:hover {
        box-shadow: 0 0 0 2px rgba(255, 128, 0, 0.2);
      }
    }
    .address-search-btn {
      width: 100%;
      font-size: 17px;
      height: 100%;
    }
  }

  .validate-code {
    .ivu-input-wrapper {
      width: 400px;
    }
  }
}
</style>
