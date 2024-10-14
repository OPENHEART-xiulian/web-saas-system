<template>
  <!-- 仓库管理 -->
  <div class="warehouse-wrap">
    <saas-bread title="仓库管理"></saas-bread>
    <div class="warehouse-manage">
      <ul class="warehouse">
        <li v-for="(item, index) in warehouse" :key="index">
          <div :class="['list-item', {'active': index === curKey}]" 
            @click.stop="selectWarehouse(item.warehouseId, index)">
            <i class="iconfont icon-cangku append-icon"></i>
            <div class="text" v-if="item.isDefault === '1'">
              <p>{{ item.warehouseName }}</p>
              <p>默认仓库</p>
            </div>
            <span class="name" v-else
              :title="item.warehouseName">{{ item.warehouseName }}</span>
            <span class="opt">
              <i  v-if="permissionData.update" class="iconfont icon-bianji" 
                @click.stop="optWarehouse(1, '仓库', item.warehouseId, item.warehouseName, item.isDefault)"></i>
              <i class="iconfont icon-shanchu"
                v-if="item.isDefault === '0' && permissionData.delete"
                @click.stop="openDelModal('仓库', item.warehouseId)"></i>
            </span>
          </div>
        </li><li v-if="permissionData.create">
          <div class="list-item" @click="optWarehouse(0, '仓库')">
            <i class="iconfont icon-jiahao append-icon"></i>
            <span>新增仓库</span>
          </div>
        </li>
      </ul>
      <ul class="slotting" v-if="curKey !== ''">
        <li v-for="(item, index) in slotting" :key="index">
          <div class="list-item">
            <i class="iconfont icon-huowei append-icon"></i>
            <!-- <div class="text">
              <p>{{ item.shelfName }}</p>
              <p>已存放配件数:{{ item.count || 0 }}</p>
            </div> -->
            <span>{{ item.shelfName }}</span>
            <span class="opt">
              <i v-if="permissionData.updateZhy" class="iconfont icon-bianji"
                @click.stop="optWarehouse(1, '货位', item.shelfId, item.shelfName)"></i>
              <i v-if="permissionData.deleteZhy" class="iconfont icon-shanchu"
                @click.stop="openDelModal('货位', item.shelfId)"></i>
            </span>
          </div>
        </li><li v-if="permissionData.createZhy"> <!-- 不能换行，不然会出现空隙 -->
          <div class="list-item" @click="optWarehouse(0, '货位')">
            <i class="iconfont icon-jiahao append-icon"></i>
            <span>新增货位</span>
          </div>
        </li>
      </ul>
      <Spin fix v-if="loading"></Spin>
    </div>
    <warehouse-dialog ref="warehouseDialog"></warehouse-dialog>
    <del-dialog 
      ref="delDialog"
      :title="title"
      :content="content"
      @on-ok="del">
    </del-dialog>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import warehouseDialog from '@/components/dialog/warehouse-dialog';
import delDialog from '@/components/dialog/remind-dialog';
import '@/styles/views/inventory/warehouse-manage.less';

export default {
  data () {
    let permissionData = this.$permission.data.inventoryWarehouse;
    return {
      permissionData,
      title: '',
      content: '',
      curKey: 0,
      slotting: [],
      curWarehouseId: '',   // 当前仓库id
      delType: '',
      delId: ''
    }
  },

  created () {
    this.init();
  },

  computed: {
    ...mapGetters({
      warehouse: 'getWarehouseList'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    warehouse (val) {
      if (val) {
        this.curWarehouseId = val[this.curKey].warehouseId;
        this.getSlotting();
      }
    }
  },

  methods: {
    init () {
      this.$store.dispatch('toGetWarehouseList');
    },

    optWarehouse (opt, type, id, name, isDefault) {
      this.$refs.warehouseDialog.openModal(opt, type, id, name, isDefault);
    },

    openDelModal (type, id) {
      this.delType = type;
      this.delId = id;
      this.title = '删除' + type;
      if (type === '仓库') {
        this.content = '删除仓库后，该仓库的货位也将一起删除！关联该仓库的配件将失去仓库属性！';
      } else {
        this.content = '删除货位后，关联该货位的配件将失去货位属性！';
      }
      this.$refs.delDialog.openModal();
    },

    del () {
      const payload = {
        request: 'warehouseRemove'
      };
      if (this.delType === '仓库') {
        payload.params = {
          warehouseId: this.delId
        }
        payload.request = 'warehouseRemove';
      } else {
        payload.params = {
          shelfId: this.delId
        }
        payload.request = 'shelfRemove';
      }
      this.$store.dispatch({
        type: 'toDelWarehouse',
        payload
      }).then((res) => {
        if (res.code === '0') {
          this.$Message.success('删除成功');
          if (this.delType === '仓库' && this.curWarehouseId === this.delId) this.curKey = 0;
          this.init();
          this.$refs.delDialog.onCancel();
        } else {
          this.$Message.warning(res.msg);
        }
      }).catch((err) => {
        this.$store.commit('REQUEST_ERROR', { err });
      })
    },

    selectWarehouse (id, index) {
      this.curKey = index;
      this.curWarehouseId = id;
      this.getSlotting();
    },

    // 获取相应的货位
    getSlotting () {
      this.warehouse.forEach(item => {
        if (item.warehouseId === this.curWarehouseId) {
          this.slotting = item.shelves;
        }
      })
    }
  },

  components: { warehouseDialog, delDialog }  
}
</script>
