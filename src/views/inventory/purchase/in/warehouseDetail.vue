<template>
  <!-- 采购单详情-->
  <div class="refund-add warehouseRefund">
    <saas-bread title="调拨入库详情">
      <template slot="actions">
        <i-button type="default" @click="goBack">返回</i-button>
      </template>
    </saas-bread>
    <div class="box-shadow" >
      <div class="refundFormBox">
        <div class="refund-form">
          <div class="form-item">
            <span class="item-key">单号</span>
            <span class="item-value">{{detail.stockInNo || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">调拨人</span>
            <span class="item-value">{{detail.createdBy || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">开单日期</span>
            <span class="item-value">{{detail.created || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">备注</span>
            <span class="item-value">{{detail.remark || '--'}}</span>
          </div>
        </div>
        <div class="refund-form">
          <div class="form-item">
            <span class="item-key">入库类型</span>
            <span class="item-value">{{detail.stockInType ? storageType.find(item=>item.value === detail.stockInType).label : '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">出库单号</span>
            <span class="item-value">{{detail.stockOutNo || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">调拨门店</span>
            <span class="item-value">{{detail.callOutStoreName || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">调拨申请单号</span>
            <span class="item-value">{{detail.allotApplyNo || '--'}}</span>
          </div>
        </div>
      </div>
      <div class="title">已选配件</div>
      <w-table
        ref="table"
        :columns="columns"
        :is-pagination="false"
        :tableData="tableData">
      </w-table>
      <!-- <div class="no-data">暂无配件信息</div> -->
    </div>
    <bottom-submit>
      <div class="slot-left">
        <p class="price">采购金额：<span>￥{{detail.totalCost | toFixed}}</span></p>
        <p>
          <span>{{tableData.length}}种共计{{getCount}}件</span>
        </p>
      </div>
      <i-button v-if="detail.settleStatus === '1'" type="error" :loading="loading" @click="toSettle">付款</i-button>
    </bottom-submit>
    <!-- <remind-dialog 
      ref="remindDialog"
      title="确定付款吗？"
      content=""
      @on-ok="submit">
    </remind-dialog> -->
  </div>
</template>

<script>
  import '@/styles/views/inventory/refund-add.less';
  // import RemindDialog from '@/components/dialog/remind-dialog';

  import { formatTime, multiply } from '@/assets/js/utils.js';
  import { unit, getLabel, storageType } from '@/store/json/default';
  export default {
    data () {
      return {
        loading: false,
        id: '',
        detail: {},
        tableData: [],
        columns: [
          { title: '序号', type: 'index', width: 80 },
          { title: '配件编号', key: 'partNo' },
          { title: '原厂编码', key: 'partFactoryNo',
            render: (h, { row }) => {
              return h('span', row.partFactoryNo || '--');
            }          
          },
          { title: '名称', key: 'partName' },
          { title: '品牌', key: 'brand',
            render: (h, { row }) => {
              return h('span', row.brand || '--');
            }    
          },
          { 
            title: '单位', 
            key: 'unit',
            render: (h, { row }) => {
              return h("my-unit", {
                props: {
                  unit: row.unit
                }
              });
            }
          },
          { 
            title: '分类', 
            key: 'cateStr',
            render: (h, { row }) => {
              const arr = row.cateStr.split('/');
              return h('span', arr[arr.length - 1]);
            }
          },
          { title: '仓库', key: 'warehouseName',
            render: (h, { row }) => {
              return h('span', row.warehouseName || '--');
            }    
          },
          { title: '货位', key: 'shelfName',
            render: (h, { row }) => {
              return h('span', row.shelfName || '--');
            }    
          },
          { title: '入库数量', key: 'incQuantity' },
          { title: '采购单价', key: 'purchasePrice' },
          { title: '入库金额', key: 'totalCost',
            render: (h, { row }) => {
              return h('span', Number(row.incQuantity)*Number(row.purchasePrice));
            }     
          },
          { title: '零售价', key: 'retailPrice' }
        ],
        storageType,
        shareStoreId:''
      }
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.id = this.$route.params.id;
        this.shareStoreId = this.$route.query.shareStoreId || ''
        this.getTableData();
      },
      async getTableData () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'getPartStockin',
            params: {
              stockInNo: this.id,
              shareStoreId: this.shareStoreId
            }
          });

          if (res.code === '0') {
            this.detail = res.data;
            this.tableData = this.detail.items;
          }

          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      goBack () {
        this.$router.go(-1);
      }
    },
    computed: {
      getCount () {
        let count = 0;
        this.tableData.forEach(item => {
          count += Number(item.incQuantity);
        });
        return count;
      }
    },
    filters: {
      toFixed (v) {
        return v ? Number(v).toFixed(2) : 0;
      }
    }
  }
  </script>
