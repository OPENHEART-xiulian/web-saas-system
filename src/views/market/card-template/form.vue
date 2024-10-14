<template>
  <!-- 出售会员卡 -->
  <div class="card-form">
    <saas-bread :title="breadName"></saas-bread>
    <i-form 
      class="w-form-wrap" 
      :model="formData" 
      :label-width="106" 
      label-position="left" 
      style="position: relative;">
      <!-- 类型 -->
      <i-form-item label="类型" class="w-50">
        <RadioGroup class="block form-item-group" v-model="formData.type">
          <Radio v-for="(item, index) in memberCardType" :label="item.value" :key="index">{{item.label}}</Radio>
        </RadioGroup>
      </i-form-item>
      <!-- 名称 -->
      <i-form-item label="名称" prop="name" class="w-50">
        <i-input class="form-item-input" v-model="formData.name"></i-input>
        <div v-if="errorTip.name" class="error-tip">{{errorTip.name}}</div>
      </i-form-item>
      <!-- 卡片封面 -->
      <i-form-item label="卡片封面" class="block">
        <div class="form-item-row flex vertical-row">
          <RadioGroup class="form-item-group" v-model="formData.coverType" vertical>
            <Radio v-for="(item, index) in memberCardCoverType" :label="item.value" :key="index">{{item.label}}</Radio>
          </RadioGroup>
          <div class="content">
            <ColorPicker v-model="formData.bgColor" class="content-item" />
            <div class="flex content-item">
              <upload-img 
                class="cover-img"
                v-model="formData.coverId"
                :maxCount="1"
                :headers="headers"
                :imgSize="250"
                :cutScale="[250, 170]"
                :isCut="true">
                <span class="cover-slot" slot="content">上传</span>
              </upload-img>
              <span class="tip">尺寸：1000 x 630像素，小于1M，支持JPG、PNG格式</span>
            </div>
          </div>
        </div>
        <div v-if="errorTip.coverType" class="error-tip">{{errorTip.coverType}}</div>
      </i-form-item>
      <!-- 有效期 -->
      <i-form-item label="有效期" class="block">
        <div class="form-item-row flex vertical-row">
          <RadioGroup class="form-item-group" v-model="formData.expiryType" vertical>
            <Radio v-for="(item, index) in memberCardExpiryType" :label="item.value" :key="index">{{item.label}}</Radio>
          </RadioGroup>
          <div class="content">
            <div class="content-item"></div>
            <div class="flex content-item">
              <format-input 
                class="w-150"
                v-model="formData.expiryDays" :min="1">
                <span slot="append">天</span>
              </format-input>
              <span class="tip">内有效</span>
            </div>
            <div class="flex content-item">
              <DatePicker v-model="formData.expiryFrom" type="date" placeholder="开始日期" @on-change="expiryFromChange" class="w-150"></DatePicker>
              <span class="tip">-</span>
              <DatePicker v-model="formData.expiryTo" type="date" :options="endOptions"  placeholder="结束日期"  class="w-150"></DatePicker>
            </div>
          </div>
        </div>
        <div v-if="errorTip.expiryType" class="error-tip">{{errorTip.expiryType}}</div>
      </i-form-item>
      <!-- 卡片数量 -->
      <i-form-item label="卡片数量" class="block">
        <div class="form-item-row flex vertical-row">
          <RadioGroup class="form-item-group" v-model="cardCountType" vertical>
            <Radio label="0">无限数量</Radio>
            <Radio label="1">有限数量</Radio>
          </RadioGroup>
          <div class="content">
            <div class="content-item"></div>
            <div class="flex content-item">
              <format-input 
                class="w-150"
                v-model="formData.cardCount" :min="1" reg="NUMBER">
                <span slot="append">张</span>
              </format-input>
            </div>
          </div>
        </div>
        <div v-if="errorTip.cardType" class="error-tip">{{errorTip.cardType}}</div>
      </i-form-item>
      <!-- 车牌数量 -->
      <i-form-item label="车牌数量" class="block">
        <div class="form-item-row flex vertical-row">
          <RadioGroup class="form-item-group" v-model="plateCountType" vertical>
            <Radio label="0">无限数量</Radio>
            <Radio label="1">有限数量</Radio>
          </RadioGroup>
          <div class="content">
            <div class="content-item"></div>
            <div class="flex content-item">
            <format-input 
              class="w-150"
              v-model="formData.plateCount" :min="1" reg="NUMBER">
              <span slot="append">个</span>
            </format-input>
              <!-- <i-input class="w-150"></i-input> -->
            </div>
          </div>
        </div>
        <div v-if="errorTip.carType" class="error-tip">{{errorTip.carType}}</div>
      </i-form-item>
      <!-- 折扣 -->
      <i-form-item label="折扣" class="block" v-if="formData.type === '1'">
        <div class="form-item-row flex vertical-row">
          <RadioGroup class="form-item-group" v-model="discountType" vertical>
            <Radio label="0">不折扣</Radio>
            <Radio label="1">折扣</Radio>
          </RadioGroup>
          <div class="content">
            <div class="content-item"></div>
            <div class="flex content-item">
              <format-input class="w-150" v-model="formData.discount" :min="0" reg="PRECISION">
                <span slot="append">折</span>
              </format-input>
              <!-- <i-input class="w-150"></i-input> -->
            </div>
          </div>
        </div>
      </i-form-item>
      <!-- 项目信息 -->
      <i-form-item label="项目信息" class="block line" v-if="formData.type === '0'">
        <service-list v-model="formData.serviceList" @on-change="serviceChange"></service-list>
        <div v-if="errorTip.serviceList" class="error-tip">{{errorTip.serviceList}}</div>
      </i-form-item>
      <!-- 充值信息 -->
      <i-form-item label="充值信息" class="block line">
        <div class="form-item-row flex">
          <span class="label">面额</span>
            <format-input class="w-150" v-model="formData.amount" :min="0" reg="PRECISION" :disabled="formData.type === '0'">
              <span slot="append">元</span>
            </format-input>
          <span class="tip">注：面额可在出售会员卡时根据实际情况调整</span>
        </div>
        <div class="form-item-row flex">
          <span class="label">售价</span>
            <format-input class="w-150" v-model="formData.salePrice" reg="PRECISION">
              <span slot="append">元</span>
            </format-input>
          <span class="tip" v-if="formData.type === '1'">充值 {{formData.salePrice}} 元送 {{getMoney}} 元</span>
        </div>
      </i-form-item>
      <!-- 备注 -->
      <i-form-item label="备注" class="block line">
        <i-input v-model="formData.remark" type="textarea" style="width: 456px" :rows="3"></i-input>
      </i-form-item>
      <!-- <i-form-item class="form-item-submit block">
        <i-button type="error" @click="submit" :loading="btnLoading">确定</i-button>
        <i-button type="default">取消</i-button>
      </i-form-item> -->
      <Spin v-if="loading" fix></Spin>
      <!-- <div 
        class="card-wrap" 
        :style="(formData.coverType === 'bgColor' || !formData.coverId[0]) ? 'background-color:' + formData.bgColor : 'background-image: url(' + imgUrl + formData.coverId[0] + ')'">
        <p class="title">广东修炼汽车维修有限公司</p>
        <span class="type">{{getLabel(formData.type, memberCardType)}}</span>
        <p>{{formData.name || '--'}}</p>
        <p>{{getLabel(formData.expiryType, memberCardExpiryType)}}</p>
      </div> -->
    </i-form>
    
    <!-- 提交按钮 -->
    <bottom-submit 
      @on-cancel="$router.go(-1)" 
      @on-confirm="submit"
      :loading="btnLoading">
    </bottom-submit>
  </div>
