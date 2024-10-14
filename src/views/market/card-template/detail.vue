<template>
  <!-- 会员卡模板详情 -->
  <div class="card-form">
    <saas-bread title="会员卡模板详情">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
      </template>
    </saas-bread>
    <i-form 
      class="w-form-wrap" 
      :model="formData" 
      :label-width="106" 
      label-position="left" 
      style="position: relative;">
      <!-- 类型 -->
      <i-form-item label="类型" class="w-50">
        {{getLabel(formData.type, memberCardType)}}
      </i-form-item>
      <!-- 名称 -->
      <i-form-item label="名称" prop="name" class="w-50">
        {{formData.name}}
      </i-form-item>
      <!-- 卡片封面 -->
      <i-form-item label="卡片封面" class="block">
        <div class="color-bg" v-if="formData.coverType === 'bgColor'">
          <div :style="'background-color:' + formData.bgColor"></div>
        </div>
        <div class="img-bg" v-else :style="'background-image: url(' + imgUrl + formData.coverId + ')'"></div>
      </i-form-item>
      <!-- 有效期 -->
      <i-form-item label="有效期" class="block">
        {{getExpiryDate}}
      </i-form-item>
      <!-- 卡片数量 -->
      <i-form-item label="卡片数量" class="block">
        {{formData.cardCount == '0' ? '无限数量' : formData.cardCount + '张'}}
      </i-form-item>
      <!-- 车牌数量 -->
      <i-form-item label="车牌数量" class="block">
        {{formData.plateCount == '0' ? '无限数量' : formData.plateCount + '个'}}
      </i-form-item>
      <!-- 折扣 -->
      <i-form-item label="折扣" class="block" v-if="formData.type === '1'">
        {{formData.discount == '0' ? '不折扣' : formData.discount + '折'}}
      </i-form-item>
      <!-- 项目信息 -->
      <i-form-item label="项目信息" class="block line" v-if="formData.type === '0'">
        <div class="components-list-wrap">
          <table class="table">
            <thead>
              <tr>
                <th class="center" style="width: 80px;">序号</th>
                <th style="width: 220px">项目名称</th>
                <th style="width: 140px">数量</th>
                <th>单价</th>
              </tr>
            </thead>
            <tbody>
              <tr class="no-data" v-if="!formData.serviceList.length">
                <td colspan="5" class="center">暂无服务项目</td>
              </tr>
              <tr v-for="(item, index) in formData.serviceList" :key="index">
                <td class="center">
                  <span>{{index + 1}}</span>
                </td>
                <td>
                  <span>{{item.name}}</span>
                </td>
                <td>
                  <span>{{item.count || 0}}</span>
                </td>
                <td>
                  <span>{{item.cost || 0}}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </i-form-item>
      <!-- 充值信息 -->
      <i-form-item label="面额" class="block line">
        {{formData.amount || 0}}元
      </i-form-item>
      <i-form-item label="售价">
        {{formData.salePrice || 0}}元
      </i-form-item>
      <!-- 备注 -->
      <i-form-item label="备注" class="block line">
        {{formData.remark || '--'}}
      </i-form-item>
      <Spin v-if="loading" fix></Spin>
      <!-- <div 
        class="card-wrap" 
        :style="(formData.coverType === 'bgColor' || !formData.coverId) ? 'background-color:' + formData.bgColor : 'background-image: url(' + imgUrl + formData.coverId + ')'">
        <p class="title">广东修炼汽车维修有限公司</p>
        <span class="type">{{getLabel(formData.type, memberCardType)}}</span>
        <p>{{formData.name || '--'}}</p>
        <p>{{getLabel(formData.expiryType, memberCardExpiryType)}}</p>
      </div> -->
    </i-form>
  </div>
</template>

<script>
  import '@/styles/components/form.less';
  import '@/styles/views/market/card-form.less';
  import '@/styles/views/market/list-component.less';
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
        loading: false,
        getLabel,
        memberCardType,
        memberCardExpiryType,
        memberCardCoverType,
        formData: {
          type: '0',                      // 会员卡类型
          name: '',                       // 充值卡名称
          coverType: 'bgColor',           // 封面类型
          bgColor: '#333840',             // 背景颜色 
          coverId: '',                    // 背景图片
          expiryType: '0',                // 有效期类型
          expiryDays: '',                 // N天内有效
          expiryFrom: '',                 // 范围内有效 开始时间
          expiryTo: '',                   // 范围内有效 结束时间
          cardCount: '',                  // 卡牌数量
          plateCount: '',                 // 车牌数量
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
        }
      }
    },

    computed: {
      getExpiryDate () {
        const formData = this.formData;
        if (formData.expiryType === '0') {
          return '永久有效';
        } else if (formData.expiryType === '1') {
          return (formData.expiryDays || 0) + '天'
        } else {
          return formatTime(formData.expiryFrom, 'yyyy-MM-dd') + ' - ' + formatTime(formData.expiryTo, 'yyyy-MM-dd');
        }
      }
    },

    created () {
      this.id = this.$route.params.id;
      this.getData();
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
            data.discount = parseFloat((data.discount * 10).toFixed(2));
            this.formData = data;
          }

          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      }
    }
  }
</script>
