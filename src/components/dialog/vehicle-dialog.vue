<template>
  <Modal v-model="modal" width="700" 
    @on-visible-change="onVisibleChange" 
    class="w-dialog vehicle-dialog">
    <tab ref="tab" slot="header" @tab-change="tabChange" :step="true" :tab-list='tabList'></tab>
    <div class="no-data" v-if="brandInfo.length === 0">
      <Spin size="large"></Spin>
    </div>
    <div class="tab-content brand" v-show="tabIndex === 0">
      <div class="header">
        <span 
          v-for="(item, index) in brandInfo" 
          :key="index" 
          :class="[{'active': item.char === brandTitle}, {'disabled': !item.vehicleBrandList || item.vehicleBrandList.length === 0}]" 
          @click="brandChange(item.char, index, !item.vehicleBrandList || item.vehicleBrandList.length === 0)"
        >
          {{item.char}}
        </span>
      </div>
      <div class="content">
        <span v-for="(item, index) in getBrandContent" :key="index" 
          @click="selectBrand(item.vehicleBrand, item.brandId)" 
          :class="{'active': item.vehicleBrand === vehicleBrand}">
          <!-- <i class="iconfont icon-baoyangfuwu"></i> -->
          <my-img :src="GET_BRAND_LOGO + item.brandId"></my-img>
          {{item.vehicleBrand}}
        </span>
      </div>
    </div>

    <div class="tab-content subBrand" v-show="tabIndex === 1">
      <div v-for="item in getSubBrandList" :key="item.subBrand">
        <div class="select-brand">
          <span>{{ item.subBrand }}</span>
        </div>
        
        <div class="content">
          <span v-for="(citem, index) in item.seriesList" :key="index"
            @click="selectSubBrand(item.subBrand, citem.carSeries)" 
            :class="{'active': item.subBrand + '/' + citem.carSeries === subBrand + '/' + carSeries}">
            {{citem.carSeries}}
          </span>
        </div>
      </div>
    </div>

    <div class="tab-content subBrand" v-show="tabIndex === 2">
      <div v-for="(item, index) in getSeriesList" :key="index">
        <div class="select-brand">
          <span>{{ item.modelYear }}</span>
        </div>
        
        <div class="content">
          <span v-for="citem in item.carStyleList"
            :key="citem.carStyle"
            @click="selectSeriesList(citem)" 
            :class="{'active': formData === item}">
            {{ citem.carStyle }}
          </span>
        </div>
      </div>
    </div>
    <div slot="footer"></div>
  </Modal>
</template>

<script>
import { mapGetters } from 'vuex';
import '@/styles/components/dialog.less';
import tab from '@/components/tab';
import mixins from './dialog.mixin';
import { GET_BRAND_LOGO } from '@/https/api.js';
export default {
  components: { tab },
  mixins: [mixins],
  data () {
    return {
      GET_BRAND_LOGO,
      tabIndex: 0,
      tabList: ["选择品牌", "选择车系", "选择车型"],
      brandIndex: 0,
      brandTitle: '热门品牌',
      vehicleBrand: '',
      brandId: '',
      subBrand: '',
      carSeries: ''
    }
  },

  methods: {
    // 初始化数据， 有数据后不请求接口
    onVisibleChange (value) {
      if (value) {
        this.$refs.tab.init();
        this.tabIndex = 0;
        this.brandIndex = 0;
        this.brandTitle = '热门品牌';
        if (this.brandInfo.length !== 0) return;
        this.$store.dispatch('toGetBrandInfo');
      }
    },
    tabChange (index) {
      this.tabIndex = index;
    },
    // 选中之后不能点击
    brandChange (title, index, disabled) {
      if (disabled) return;
      this.brandTitle = title;
      this.brandIndex = index;
    },
    // 选择品牌
    selectBrand (value, brandId) {
      this.vehicleBrand = value;
      this.brandId = brandId;
      if (value === '其他品牌') {
        this.modal = false;
        this.$emit('on-ok', this.vehicleBrand, '', this.brandId, '', '');
      } else {
        this.$refs.tab.next();
      }
    },
    // 选择车系
    selectSubBrand (subBrand, carSeries) {
      this.subBrand = subBrand;
      this.carSeries = carSeries;
      this.$refs.tab.next();
    },
    // 选择车型
    selectSeriesList (data) {
      this.modal = false;
      this.$emit('on-ok', this.vehicleBrand, this.subBrand, this.brandId, this.carSeries, data.carStyle)
    }
  },
  computed: {
    ...mapGetters({
      brandInfo: 'getBrandInfo'
    }),

    // 车品牌
    getBrandContent () {
      let arr = [];
      if (this.brandInfo) {
        this.brandInfo.forEach((item, index) => {
          if (this.brandTitle == item.char) {
            arr = item.vehicleBrandList
          }
        })
      }
      
      return arr;
    },

    // 车系
    getSubBrandList () {
      let arr = [];
      if (this.getBrandContent) {
        this.getBrandContent.forEach((item, index) => {
          if (this.vehicleBrand == item.vehicleBrand) {
            arr = item.subBrandList
          }
        })
      }

      return arr;
    },

    // 车型
    getSeriesList () {
      let arr = [];
      if (this.getSubBrandList) {
        this.getSubBrandList.forEach((item, index) => {
          item.seriesList.forEach((citem) => {
            if (this.subBrand + this.carSeries === item.subBrand + citem.carSeries) {
              arr = citem.modelYears;
            }
          })
        })
      }
      return arr;
    } 
  }
}
</script>