</template>

<script>
  import '@/styles/components/form.less';
  import '@/styles/views/market/card-form.less';
  import { storage, formatTime } from '@/assets/js/utils';
  import UploadImg from '@/components/upload-image';
  import ServiceList from './service-list';
  import { getUri } from '@/https/api';
  import { memberCardType, memberCardExpiryType, memberCardCoverType, getLabel } from '@/store/json/default';
  export default {
    components: { UploadImg, ServiceList },
    data () {
      return {
        id: '',
        imgUrl: getUri('checkImg'),
        isCreate: false,
        breadName: '新增会员卡模板',
        loading: false,
        btnLoading: false,
        headers: {
          Authorization: storage.get('TOKEN')
        },
        getLabel,
        memberCardType,
        memberCardExpiryType,
        memberCardCoverType,
        cardCountType: '0',
        plateCountType: '0',
        discountType: '0',
        formData: {
          type: '0',                      // 会员卡类型
          name: '',                       // 充值卡名称
          coverType: 'bgColor',           // 封面类型
          bgColor: '#333840',             // 背景颜色 
          coverId: [],                    // 背景图片
          expiryType: '0',                // 有效期类型
          expiryDays: '',                 // N天内有效
          expiryFrom: '',                 // 范围内有效 开始时间
          expiryTo: '',                   // 范围内有效 结束时间
          cardCount: '1',                  // 卡牌数量
          plateCount: '1',                 // 车牌数量
          discount: '',                   // 折扣
          amount: '0',                    // 面额
          salePrice: '0',                 // 售价
          serviceList: [
            // {
            //   serviceId: '',           // 服务项目ID
            //   count: '1',              // 项目数量
            // }
          ],
          remark: '',                     // 备注
        },

        startOptions: {
          disabledDate (date) {
            return date && date.valueOf() < Date.now();
          }
        },

        endOptions: {
          disabledDate: (date) => {
            return date && date.valueOf() < new Date(this.formData.expiryFrom);
          }
        },

        errorTip: {
          name: '',
          coverType: '',
          expiryType: '',
          cardType:'',
          carType:'',
          serviceList: ''
        }
      }
    },

    computed: {
      getMoney () {
        let amount = Number(this.formData.amount || 0);
        let salePrice = Number(this.formData.salePrice || 0);
        let money = (amount - salePrice).toFixed(2);
        return money;
      }
    },

    created () {
      this.id = this.$route.params.id;
      this.isCreate = this.id === "create";
      if (!this.isCreate) this.getData();
    },

    methods: {
      async getData () {
        this.loading = true;
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'memberCardDetail',
            params: {
              _id: this.id
            }
          });

          if (res.code === '0') {
            const data = res.data;
            if (!data.bgColor) data.bgColor = '#333840';
            if (data.coverId) data.coverId = [data.coverId];
            else data.coverId = [];
            data.serviceList = data.serviceList.map(elm => {
              elm.serviceName = elm.name;
              return elm;
            });
            if (data.cardCount > 0) this.cardCountType = '1';
            else data.cardCount = '';
            if (data.plateCount > 0) this.plateCountType = '1';
            else data.plateCount = '';
            if (data.discount > 0) {
              this.discountType = '1';
              data.discount = parseFloat((data.discount * 10).toFixed(2));
            } else data.discount = '';
            this.formData = data;
          }

          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },

      expiryFromChange (v) {
        let start = new Date(v).getTime();
        let end = new Date(this.formData.expiryTo).getTime();
        if (start > end) {
          this.formData.expiryTo = this.formData.expiryFrom;
        }
      },

      serviceChange (data) {
        this.computedCost(data);
      },

      computedCost (data) {
        let cost = 0;
        data.forEach(elm => {
          cost += Number(elm.cost || 0) * elm.count;
        });
        this.formData.amount = parseFloat(cost.toFixed(2));
        if (!this.formData.salePrice) this.formData.salePrice = parseFloat(cost.toFixed(2));
      },

      async submit () {
        const data = this.formatParams();
        if (!data.isValid) return;
        this.btnLoading = true;
        try {
          const params = data.params;
          const res = await this.$store.dispatch({
            type: 'actionPost',
            name: 'memberCardSave',
            params
          });

          if (res.code === '0') {
            this.$Message.success({
              content: '保存成功',
              onClose: () => {
                this.btnLoading = false;
                this.$router.push('/market/template');
              }
            });
          } else {
            this.btnLoading = false;
          }
        } catch (error) {
          this.btnLoading = false;
          this.$Message.error('保存失败');
        }
      },

      // expiryTypeChange (type) {
      //   if (type === '0') {
      //     this.rules.expiryDays[0].required = false;
      //     this.rules.expiryForm[0].required = false;
      //   } else if (type === '1') {
      //     this.rules.expiryDays[0].required = true;
      //     this.rules.expiryForm[0].required = false;
      //   } else {
      //     this.rules.expiryDays[0].required = false;
      //     this.rules.expiryForm[0].required = true;
      //   }
      // },

      formatParams () {
        // 清空错误提示
        for (const key in this.errorTip) this.errorTip[key] = '';

        const formData = this.formData;
        const params = {
          type: formData.type,                   // 会员卡类型
          name: formData.name,                   // 充值卡名称
          coverType: formData.coverType,         // 封面类型
          expiryType: formData.expiryType,       // 有效期类型
          remark: formData.remark,                     // 备注
        };
        // 会员卡名称
        this.errorTip.name = formData.name ? '' : "请填写会员卡名称";

        // 封面
        if (formData.coverType === 'bgColor') {
          this.errorTip.coverType = formData.bgColor ? '' : "请选择封面颜色";
          params.bgColor = formData.bgColor;
        } else {
          this.errorTip.coverType = formData.coverId[0] ? '' : "请选择封面图片";
          params.coverId = formData.coverId[0];
        }


        // 有效期
        if (this.formData.expiryType === '0') {
          this.errorTip.expiryType = '';
        } else if (this.formData.expiryType === '1') {
          this.errorTip.expiryType = formData.expiryDays ? '' : '请输入有效天数';
          params.expiryDays = formData.expiryDays;
        } else {
          if (formData.expiryFrom && formData.expiryTo) this.errorTip.expiryType = '';
          else if (!formData.expiryFrom) this.errorTip.expiryType = '请选择开始日期';
          else if (!formData.expiryTo) this.errorTip.expiryType = '请选择结束日期';

          if (formData.expiryFrom) params.expiryFrom = formatTime(formData.expiryFrom, 'yyyy-MM-dd');
          if (formData.expiryTo) params.expiryTo = formatTime(formData.expiryTo, 'yyyy-MM-dd');
        }

        params.cardCount =this.cardCountType==0?0:( formData.cardCount || 0);
        params.plateCount = this.plateCountType==0?0:( formData.plateCount || 0);
        
        // 服务卡
        if (formData.type === '0') {
          this.errorTip.serviceList = formData.serviceList.length ? '' : '请选择服务项目';
          params.serviceList = formData.serviceList;
        } else {
          params.discount = ((formData.discount || 0) / 10).toFixed(2);
        }

        params.amount = formData.amount || 0;
        params.salePrice = formData.salePrice || 0;

        let isValid = true;
        for (const key in this.errorTip) {
          const element = this.errorTip[key];
          if (element) isValid = false;
        }

        if (formData._id) params._id = formData._id;
        return { params, isValid }
      }
    }
  }
</script>
