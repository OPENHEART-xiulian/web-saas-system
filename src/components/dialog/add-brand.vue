<template>
  <div>
    <Modal :title="titleName" v-model="modal"
      @on-cancel="cancel" 
      class="w-dialog add-client-dialog"
      width="900">
      <RadioGroup class="type-radio-group" v-model="isFullCreate" type="button" size="small" v-if="showTypeRadio">
        <Radio :label="0">快速创建</Radio>
        <Radio :label="1">完整创建</Radio>
      </RadioGroup>
      <i-form 
        v-if="client" 
        class="w-form-wrap" 
        ref="client" 
        :model="clientData" 
        :rules="clientRules" 
        label-position="top" 
        style="padding-bottom: 0;">
        <div class="form-item-wrap">
          <i-form-item label="客户名称" prop="name">
            <i-input v-model.trim="clientData.name" :maxlength="25"></i-input>
          </i-form-item>
          <i-form-item label="联系电话" prop="mobile">
            <i-input v-model.trim="clientData.mobile"></i-input>
          </i-form-item>
          <i-form-item label="客户类型">
            <div class="flex">
              <i-select v-model="clientData.customerType" placeholder="请选择">
                <i-option v-for="(item, index) in clientType" :key="index" :value="item.value">{{item.label}}</i-option>
              </i-select>
              <i-select v-model="clientData.gender" v-if="clientData.customerType === 'personal'" placeholder="请选择">
                <i-option v-for="(item, index) in sex" :key="index" :value="item.value">{{item.label}}</i-option>
              </i-select>
            </div>
          </i-form-item>
          <!-- 完整创建显示 -->
          <i-form-item label="生日" v-show="clientData.customerType === 'personal' && isFullCreate">
            <DatePicker v-model="clientData.birthday" type="date" placeholder="请选择"></DatePicker>
          </i-form-item>
          <i-form-item label="单位名称" v-show="clientData.customerType !== 'personal' && isFullCreate">
            <i-input v-model.trim="clientData.companyName"></i-input>
          </i-form-item>
        </div>
        <!-- 完整创建显示 -->
        <div class="form-item-wrap" v-show="isFullCreate">
          <i-form-item label="所在地区" style="width: 50%">
            <city-select :city-data="clientData" @on-change="cityChange"></city-select>
          </i-form-item>
          <i-form-item label="详细地址">
            <i-input v-model="clientData.address" :maxlength="15"></i-input>
          </i-form-item>
          <i-form-item label="备注">
            <i-input v-model="clientData.remark" :maxlength="15"></i-input>
          </i-form-item>
        </div>
        <!-- 完整创建显示 -->
        <div class="form-item-wrap" v-show="isFullCreate">
          <i-form-item label="客户标签" style="width: 50%">
            <i-select v-model="clientData.tagList" placeholder="请选择" multiple>
              <i-option v-for="(item, index) in tagList" :key="index" :value="item._id">{{item.name}}</i-option>
            </i-select>
            <router-link v-if="customerLabel.create" class="form-item-rt" to="/customer/label">标签管理</router-link>
          </i-form-item>
        </div>
      </i-form>
      <i-form  
        v-if="vehicle" 
        class="w-form-wrap" 
        ref="vehicle" 
        :model="vechicleData" 
        :rules="vehicleRules" 
        label-position="top" 
        :style="{paddingTop: client ? '0' : '30px'}">
        <!-- 车辆信息模块 -->
        <template v-if="vehicle">
          <div class="form-item-wrap" style="flex-wrap: wrap;">
            <i-form-item label="车牌号码" prop="plateNo">
              <plateno-select v-model="vechicleData.plateNo"></plateno-select>
            </i-form-item>
            <!-- 完整创建显示 -->
            <i-form-item label="车牌颜色" v-show="isFullCreate"> 
              <i-select v-model="vechicleData.plateColor">
                <i-option 
                  v-for="(item, index) in plateColor" 
                  :key="index" 
                  :value="item.label">
                  {{item.label}}
                </i-option>
              </i-select>
            </i-form-item>
            <i-form-item label="VIN码 (车架号)" prop="VINCode">
              <i-input v-model.trim="vechicleData.VINCode" :maxlength="17"></i-input>
            </i-form-item>
            <!-- 完整创建显示 -->
            <i-form-item label="车身颜色" prop="vehicleColor" v-show="isFullCreate">
              <i-select v-model="vechicleData.color">
                <i-option 
                  v-for="(item, index) in vehicleColor" 
                  :key="index" 
                  :value="item.label">
                  {{item.label}}
                </i-option>
              </i-select>
            </i-form-item>
            <i-form-item label="车辆类型">
              <Select v-model="vechicleData.vehicleType" placeholder="选择车辆类型">
                <Option v-for="item in vehicleType" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <!-- 完整创建显示 -->
            <i-form-item label="车辆备注" v-show="isFullCreate">
              <i-input v-model.trim="vechicleData.remark"></i-input>
            </i-form-item>
            <!-- 完整创建显示 -->
            <i-form-item label="发动机号" prop="engineNo" v-show="isFullCreate">
              <i-input v-model.trim="vechicleData.engineNo"></i-input>
            </i-form-item>
          </div>
          <div class="form-item-wrap">
            <!-- 是否是特殊车型 -->
            <i-form-item label="特殊车型" prop="isSpVehicleBrand" style="width: 100%">
              <i-radio-group v-model="vechicleData.isSpVehicleBrand">
                <i-radio label="1">是</i-radio>
                <i-radio label="0">否</i-radio>
              </i-radio-group>
            </i-form-item>
          </div>
          <div class="form-item-wrap" v-if="vechicleData.isSpVehicleBrand === '1'">
            <!-- 特殊车型 够了是特殊车型的时候显示 -->
            <i-form-item label="车型" prop="vehicleBrand2">
              <i-input v-model.trim="vechicleData.vehicleBrand2" placeholder="请输入车型"></i-input>
            </i-form-item>
          </div>
          <div class="form-item-wrap" v-show="vechicleData.isSpVehicleBrand === '0'">
            <!-- 快速创建的时候在这显示车牌号码 -->
            <!-- <i-form-item label="车牌号码" prop="plateNo" v-show="!isFullCreate">
              <plateno-select v-model="vechicleData.plateNo"></plateno-select>
            </i-form-item> -->
            <!-- 不是特殊车型的时候显示 -->
            <i-form-item label="品牌" prop="vehicleBrand">
              <Select ref="brand" 
                v-model="vechicleData.vehicleBrand" 
                filterable clearable 
                placeholder="输入品牌检索"
                @on-open-change="brandOpenChange"
                @on-query-change="brandQueryChange"
                @on-clear="onBrandClear">
                <Option 
                  v-for="(item, index) in carBrands" 
                  :key="index" 
                  :value="item.vehicleBrand"
                  @click.native="onBrandsChange(item)">{{item.vehicleBrand}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="车系">
              <Select ref="series" 
                v-model="vechicleData.carSeries" 
                filterable clearable
                :disabled="carSeries.length === 0"
                :placeholder="carSeries.length === 0 ? '暂无车系' : '输入车系检索'"
                @on-clear="onSeriesClear">
                <Option 
                  v-for="(item, index) in carSeries" 
                  :key="index" 
                  :value="item"
                  @click.native="onSeriesChange(item)">{{item}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="车型">
              <Select ref="styles" 
                v-model="vechicleData.carStyle" 
                filterable clearable
                :disabled="carStyles.length === 0"
                :placeholder="carStyles.length === 0 ? '暂无车型' : '输入车型检索'">
                <Option 
                  v-for="(item, index) in carStyles" 
                  :key="index" 
                  :value="item">{{item}}</Option>
              </Select>
            </i-form-item>
          </div>
          <!-- <div class="form-item-wrap"> -->
            <!-- 快速创建的时候在这显示VIN码 -->
            <!-- <i-form-item label="VIN码 (车架号)" prop="VINCode" v-show="!isFullCreate">
              <i-input v-model.trim="vechicleData.VINCode" :maxlength="17"></i-input>
            </i-form-item>
            <i-form-item label="车辆类型">
              <Select v-model="vechicleData.vehicleType" placeholder="选择车辆类型">
                <Option v-for="item in vehicleType" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </i-form-item> -->
            <!-- 完整创建显示 -->
            <!-- <i-form-item label="车辆备注" v-show="isFullCreate">
              <i-input v-model.trim="vechicleData.remark"></i-input>
            </i-form-item>
          </div> -->
          
          <!-- 其他 -->
          <!-- 完整创建显示 -->
          <div class="form-item-wrap" v-show="isFullCreate">
            <i-form-item label="购车日期">
              <DatePicker v-model="vechicleData.buyDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="发证日期">
              <DatePicker v-model="vechicleData.issueDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="注册日期">
              <DatePicker v-model="vechicleData.registDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="验车日期">
              <DatePicker v-model="vechicleData.validateDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
          </div>
          
          <!-- 完整创建显示 -->
          <div class="form-item-wrap" v-show="isFullCreate">
            <i-form-item label="交强险">
              <Select v-model="vechicleData.compulsoryInsurance" placeholder="">
                <Option v-for="(item, index) in policyType" :key="index" :value="item.label">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="交强险到期时间">
              <DatePicker v-model="vechicleData.compulsoryInsuranceExpireDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="商业险">
              <Select v-model="vechicleData.insurance" placeholder="">
                <Option v-for="(item, index) in policyType" :key="index" :value="item.label">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="商业险到期时间">
              <DatePicker v-model="vechicleData.insuranceExpireDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
          </div>
          
          <!-- 完整创建显示 -->
          <div class="form-item-wrap image-wrap" v-show="isFullCreate">
            <i-form-item label="行驶证照片">
              <upload-image v-model="drivingFront" :headers="uploadHeaders" :isCut="true" :max-count="1" :cut-scale="[365, 250]">
                <div slot="content" class="upload-content">
                  <p><i class="iconfont icon-tuoruwenjian"></i></p>
                  <p>行驶证正面</p>
                </div>
              </upload-image>
              <upload-image v-model="drivingBack" :headers="uploadHeaders" :isCut="true" :max-count="1" :cut-scale="[365, 250]">
                <div slot="content" class="upload-content">
                  <p><i class="iconfont icon-tuoruwenjian"></i></p>
                  <p>行驶证反面</p>
                </div>
              </upload-image>
            </i-form-item>
            <i-form-item label="保单照片">
              <upload-image v-model="policyImage" :headers="uploadHeaders" :isCut="true" :max-count="1" :cut-scale="[365, 250]">
                <div slot="content" class="upload-content">
                  <p><i class="iconfont icon-tuoruwenjian"></i></p>
                  <p>保单</p>
                </div>
              </upload-image>
            </i-form-item>
          </div>
        </template>
        <Spin v-if="loading" fix></Spin>
      </i-form>
      <div slot="footer">
        <Button type="text" size="large" @click.native.stop="cancel" :loading="btnLoading">取消</Button>
        <Button type="error" size="large" @click.native.stop="submit" :loading="btnLoading">确定</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import '@/styles/components/dialog.less';
import '@/styles/components/form.less';
import { verify, storage, formatTime } from '@/assets/js/utils.js';
import { vehicleType, plateColor, vehicleColor, policyType, clientType, sex } from '@/store/json/default';
import PlatenoSelect from '@/components/plateno-select';
import UploadImage from '../upload-image';
import CitySelect from '../city-select';

export default {
  components: { PlatenoSelect, UploadImage, CitySelect },
  props: {
    required: {
      type: Boolean,
      default: false
    },
    client: {
      type: Boolean,
      default: false,
    },
    vehicle: {
      type: Boolean,
      default: true
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data () {
    let { customerLabel } = this.$permission.data;
    let showTypeRadio = this.client && this.vehicle;
    let isFullCreate = (this.client && this.vehicle) ? 0 : 1;
    const validate = (rules, value, callback) => {
      if (rules.required && (value === '' || value === undefined)) {
        return callback(rules.message);
      }
      // 格式错误的时候 提示错误
      if ( (value) && rules.reg && !verify(rules.reg, value)) {
        rules.message = rules.formatTip;
        return callback(rules.message);
      }
      
      callback();
    }
    return {
      customerLabel,
      showTypeRadio,
      isFullCreate,    // 是否完整创建
      titleName: '',
      vehicleType,
      plateColor,
      vehicleColor,
      policyType,
      clientType,
      sex,
      uploadHeaders: {
        Authorization: storage.get('TOKEN')
      },
      modal: false,
      index: 0,
      brandOpen: false,
      brandQuery: '',
      carBrands: [],
      carSeries: [],
      carStyles: [],  
      loading: false,
      seriesLoading: false,
      stylesLoading: false,
      btnLoading: false,
      drivingFront: [],
      drivingBack: [],
      policyImage: [],
      clientData: {
        name: '',                             // 客户名称
        mobile: '',                           // 联系电话
        customerType: 'personal',             // 客户类型
        gender: 'male',                       // 性别
        birthday: '',                         // 生日
        companyName: '',                      // 单位名称
        tagList: [],                          // 标签id
        address: '',                          // 详细地址
        remark: '',                           // 备注
        provinceCode: '',                     // 省份代码
        cityCode: '',                         // 城市代码
        countyCode: '',                       // 区县代码
      },
      vechicleData: {
        isSpVehicleBrand: '0',                // 是否是特殊车型
        plateNo: '',                          // 车牌号码
        plateColor: '',                       // 车牌颜色
        VINCode: '',                          // VIN码（车架号）
        vehicleColor: '',                     // 车身颜色
        vehicleId: '',                        // 车辆ID
        brandId: '',                          // 品牌ID
        vehicleBrand: '',                     // 品牌
        vehicleBrand2: '',
        carSeries: '',                        // 车系
        carStyle: '',                         // 车型
        engineNo: '',                         // 发动机号
        vehicleType: '',                      // 车辆类型
        remark: '',                           // 车辆备注
        
        buyDate: '',                          // 购车日期
        issueDate: '',                        // 发证日期
        registDate: '',                       // 注册日期
        validateDate: '',                     // 验车日期
        compulsoryInsurance: '',              // 交强险
        compulsoryInsuranceExpireDate: '',    // 交强险到期时间
        insurance: '',                        // 商业险
        insuranceExpireDate: '',              // 商业险到期时间

        vehicleLicenseFrontImg: '',           // 行驶证正面
        vehicleLicenseBackImg: '',            // 行驶证反面
        insuranceImg: '',                     // 保单图片
      },
      clientRules: {
        mobile: [
          // {
          //   formatTip: '手机号码格式不正确',
          //   reg: 'MOBILE',
          //   trigger: 'blur',
          //   validator: validate
          // }
        ],
        name: [
          { 
            required: true, 
            message: '客户名称不能为空', 
            trigger: 'blur'
          }
        ],
      },
      vehicleRules: {
        plateNo: [
          { 
            required: this.required, 
            message: '车牌号码不能为空', 
            reg: 'PLATENO',
            formatTip: '车牌号码格式不正确',
            trigger: 'blur', 
            validator: validate 
          }
        ],
        VINCode: [
          { 
            required: this.required, 
            message: 'VINCode不能为空', 
            reg: 'VINCODE',
            formatTip: 'VINCode格式不正确',
            trigger: 'blur', 
            validator: validate 
          }
        ],
        vehicleBrand: [
          { 
            required: true, 
            message: '请选择车辆品牌', 
            trigger: 'change', 
            validator: (rules, value, callback) => {
              if (this.vechicleData.isSpVehicleBrand === '1') {
                return callback();
              }
              if (rules.required && (value === '' || value === undefined)) {
                return callback(rules.message);
              }
              // 格式错误的时候 提示错误
              if ( (value) && rules.reg && !verify(rules.reg, value)) {
                rules.message = rules.formatTip;
                return callback(rules.message);
              }
              
              callback();
            }
          }
        ],
        vehicleBrand2: [
          { 
            required: true, 
            message: '请输入特殊车型', 
            trigger: 'blur'
          }
        ],
        vehicleBrands: [
          { 
            required: true, 
            message: '请输入车型', 
            trigger: 'blur', 
            validator: validate
          }
        ]
      }
    }
  },

  // watch: {
  //   tagList (list) {
  //     // if (list.length) {
  //     //   const data = list.find(elm => elm.isDefault);
  //     //   if (this.clientData.tagList.length === 0) {
  //     //     this.clientData.tagList = [data._id];
  //     //   }
  //     // }
  //   }
  // },

  computed: {
    tagList () {
      return this.$store.getters.getCustomerTagList;
    }
  },

  mounted () {
    if (this.client) {
      this.$store.dispatch({
        type: 'toGetCustomerTagList',
        params: { type: '1', isDefault: false }
      });
    }
  },

  methods: {
    async openModal (object) {
      object = {...object};
      object = JSON.parse(JSON.stringify(object || {}));
      this.index = object.index;
      this.modal = true;
      if (this.client) {
        this.titleName = object.client ? '编辑客户' : '新增客户';
        this.$refs.client.resetFields();
        let clientData = object.client || {
          customerType: 'personal',             // 客户类型
          gender: 'male',                       // 性别
          tagList: []
        };
        // 后端返回tagIdList的时候，就用tagIdList
        if (clientData.tagIdList && clientData.tagIdList.length) {
          clientData.tagList = clientData.tagIdList;
        } else {
          clientData.tagList = clientData.tagList.map(elm => {
            return elm._id;
          });
        }

        // clientData.provinceCode = clientData.provinceCode || '';
        // clientData.cityCode = clientData.cityCode || '';
        // clientData.countyCode = clientData.countyCode || '';
        this.clientData = clientData;
      }

      if (this.vehicle) {
        if (!this.client) this.titleName = object.vehicle ? '编辑车辆' : '新增车辆';
        this.$refs.vehicle.resetFields();
        this.$refs.brand.setQuery(null);
        this.loading = true;
        try {
          await this.getCarBrands();
          // 没有Data是新增 有是编辑， 编辑先获取对应车系车型
          let vehicle = object.vehicle;
          if (vehicle) {
            delete object.vehicle.parent;
            // 是否为特殊车型
            if (!vehicle.isSpVehicleBrand) {
              if (vehicle.vehicleBrand) await this.getCarSeries(vehicle.vehicleBrand);
              if (vehicle.carSeries) await this.getCarStyles(vehicle.carSeries, vehicle.vehicleBrand);
            }
            vehicle.isSpVehicleBrand = vehicle.isSpVehicleBrand ? '1' : '0';
            this.vechicleData = Object.assign({}, vehicle);
            this.vechicleData.vehicleBrand2 = this.vechicleData.vehicleBrand;
            this.drivingFront = vehicle.vehicleLicenseFrontImg ? [vehicle.vehicleLicenseFrontImg] : [];
            this.drivingBack = vehicle.vehicleLicenseBackImg ? [vehicle.vehicleLicenseBackImg] : [];
            this.policyImage = vehicle.insuranceImg ? [vehicle.insuranceImg] : [];
          } else {
            this.vechicleData = {
              isSpVehicleBrand: '0'
            };
          };
          this.loading = false;
        } catch (error) {
          this.loading = false;
          this.vechicleData = {};
          console.log(error);
        }
      };
    },

    async getCarBrands () {
      let brands = this.$store.getters.getCarBrands;
      if (!brands.length) {
        const res = await this.$store.dispatch({
          name: 'carBrands',
          type: 'actionGet',
        });
        if (res.code === '0') {
          brands = res.data || [];
          this.$store.commit('TO_GET_CAR_BRANDS', brands);
        }
      }
      this.carBrands = brands;
    },

    async getCarSeries (brand) {
      if (this.seriesLoading) return;
      this.seriesLoading = true;
      const res = await this.$store.dispatch({
        name: 'carSeries',
        type: 'actionGet',
        params: { brand }
      });
      if (res.code === '0') {
        this.vechicleData.carSeries = '';
        this.carSeries = res.data || [];
        this.vechicleData.carStyle = '';
        this.carStyles = [];
      }
      // 选择了车系之后必须重新赋值，别问为什么，我也不知道
      this.vechicleData.carBrands = brand;
      this.seriesLoading = false;
    },

    async getCarStyles (series, brand) {
      if (this.stylesLoading) return;
      this.stylesLoading = true;
      const res = await this.$store.dispatch({
        name: 'carStyles',
        type: 'actionGet',
        params: { series, brand }
      });
      if (res.code === '0') {
        this.carStyles = res.data || [];
        this.vechicleData.carStyle = '';
      }
      // 选择了车型之后必须重新赋值，别问为什么，我也不知道
      this.vechicleData.carBrands = brand;
      this.vechicleData.carSeries = series;
      this.stylesLoading = false;
    },

    cityChange (data) {
      this.clientData.provinceCode = data.provinceCode;
      this.clientData.cityCode = data.cityCode;
      this.clientData.countyCode = data.countyCode;
    },

    brandOpenChange (v) {
      if (v) {
        // let query = this.brandQuery;
        this.brandQuery = "";
        // this.$refs.brand.setQuery(query.slice(0, 1));
        // this.$refs.brand.setQuery(query);
        return;
      };
      // window.list = this.carBrands;
      // console.log(this.carBrands);
      let list = this.carBrands.filter(elm => {
        return elm.vehicleBrand.toUpperCase().indexOf(this.brandQuery.toUpperCase()) >= 0;
      });
      if (list.length === 1) {
        let data = list[0];
        let option = { value: data.vehicleBrand, label: data.vehicleBrand };
        this.$refs.brand.onOptionClick(option);
        this.onBrandsChange(data);
      }
    },

    brandQueryChange (v) {
      // 别问我为什么这么注释，我参考iview的
      // 不知道为什么，反正加setTimeout就对了
      setTimeout(() => {
        this.brandQuery = v
      });
    },

    onBrandsChange (data) {
      this.vechicleData.brandId = data.brandId;
      this.$refs.series.setQuery(null);
      this.getCarSeries(data.vehicleBrand);
    },

    onSeriesChange (series) {
      this.$refs.styles.setQuery(null);
      this.getCarStyles(series, this.vechicleData.vehicleBrand);
    },

    onBrandClear () {
      this.$refs.series.setQuery(null);
      this.vechicleData.carSeries = '';
      this.carSeries = [];
      this.onSeriesClear();
    },

    onSeriesClear () {
      this.$refs.styles.setQuery(null);
      this.vechicleData.carStyle = '';
      this.carStyles = [];
    },

    submit () {
      let data = {
        index: this.index,
        callback: this.close
      }
      let clientValid = true;
      let vehicleValid = true;
      if (this.client) {
        clientValid = false;
        this.$refs.client.validate(valid => {
          if (valid) {
            clientValid = true;
            let clientData = Object.assign({}, this.clientData);
            clientData.tagList = clientData.tagList.map(elm => {
              return { _id: elm };
            });
            if (clientData.birthday) clientData.birthday = formatTime(clientData.birthday, 'yyyy-MM-dd');
            data.client = clientData;
          }
        });
      }

      if (this.vehicle) {
        vehicleValid = false;
        this.$refs.vehicle.validate(valid => {
          if (valid) {
            vehicleValid = true;
            let vechicleData = Object.assign({}, this.vechicleData);
            vechicleData.vehicleLicenseFrontImg = this.drivingFront[0] || '';
            vechicleData.vehicleLicenseBackImg = this.drivingBack[0] || '';
            vechicleData.insuranceImg = this.policyImage[0] || '';
            if (vechicleData.registDate) {
              vechicleData.registDate = formatTime(vechicleData.registDate, 'yyyy-MM-dd');
            }
            if (vechicleData.compulsoryInsuranceExpireDate) {
              vechicleData.compulsoryInsuranceExpireDate = formatTime(vechicleData.compulsoryInsuranceExpireDate, 'yyyy-MM-dd');
            }
            vechicleData.isSpVehicleBrand = vechicleData.isSpVehicleBrand === '1';
            if (vechicleData.isSpVehicleBrand) {
              vechicleData.carSeries = '';
              vechicleData.carStyle = '';
              vechicleData.vehicleBrand = this.vechicleData.vehicleBrand2;
            }
            data.vehicle = vechicleData;
          }
        });
      }

      if (vehicleValid && clientValid) {
        this.btnLoading = true;
        this.$emit('on-confirm', data);
        if (this.autoClose) this.close();
      }
    },

    close (notHide) {
      if (!notHide) this.modal = false;
      this.btnLoading = false;
      this.drivingFront = [];
      this.drivingBack = [];
      this.policyImage = [];
      this.carSeries = [];
      this.carStyles = [];
      // if (this.client) this.$refs.client.resetFields();
      // if (this.vehicle) this.$refs.vehicle.resetFields();
    },

    cancel () {
      this.close();
      this.$emit('on-cancel');
    },
  },
}
</script>
