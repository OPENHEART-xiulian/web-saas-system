<template>
  <div>
    <Modal :title="titleName" v-model="modal"
      @on-cancel="cancel" 
      class="w-dialog add-client-dialog"
      width="900">
      <RadioGroup class="type-radio-group" v-model="isBase" type="button" size="small">
        <Radio :label="0">基本信息</Radio>
        <Radio :label="1">车险信息</Radio>
      </RadioGroup>
      <i-form  
        class="w-form-wrap" 
        ref="form" 
        :model="formData" 
        :rules="rules" 
        label-position="top" 
        :style="{paddingTop: '30px'}">
        <!-- 基本信息 -->
        <div v-show="!isBase">
          <div class="form-item-wrap">
            <i-form-item label="车牌号码" prop="plateNo">
              <plateno-select v-model="formData.plateNo"></plateno-select>
            </i-form-item>
            <i-form-item label="车牌颜色"> 
              <i-select v-model="formData.plateColor">
                <i-option 
                  v-for="(item, index) in plateColor" 
                  :key="index" 
                  :value="item.label">
                  {{item.label}}
                </i-option>
              </i-select>
            </i-form-item>
            <i-form-item label="VIN码 (车架号)" prop="VINCode">
              <i-input v-model.trim="formData.VINCode" :maxlength="17"></i-input>
            </i-form-item>
            <i-form-item label="车身颜色" prop="vehicleColor">
              <i-select v-model="formData.color">
                <i-option 
                  v-for="(item, index) in vehicleColor" 
                  :key="index" 
                  :value="item.label">
                  {{item.label}}
                </i-option>
              </i-select>
            </i-form-item>
          </div>
          
          <div class="form-item-wrap">
            <i-form-item label="车辆类型">
              <Select v-model="formData.vehicleType" placeholder="选择车辆类型">
                <Option v-for="item in vehicleType" :key="item.value" :value="item.value">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="车辆备注">
              <i-input v-model.trim="formData.remark"></i-input>
            </i-form-item>
            <i-form-item label="发动机号" prop="engineNo">
              <i-input v-model.trim="formData.engineNo"></i-input>
            </i-form-item>
          </div>

          <div class="form-item-wrap">
            <!-- 是否是特殊车型 -->
            <i-form-item label="特殊车型" prop="isSpVehicleBrand" style="width: 100%">
              <i-radio-group v-model="formData.isSpVehicleBrand">
                <i-radio label="1">是</i-radio>
                <i-radio label="0">否</i-radio>
              </i-radio-group>
            </i-form-item>
          </div>

          <div class="form-item-wrap" v-if="formData.isSpVehicleBrand === '1'">
            <!-- 特殊车型 够了是特殊车型的时候显示 -->
            <i-form-item label="车型" prop="vehicleBrand2">
              <i-input v-model.trim="formData.vehicleBrand2" placeholder="请输入车型"></i-input>
            </i-form-item>
          </div>

          <div class="form-item-wrap" v-show="formData.isSpVehicleBrand === '0'">
            <i-form-item label="品牌" prop="vehicleBrand">
              <Select ref="brand" 
                v-model="formData.vehicleBrand" 
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
                v-model="formData.carSeries" 
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
                v-model="formData.carStyle" 
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
          <div class="form-item-wrap">
            <template v-if="customerType !== 'personal'">
              <i-form-item label="联系人">
                <i-input v-model.trim="formData.contactName"></i-input>
              </i-form-item>
              <i-form-item label="联系电话">
                <i-input v-model.trim="formData.contactMobile"></i-input>
              </i-form-item>
            </template>
          </div>
        </div>
        <div  v-show="isBase">
          <!-- 车险信息 -->
          <div class="form-item-wrap">
            <i-form-item label="购车日期">
              <DatePicker v-model="formData.buyDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="发证日期">
              <DatePicker v-model="formData.issueDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="注册日期">
              <DatePicker v-model="formData.registDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="验车日期">
              <DatePicker v-model="formData.validateDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
          </div>
          
          <div class="form-item-wrap">
            <i-form-item label="交强险">
              <Select v-model="formData.compulsoryInsurance" placeholder="">
                <Option v-for="(item, index) in policyType" :key="index" :value="item.label">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="交强险到期时间">
              <DatePicker v-model="formData.compulsoryInsuranceExpireDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
            <i-form-item label="商业险">
              <Select v-model="formData.insurance" placeholder="">
                <Option v-for="(item, index) in policyType" :key="index" :value="item.label">{{item.label}}</Option>
              </Select>
            </i-form-item>
            <i-form-item label="商业险到期时间">
              <DatePicker v-model="formData.insuranceExpireDate" type="date" placeholder=""></DatePicker>
            </i-form-item>
          </div>
          
          <div class="form-item-wrap image-wrap">
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
        </div>
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
import { vehicleType, plateColor, vehicleColor, policyType, sex } from '@/store/json/default';
import PlatenoSelect from '@/components/plateno-select';
import UploadImage from '@/components/upload-image';

