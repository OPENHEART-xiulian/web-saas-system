<template>
  <!-- 采购报表 -->
  <div class="overview-wrap">
    <saas-bread title="采购报表">
      <template slot="actions">
        <div class="flex ac" v-if="this.$storage.get('STORE').isChainStore&&this.$storage.get('STORE').isMasterStore">
          选择门店：
          <Select v-model="subStoreId" style="width: 200px" @on-change="onChange">
            <Option v-for="(item, index) in storeAdminList" :key="index" :value="item._id">{{item.storeName}}</Option>
          </Select>
          <!--<saas-store-select v-model="vv"/>-->
        </div>
      </template>
    </saas-bread>
    <div class="overview-content">
      <h2 class="overview-content__title">{{storeItem.storeName}}</h2>
      <Row>
        <i-col span="6" 
          v-for="(item, index) in lists" 
          :key="index"
          @click.native.stop="toLink(item.key)">
          <div class="item">
            <!-- <i :class="['iconfont', item.icon]" 
              :style="{background: item.color}"></i> -->
            <img :src="'/images/datareport/' + item.icon" :alt="item.name">
            <span>{{ item.name }}</span>
          </div>
        </i-col>
      </Row>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { storage } from '@/assets/js/utils.js';
import '@/styles/views/datareport/overview.less';

export default {
  data () {
    let lists = this.$permission.getPermissionTab('dataPurchaseList');
    return {
      subStoreId: '',
      lists,
      storeList: [],
      storeItem: {}
    }
  },

  watch: {
    storeAdminList (to) {
      if (to.length > 0) {
        this.storeList = to;
        let userInfo = storage.get('USER');
        let data = to.find(elm => elm._id === userInfo.storeId);
        this.onChange(data._id || to[0]._id);
      }
    }
  },

  computed: {
    ...mapGetters({
      storeAdminList: 'getStoreAdminList'
    })
  },

  mounted () {
    this.$store.dispatch('actionStoreAdminList');
  },

  methods: {
    onChange (v) {
      this.subStoreId = v;
      let data = this.storeList.find(elm => elm._id === v);
      this.storeItem = data || this.storeList[0];
    },
    toLink (key) {
      this.$router.push('/datareport/purchase/' + key + "?subStoreId=" + this.subStoreId);
    }
  },
}
</script>
