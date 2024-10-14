<template>
  <!-- 数据备份 -->
  <div class="backup-wrap">
    <saas-bread title="数据备份">
      <template slot="actions">
        <div class="flex ac" v-if="this.$storage.get('STORE').isChainStore&&this.$storage.get('STORE').isMasterStore">
          选择门店：
          <Select v-model="subStoreId" style="width: 200px" @on-change="getBackipData">
            <Option v-for="(item, index) in storeAdminList" :key="index" :value="item._id">{{item.storeName}}</Option>
          </Select>
          <!--<saas-store-select v-model="vv"/>-->
        </div>
      </template>
    </saas-bread>
    <div class="backup-content">
      <h2 class="backup-content__title">{{storeItem.storeName}}</h2>
      <Row>
        <i-col span="6" 
          v-for="(item, index) in lists" 
          :key="index"
          @click.native.stop="toDialog(item.key)">
          <div class="item">
            <!-- <i :class="['iconfont', item.icon]" 
              :style="{background: item.color}"></i> -->
            <img :src="'/images/datareport/' + item.icon" :alt="item.name">
            <div class="text">
              <p>{{ item.name }}</p>
              <p v-if="item.date">上次备份时间：{{ item.date }}</p>
              <p v-else>暂无备份记录</p>
            </div>
            <Spin fix v-if="loading"></Spin>
          </div>
        </i-col>
      </Row>
    </div>
    <backup-dialog
      ref="backupDialog"
      :title="title"
      :content="content"
      :isFile="isFile"
      @on-ok="download"></backup-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import backupDialog from '@/components/dialog/backup-dialog';
import { getUri } from '@/https/api';
import { storage } from '@/assets/js/utils.js';
import '@/styles/views/datareport/backup.less';

export default {
  data () {
    let lists = this.$permission.getPermissionTab('dataBackupList');
    return {
      subStoreId: '',
      title: '',
      content: '',
      isFile: false,
      current: '',
      api: '',   // 下载api
      lists,
      storeList: [],
      storeItem: {},
      vv:''
    }
  },

  created () {
    this.init();
  },

  computed: {
    ...mapGetters({
      backupInfo: 'getBackupInfo',
      storeAdminList: 'getStoreAdminList'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    storeAdminList (to) {
      if (to.length > 0) {
        this.storeList = to;
        let userInfo = storage.get('USER');
        let data = to.find(elm => elm._id === userInfo.storeId);
        this.getBackipData(data._id || to[0]._id);
      }
    },
    backupInfo (val) {
      if (val) {
        this.lists.forEach((item) => {
          for (let i in val) {
            if (item.key === i) item.date = val[i];
          }
        })
      }
    }
  },

  methods: {
    init () {
      this.$store.dispatch('actionStoreAdminList');
    },

    getBackipData (v) {
      this.subStoreId = v;
      let data = this.storeList.find(elm => elm._id === v);
      this.storeItem = data || this.storeList[0];
      this.$store.dispatch({
        type: 'toGetbackupInfo',
        params: {
          subStoreId: v
        }
      });
    },

    toDialog (key) {
      this.current = key;
      switch (key) {
        case 'customerBackupDate':
          this.isFile = false;
          this.title = '确定备份客户档案';
          this.content = '点击下载，系统全部客户档案将自动下载至电脑。';
          this.api = 'customerExport';
          break;
        case 'componentBackupDate':
          this.isFile = false;
          this.title = '确定备份维修配件';
          this.content = '点击下载，系统全部维修配件信息将自动下载至电脑。';
          this.api = 'componentExport';
          break;
        case 'maintenanceBackupDate':
          this.isFile = true;
          this.title = '确定备份维修档案';
          this.content = '默认下载全部维修档案，选择时间段可下载指定时间段维修档案。';
          this.api = 'maintenanceExport';
          break;
        case 'serviceBackupDate':
          this.isFile = false;
          this.title = '确定备份服务项目';
          this.content = '点击下载，系统全部服务项目将自动下载至电脑。';
          this.api = 'serviceExport';
          break;
        default:
          break;
      }
      this.$refs.backupDialog.openModal();
    },

    download (form) {
      let url = getUri(this.api) + '?token=' + storage.get('TOKEN');
      let string = '';
      if (this.isFile) {
        for (let i in form) {
          if (form[i]) {
            string = string + '&' + i + '=' + form[i];
          }
        }

        url = url + string;
      }
      url += '&subStoreId=' + this.subStoreId;
      window.location.href = url;
      this.$refs.backupDialog.onCancel();
      this.getBackipData(this.subStoreId);
    }
  },

  components: { backupDialog }
}
</script>
