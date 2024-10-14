<template>
  <!-- 供应商详情 -->
  <div class="supplier-detail">
    <saas-bread title="供应商详情">
      <template slot="actions">
        <Button type="default" @click="$router.go(-1)">返回</Button>
      </template>
    </saas-bread>
    <div class="supplier-top">
      <Circle stroke-color="#FF8000"
        :size="78" :percent="Math.round(parseFloat(supplierDetail.fulfillPercent) * 10000) / 100">
        <p>{{ (Math.round(parseFloat(supplierDetail.fulfillPercent) * 10000) / 100) || 0  }}%</p>
        <p>供应商信息</p>
      </Circle>
      <div class="msg">
        <p>{{ supplierDetail.supplierName }}</p>
        <Button type="default" @click="toEdit" v-if="this.$route.query.isSelfStore!='false'">完善信息</Button>
      </div>
      <ul>
        <li v-for="(item, index) in dataList" :key="index">
          <p>{{ item.title }}</p>
          <p>{{ item.value || 0 }}</p>
          <p>{{ item.unit }}</p>
        </li>
      </ul>
      <Spin fix v-if="loading"></Spin>
    </div>

    <w-table
      ref="table"
      :params="{
        supplierId: id,
        shareStoreId:this.$route.query.shareStoreId
      }"
      class="table-width supplier-detail-table"
      request="supplierComponents"
      :columns="columns"
      :tableData="tableData">
    </w-table>
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import {getUri} from '@/https/api.js';
import { formatTime } from '@/assets/js/utils';
import '@/styles/views/inventory/supplier-detail.less';

export default {
  data () {
    return {
      id: this.$route.params.id,
      dataList: [
        { title: '采购总金额', value: 0, unit: '元' },
        { title: '采购配件总数', value: 0, unit: '件' },
        { title: '待结账金额', value: 0, unit: '元' },
      ],
      columns: [
        { title: '序号', type: 'index', width: 65 },
        { 
          title: '图片', 
          key: 'imgIds',
          width: 65,
          render: (h, { row }) => {
            return h('my-img', {
              props: {
                src: row.imgIds && row.imgIds[0] ? getUri('checkImg') + row.imgIds[0] : ''
              },
              style: {
                width: '40px',
                height: '40px'
              }
            });
          }
        },
        { title: '配件编号', key: 'partNo' ,className:'peijianWidth' },
        { title: '原厂编码', key: 'partFactoryNo' },
        { title: '名称', key: 'partName' },
        { 
          title: '品牌', 
          key: 'brand',
          render: (h, { row }) => {
            return h('div', row.brand || '--');
          } 
        },
        { title: '采购单号', key: 'purchaseCode' },
        { 
          title: '采购时间', 
          key: 'purchaseAt',
          render: (h, { row }) => {
            return h('div', (row.purchaseAt && formatTime(row.purchaseAt, 'yyyy-MM-dd HH:mm:ss')) || '--')
          } 
        },
        { title: '采购数量', key: 'quantity' },
        { title: '单价', key: 'purchasePrice' },
        { title: '金额', key: 'totalPurchaseCost' },
      ]
    }
  },

  created () {
    this.init();
  },

  computed: {
    ...mapGetters({
      tableData: 'getTableData',
      supplierDetail: 'getSupplierDetail'
    }),

    ...mapState({ loading: (state) => state.global.isLoading })
  },

  watch: {
    supplierDetail (val) {
      if (val) {
        this.dataList[0].value = val.totalCost;
        this.dataList[1].value = val.totalQuantity;
        this.dataList[2].value = val.toSettle;
      }
    }
  },

  methods: {
    init () {
      this.$store.dispatch({
        type: 'toGetSupplierDetail',
        params: {
          supplierId: this.id
        }
      })
    },

    toEdit () {
      this.$router.push('/inventory/supplier/add/' + this.id);
    }
  },
}
</script>
<style>
  .peijianWidth{
    width: 200px;
  }
</style>
