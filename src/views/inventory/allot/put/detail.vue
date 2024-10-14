<template>
  <!-- 采购单详情-->
  <div class="refund-add">
    <saas-bread title="调拨申请查看">
      <template slot="actions">
        <i-button type="default" @click="goBack">返回</i-button>
      </template>
    </saas-bread>
    <div class="box-shadow">
      <div class="flex">
        <div class="refund-form" style="flex:1">
          <div class="form-item">
            <span class="item-key">单号</span>
            <span class="item-value">{{detail.allotCode || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">申请人</span>
            <span class="item-value">{{detail.operatorId.username || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">调出门店</span>
            <span class="item-value">{{detail.calloutStoreId.storeName || '--'}}</span>
          </div>
        </div>
        <div class="refund-form"  style="flex:1">
          <div class="form-item">
            <span class="item-key">费用承担方</span>
            <span class="item-value">{{detail.assumeStatusName || '--'}}</span>
          </div>
          <div class="form-item">
            <span class="item-key">调拨费用</span>
            <span class="item-value">{{detail.calloutTotalCost }}</span>
          </div>
          <div class="form-item">
            <span class="item-key">备注</span>
            <span class="item-value">{{detail.remark || '--'}}</span>
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
      <div class="remark">
        <div class="right">
          <p>调拨申请: <span>{{allComponentsNum}}件</span></p>
          <p class="small">{{detail.components.length}}种配件</p>
        </div>
      </div>
      <!-- <div class="no-data">暂无配件信息</div> -->
    </div>
    <!-- <bottom-submit>
      <div class="slot-left">
        <p class="price">采购金额：<span>￥{{detail.totalCost | toFixed}}</span></p>
        <p>
          <span>{{tableData.length}}种共计{{getCount}}件</span>
        </p>
      </div>
      <i-button v-if="detail.settleStatus === '1'" type="error" :loading="loading" @click="toSettle">付款</i-button>
    </bottom-submit> -->
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
  import { unit, getLabel } from '@/store/json/default';
  export default {
    data () {
      return {
        loading: false,
        id: '',
        detail: {
          operatorId:{},
          calloutStoreId:{},
          components:[]
        },
        tableData: [],
        columns: [
          { title: '序号', type: 'index', width: 80 },
          { title: '配件名称', key: 'partName' },
          { title: '配件编号', key: 'partNo' },
          { title: '原厂编码', key: 'partFactoryNo' },
          { title: '品牌', key: 'brand' },
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
          { title: '单价', key: 'purchasePrice' },
          { title: '数量', key: 'quantity' }
        ],
        allComponentsNum:0
      }
    },
    mounted () {
      this.init();
    },
    methods: {
      init () {
        this.id = this.$route.params.id;
        this.getTableData();
      },
      async getTableData () {
        try {
          const res = await this.$store.dispatch({
            type: 'actionGet',
            name: 'getComponentAllotApply',
            params: {
              id: this.id
            }
          });

          if (res.code === '0') {
            this.detail = res.data;
            this.tableData = this.detail.components;
            let all = 0
            this.allComponentsNum = this.detail.components.reduce((prev, cur)=>{     
              let preVal = prev.quantity || 0
              let curVal = cur.quantity || 0
              all+=preVal+curVal
              return all
            },{quantity:0})
          }

          this.loading = false;
        } catch (error) {
          this.loading = false;
        }
      },
      toSettle () {
        this.$router.push('/inventory/purchase/put/pay/' + this.id);
      },
      goBack () {
        this.$router.go(-1);
      }
    },
    computed: {
      getCount () {
        let count = 0;
        this.tableData.forEach(item => {
          count += Number(item.quantity);
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
