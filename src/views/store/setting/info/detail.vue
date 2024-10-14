<template>
  <div class="information-detail">
    <!--
    <w-tab
      :tab-index="0"
      @tab-change="tabChange"
      :tabList="['基本信息', '主修项目']"
    ></w-tab> -->
    <!-- <div class="information-box">
      <ul>
        <li>
          <span>门店名称</span>
          <span>{{ formData.storeName || '--' }}</span>
        </li>
        <li>
          <span>业务类型</span>
          <span>{{ getObj(manageTypeArr)[formData.category] || '--'}}</span>
        </li>
        <li>
          <span>统一社会信用代码</span>
          <span>{{ formData.socialCode || '--' }}</span>
        </li>
        <li>
          <span>道路运输经营许可证号</span>
          <span>{{ formData.licenseNo || '--' }}</span>
        </li>
        <li>
          <span>门店区域</span>
          <span>{{getCityText(formData.provinceCode) + getCityText(formData.cityCode) + getCityText(formData.countyCode)}}</span>
        </li>
        <li>
          <span>详细地址</span>
          <span>{{ formData.address || '--'}}</span>
        </li>
      </ul>
      <Spin
        fix
        v-if="loading"
      ></Spin>
    </div> -->
    <div
      class="information-box"
      v-if="!loading"
    >
      <!-- <p class="title">营业信息</p> -->
      <no-data
        title="暂无营业信息"
        :show-btn='permiss.editInfo'
        btnText="立即完善"
        :create="edit"
        v-if="businessInfo.majorBrand.length === 0"
      >
      </no-data>
      <ul v-else>
        <li>
          <span>门店类型</span>
          <span>{{businessInfo.storeType | getStoreType}}</span>
        </li>
        <li>
          <span>营业时间</span>
          <span>{{businessInfo.openAt || '--'}}至{{businessInfo.closeAt || '--'}}</span>
        </li>
        <li>
          <span>联系电话</span>
          <span>{{businessInfo.serviceTelList.length > 0 ? businessInfo.serviceTelList.join('、') : '--'}}</span>
        </li>
        <li>
          <span>主修车型</span>
          <span v-if="businessInfo.majorCarStyle">{{majorCar.filter(item=>item.value===businessInfo.majorCarStyle)[0].label}}</span>
        </li>
        <li>
          <span>主修品牌</span>
          <span>{{businessInfo.majorBrand | getStr}}</span>
        </li>
        <li>
          <span>主营业务</span>
          <span>{{businessInfo.majorBusiness | getStr}}</span>
        </li>
        <li>
          <span>门店简介</span>
          <span>{{businessInfo.scope || '--'}}</span>
        </li>
        <li>
          <span>门店实景图</span>
          <upload-img
            :can-upload="false"
            v-model="businessInfo.imgId"
          ></upload-img>
        </li>
        <li v-if="permiss.editInfo">
          <span></span>
          <router-link class="edit-btn" to="/store/setting/info/form">编辑信息</router-link>
        </li>
      </ul>
      <Spin
        fix
        v-if="loading"
      ></Spin>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
import noData from '@/components/no-data'
import UploadImg from '@/components/upload-image'
import { storage } from '@/assets/js/utils'
import { getCityText } from '@/store/json/city.js'
import {
  storeType,
  getLabel,
  manageTypeArr,
  getObj,
  majorCar
} from '@/store/json/default.js'
import '@/styles/views/store/information-detail.less'

export default {
  components: { noData, UploadImg },
  data () {
    let permiss = this.$permission.data.settingStore;
    return {
      permiss,
      getCityText,
      manageTypeArr,
      getObj,
      majorCar,
      informationDetail: storage.get('STORE'),
      businessInfo: { majorBrand: [] }
    }
  },
  mounted () {
    this.getDetailData()
  },
  watch: {
    formData (to) {
      if (to.businessInfo) {
        this.businessInfo = to.businessInfo
      }
    }
  },
  methods: {
    tabChange () {
      this.$router.push('/store/information/majorRepair')
    },
    getDetailData () {
      this.$store.dispatch({
        type: 'toGetStoreDetail',
        params: {
          storeId: this.informationDetail.storeId
        }
      })
    },
    edit () {
      this.$router.push('/store/setting/info/form')
    }
  },
  filters: {
    getStoreType (v) {
      return getLabel(v, storeType)
    },
    getStr (v) {
      if (v.length === 0) return '--'
      return v.join('、')
    }
  },
  computed: {
    ...mapGetters({ formData: 'getStoreDetail' }),
    ...mapState({ loading: state => state.global.isLoading })
  }
}
</script>

<style lang="less">
  .information-detail .edit-btn {
    padding: 2px 20px;
    color: white;
    font-size: 14px;
    margin-top: 20px;
    background: #ff8800;
    border-radius: 3px;
  }
</style>
