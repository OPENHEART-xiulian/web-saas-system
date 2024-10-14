<template>
  <!-- 调拨单详情 -->
  <div class="allocation-detail">
    <saas-bread title="查看调拨单">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">取消</Button>
        <Button type="error" @click="print">打印</Button>
      </template>
    </saas-bread>
    <div class="allocation-content">
      <div class="flex">
        <ul class="content-top">
          <li><span>单号：</span>{{ detail.allotCode }}</li>
          <li><span>制单人：</span>{{ detail.createdBy }}</li>
          <li><span>调拨人：</span>{{ detail.operatedBy }}</li>
          <li><span>备注：</span>{{ detail.remark || '--' }}</li>
        </ul>
        <ul class="content-top">
          <li><span>调拨类型：</span>{{ getLabel(detail.allotType,this.allotTypeList) }}</li>
          <li><span>调入门店：</span>{{ detail.callinStoreName }}</li>
          <li><span>调入申请单号：</span>{{ detail.allotApplyNo }}</li>
        </ul>
      </div>
      <div class="w-table">
        <Table :columns="columns" :data="detail.components"></Table>
      </div>
      <div class="bottom">
        <div class="right">
          <p>调仓数量：<span>{{ detail.totalQuantity }}件</span></p>
          <p>{{ detail.components && detail.components.length }}种配件</p>
        </div>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>
    
    <print ref="print"></print>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import { allotTypeList ,getLabel } from '@/store/json/default'
import print from './print';
import '@/styles/components/table.less';
import '@/styles/views/inventory/allocation-detail.less';

export default {
  data () {
    return {
      allotTypeList,
      id: this.$route.params.id,
      columns: [
        { title: '配件名称', key: 'partName' },
        { 
          title: '调出仓库', 
          render: (h, { row }) => {
            return h('div', row.allotOut.warehouseName);
          }
        },
        { 
          title: '调出货位', 
          render: (h, { row }) => {
            return h('div', row.allotOut.shelfName);
          } 
        },
        { title: '可调数量', key: 'originQuantity' },
        { title: '调出数量', key: 'quantity' },
        // { 
        //   title: '调入仓库', 
        //   render: (h, { row }) => {
        //     return h('div', row.allotIn.warehouseName);
        //   } 
        // },
        // { 
        //   title: '调入货位',
        //   render: (h, { row }) => {
        //     return h('div', row.allotIn.shelfName);
        //   } 
        // },
      ]
    }
  },

  created () {
    this.$store.dispatch({
      type: 'toGetAllocationDetail',
      params: {
        _id: this.id,
        shareStoreId:this.$route.query.shareStoreId
      }
    })
  },

  computed: {
    ...mapGetters({
      detail: 'getAllocationDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  methods: {
    print () {
      this.$refs.print.openPrint(this.id,this.$route.query.shareStoreId);
    },
    getLabel
  },

  components: { print }
}
</script>
