<template>
  <!-- 出库单详情 -->
  <div class="output-detail">
    <saas-bread title="查看出库单">
      <template slot="actions">
        <i-button class="shadow-btn" type="default" @click="$router.go(-1)">返回</i-button>
        <i-button class="shadow-btn" type="error" @click="openPrint">打印</i-button>
      </template>
    </saas-bread>
    <div class="header">
      <span>出库单号：{{ detail.stockOutNo }}</span> 
      <span>工单号：{{ detail.statementNo || "--" }}</span>
      <span>车牌号码：{{ detail.plateNo }}</span>
      <span>出库日期：{{ detail.stockOutDate || '--' }}</span>
      <span v-if="isChainStore">调拨申请单号：{{ detail.allotApplyNo || '--' }}</span>
      <span v-if="isChainStore">调入门店：{{ detail.callInStoreName || '--' }}</span>
    </div>
    <div class="output-detail-content">
      <table>
        <tr>
          <td class="plateno"><span>{{detail.plateNo || '暂无车牌号'}}</span></td>
          <td class="img">
            <my-img v-if="detail.brandId" :src="GET_BRAND_LOGO + detail.brandId"></my-img>
          </td>
          <td class="brand">{{detail.vehicleBrand || '暂无品牌'}}</td>
          <td class="name">{{detail.vehicleOwner || '匿名用户'}}</td>  
          <td class="mobile">{{detail.ownerMobile || '暂无手机号'}}</td>       
        </tr>
      </table>

      <div class="remark">
        <div class="right">
          <p>出库数量: <span>{{ detail.totalQuantity }}</span></p>
          <p>出库总额: <span>￥{{ detail.totalRetailSales }}</span></p>
          <p>成本总额: <span>￥{{ detail.totalPurchaseCost }}</span></p>
        </div>
      </div>
    </div>
    <div class="w-table" style="margin-top: 10px;">
      <Table stripe :columns="columns" :data="detail.items"></Table>
    </div>
    <Spin fix v-if="loading"></Spin>
    <print ref="print"></print>
  </div>
</template>

<script>
  import print from './print';
  import { unit, stockOutType, outputWorkerType, output, getObj } from '@/store/json/default';
  import { storage } from '@/assets/js/utils'
  import '@/styles/views/inventory/output-detail.less';
  import '@/styles/components/table.less';
  import { GET_BRAND_LOGO } from '@/https/api.js';
  export default {
    components: { print },
    data () {
      return {
        userList: [],
        loading: false,
        detail: {},
        GET_BRAND_LOGO,
        columns: [
          { title: '序号', type: 'index', width: 50 },
          { title: '配件编号', key: 'partNo', minWidth: 140 },
          { 
            title: '原厂编码',
            minWidth: 120, 
            key: 'partFactoryNo',
            render: (h, {row}) => {
              return h('div', row.partFactoryNo || '--');
            } 
          },
          { title: '配件名称', key: 'partName', minWidth: 100 },
          { 
            title: '供应商', 
            minWidth: 80,
            key: 'supplierStr',
            render: (h, {row}) => {
              return h('div', row.supplierStr || '--');
            }
          },
          { 
            title: '仓库',
            minWidth: 60, 
            key: 'warehouseName',
            render: (h, {row}) => {
              return h('div', row.warehouseName || '--');
            } 
          },
          { 
            title: '货位', 
            minWidth: 60,
            key: 'shelfName',
            render: (h, {row}) => {
              return h('div', row.shelfName || '--');
            }
          },
          {
            title: '出库类型',
            minWidth: 80,
            render: (h, { row }) => {
              return h('div', getObj(outputWorkerType)[this.detail.orderType] || "--");
            }
          },
          { 
            title: '出库数量', 
            minWidth: 80,
            key: 'usedQuantity'
          },
          { 
            title: '售价', 
            minWidth: 80,
            key: 'retailPrice',
            render: (h, {row}) => {
              return h('div', "￥" + Number(row.retailPrice).toFixed(2))
            }
          },
          { 
            title: '销售小计',
            minWidth: 80,
            key: 'totalRetailPrice',
            render: (h, {row}) => {
              return h('div', "￥" + Number(row.totalRetailPrice).toFixed(2))
            }
          },
          { 
            title: '成本价', 
            minWidth: 80,
            key: 'purchasePrice',
            render: (h, {row}) => {
              return h('div', "￥" + Number(row.purchasePrice).toFixed(2))
            }
          },
          { 
            title: '成本小计',
            minWidth: 80,
            key: 'totalPurchasePrice',
            render: (h, {row}) => {
              return h('div', "￥" + Number(row.totalPurchasePrice).toFixed(2))
            }
          },
          { 
            title: '负责人', 
            minWidth: 70,
            key: 'createdBy',
            render: (h, { row, column }) => {
              let user = this.userList.find(elm => elm._id == this.detail.billUserId);
              return h('div', user ? user.username : "--");
            }
          },
        ],
        isChainStore: storage.get('STORE').isChainStore || ''
      }
    },

    created () {
      this.getBillUsersList();
    },

    methods: {
      openPrint () {
        this.$refs.print.openPrint(this.$route.params.id);
      },

      async getBillUsersList () {
        this.loading = true;
        let data = await this.$store.dispatch({
          type: "getBillUsersList"
        });
        this.userList = data;
        this.getData();
      },

      async getData () {
        let res = await this.$store.dispatch({
          type: "actionGet",
          name: "outputCheck",
          params: { 
            stockOutNo: this.$route.params.id
          }
        });
        this.detail = res.data;
        this.loading = false;
      }
    }
  }
</script>