export default {
  components: { PlatenoSelect, UploadImage },
  props: {
    required: {
      type: Boolean,
      default: false
    },
    data: {
      type: Boolean,
      default: true
    },
    autoClose: {
      type: Boolean,
      default: true
    }
  },
  data () {
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
      vehicleType,
      plateColor,
      vehicleColor,
      policyType,
      sex,
      uploadHeaders: {
        Authorization: storage.get('TOKEN')
      },
      modal: false,
      isBase: 0,
      index: 0,
      titleName: '',
      brandQuery: '',
      vehicleBrand: '',
      carBrands: [],
      carSeries: [],
      carStyles: [], 
      customerType: 'personal', 
      loading: false,
      seriesLoading: false,
      stylesLoading: false,
      btnLoading: false,
      drivingFront: [],
      drivingBack: [],
      policyImage: [],
      formData: {
        isSpVehicleBrand: '0',                // 是否是特殊车型
        plateNo: '',                          // 车牌号码
        plateColor: '',                       // 车牌颜色
        VINCode: '',                          // VIN码（车架号）
        vehicleColor: '',                     // 车身颜色
        vehicleId: '',                        // 车辆ID
        brandId: '',                          // 品牌ID
        vehicleBrand: '',                     // 品牌
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
      rules: {
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
              if (this.formData.isSpVehicleBrand === '1') {
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
      }
    }
  },

  methods: {
    async openModal (object) {
      object = JSON.parse(JSON.stringify(object || {}));
      this.index = object.index;
      this.customerType = object.customerType;
      this.modal = true;
      this.titleName = object.vehicle ? '编辑车辆' : '新增车辆';
      this.$refs.form.resetFields();
      this.$refs.brand.setQuery(null);
      this.loading = true;
      try {
        await this.getCarBrands();
        // 没有Data是新增 有是编辑， 编辑先获取对应车系车型
        let vehicle = object.vehicle;
        if (vehicle) {
          vehicle.isSpVehicleBrand = vehicle.isSpVehicleBrand ? '1' : '0';
          if (vehicle.vehicleBrand) await this.getCarSeries(vehicle.vehicleBrand);
          if (vehicle.carSeries) await this.getCarStyles(vehicle.carSeries, vehicle.vehicleBrand);
          this.formData = Object.assign({}, vehicle);
          this.formData.vehicleBrand2 = this.formData.vehicleBrand;
          this.drivingFront = vehicle.vehicleLicenseFrontImg ? [vehicle.vehicleLicenseFrontImg] : [];
          this.drivingBack = vehicle.vehicleLicenseBackImg ? [vehicle.vehicleLicenseBackImg] : [];
          this.policyImage = vehicle.insuranceImg ? [vehicle.insuranceImg] : [];
        } else {
          this.formData = {
            isSpVehicleBrand: '0'
          };
        };
        this.loading = false;
      } catch (error) {
        this.formData = {};
        this.loading = false;
        console.log(error);
      }
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
        this.formData.carSeries = '';
        this.carSeries = res.data || [];
        this.formData.carStyle = '';
        this.carStyles = [];
      }
      // 选择了车系之后必须重新赋值，别问为什么，我也不知道
      this.formData.carBrands = brand;
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
        this.formData.carStyle = '';
      }
      // 选择了车型之后必须重新赋值，别问为什么，我也不知道
      this.formData.carBrands = brand;
      this.formData.carSeries = series;
      this.stylesLoading = false;
    },

    brandOpenChange (v) {
      if (v) {
        this.brandQuery = "";
        return;
      };
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
      this.formData.brandId = data.brandId;
      this.$refs.series.setQuery(null);
      this.getCarSeries(data.vehicleBrand);
    },

    onSeriesChange (series) {
      this.$refs.styles.setQuery(null);
      this.getCarStyles(series, this.formData.vehicleBrand);
    },

    onBrandClear () {
      this.$refs.series.setQuery(null);
      this.formData.carSeries = '';
      this.carSeries = [];
      this.onSeriesClear();
    },

    onSeriesClear () {
      this.$refs.styles.setQuery(null);
      this.formData.carStyle = '';
      this.carStyles = [];
    },

    submit () {
      let data = {
        index: this.index,
        callback: this.close
      }
      this.$refs.form.validate(valid => {
        if (valid) {
          let formData = Object.assign({}, this.formData);
          formData.vehicleLicenseFrontImg = this.drivingFront[0] || '';
          formData.vehicleLicenseBackImg = this.drivingBack[0] || '';
          formData.insuranceImg = this.policyImage[0] || '';
          if (formData.registDate) {
            formData.registDate = formatTime(formData.registDate, 'yyyy-MM-dd');
          }
          if (formData.compulsoryInsuranceExpireDate) {
            formData.compulsoryInsuranceExpireDate = formatTime(formData.compulsoryInsuranceExpireDate, 'yyyy-MM-dd');
          }
          formData.isSpVehicleBrand = formData.isSpVehicleBrand === '1';
          if (formData.isSpVehicleBrand) {
            formData.carSeries = '';
            formData.carStyle = '';
            formData.vehicleBrand = this.formData.vehicleBrand2;
          }
          data.vehicle = formData;
          this.btnLoading = true;
          this.$emit('on-confirm', data);
          if (this.autoClose) this.close();
        } else {
          this.isBase = 0;
        }
      });
    },

    close (notHide) {
      if (!notHide) this.modal = false;
      this.btnLoading = false;
      this.drivingFront = [];
      this.drivingBack = [];
      this.policyImage = [];
      this.carSeries = [];
      this.carStyles = [];
    },

    cancel () {
      this.close();
      this.$emit('on-cancel');
    },
  },
}
</script>
