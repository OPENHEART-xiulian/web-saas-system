<template>
  <!-- 挂账列表 -->
  <div class="receivable-detail">
    <saas-bread title="挂账列表">
      <template slot="actions">
        <i-button type="default" @click="$router.go(-1)">返回</i-button>
      </template>
    </saas-bread>
    <div class="detail-wrapper">
      <div class="header">
        <span class="label">姓名：</span>
        <span class="value">{{customerData.customerName || "匿名用户"}}</span>
        <span class="label">联系电话：</span>
        <span class="value">{{customerData.mobile || "无联系方式"}}</span>
        <span class="label">挂账单数：</span>
        <span class="value">{{customerData.count}}</span>
        <span class="label">挂账金额：</span>
        <span class="value money">￥{{customerData.leftReceivable | toFixed}}</span>
      </div>
      <div class="search-wrap">
        <i-input class="search-input" v-model="formData.filter" placeholder="输入工单号 / 车牌号搜索">
          <span class="prepend" slot="prepend"><i class="iconfont icon-sousuo"></i></span>
          <span class="append" slot="append" @click="getData">搜索</span>
        </i-input>
      </div>
      <i-table 
        class="w-table" 
        :columns="columns" 
        :data="tableData"
        @on-selection-change="onSelectionChange">
      </i-table>
      
      <div style="display: flex; flex-grow: 1; justify-content: flex-end; padding-top: 20px;">
        <saas-page
          ref="page"
          v-show="total > params.rows"
          :sizer="true"
          :page="params.page"
          :rows="params.rows"
          :total="total"
          @on-change="pageChange">
        </saas-page>
      </div>
      <Spin fix v-if="loading"></Spin>
    </div>
    <!-- <w-table
      ref="table"
      request="onCreditByCustomer"
      :columns="columns"
      :tableData="$store.getters.tableData"
      :formData="formData"
      :params="params">
    </w-table> -->
    <bottom-submit class="bottom-submit">
      <div class="slot-left">
        <p class="price">收款金额: <span>￥{{selectCost | toFixed}}</span></p>
        <p>
          <span>已选单数: {{selectCount}}</span>
        </p>
      </div>
      <i-button type="error"
        :disabled="!selectCount || !hasReceipt"
        :loading="loading"
        @click="submit">收款</i-button>
    </bottom-submit>
  </div>
</template>

<script>
  import "@/styles/components/table.less";
  import { getLabel, workType } from "@/store/json/default";
  export default {
    data () {
      let { workerList, workerCleanout, workerSparepart, workerSalereturn } = this.$permission.data;
      let columns = [
        {
          type: 'selection',
          width: 60,
          align: 'center'
        },
        { 
          title: '车牌号', 
          key: 'plateNo',
          render: (h, { row }) => {
            return h('div', row.plateNo ? row.plateNo : "暂无车牌号");
          }  
        },
        { 
          title: '工单号', 
          key: 'statementNo' 
        },
        {
          title: "工单类型",
          key: "orderType",
          render: (h, { row }) => {
            return h("span", getLabel(row.orderType, workType));
          }
        },
        { 
          title: '挂账金额', 
          key: 'leftReceivable',
          render: (h, { row }) => {
            return h('div', parseFloat(row.leftReceivable).toFixed(2));
          } 
        },
        { title: '挂账时间', key: 'creditDate' },
        { 
          title: '操作',
          width: 150,
          render: (h, { row }) => {
            let check = ((row.orderType == 1 && workerList.check) || 
              (row.orderType == 3 && workerCleanout.check) || 
              (row.orderType == 2 && workerSparepart.check) || 
              (row.orderType == 4 && workerSalereturn.check));
            return check ? h('div', [
              h('Button', {
                props: {
                  type: 'text'
                },
                on: {
                  click: () => {
                    let type = this.getTypeString(row.orderType);
                    this.$router.push({ path: '/workorder/' + type + '/detail/' + row.statementNo });
                  }
                }
              }, '查看工单')
            ]) : h("div", "--");
          }
        }
      ];
      return {
        workerList, 
        workerCleanout, 
        workerSparepart,
        workerSalereturn,
        hasReceipt: false,
        loading: false,
        params: {
          rows: 10,
          page: 1
        },
        formData: {
          filter: ""
        },
        customerData: {
          leftReceivable: 0,
        },
        tableData: [],
        total: 0,
        selectCost: 0,
        selectCount: 0,
        selectionIds: [],
        selection: [],
        columns,
      }
    },
    
    created () {
      let id = this.$route.params.id;
      if (id === "anonymous") this.params.anonymous = true;
      else this.params.customerId = id;
      this.getData();
    },

    methods: {
      async getData () {
        this.loading = true;
        try {
          let res = await this.$store.dispatch({
            type: "actionGet",
            name: "onCreditByCustomer",
            params: Object.assign({}, this.params, this.formData)
          });

          this.loading = false;
          if (res.code === '0') {
            this.tableData = res.data.rows;
            this.total = res.data.total;
            this.customerData = res.data.customer;
          }
        } catch (err) {
          this.loading = false;
          console.log(err);
        }
      },

      submit () {
        if (this.selectionIds.length === 0) return;
        if (this.selectionIds.length === 1) {
          let data = this.selection[0];
          let type = this.getTypeString(data.orderType);
          this.$router.push({ path: '/workorder/' + type + '/balance/' + data.statementNo });
        } else {
          this.$router.push({
            path: "/cash/receivable/settle",
            query: {
              customerId: this.params.customerId,
              ids: this.selectionIds.join(",")
            }
          });
        }
      },

      onSelectionChange (selection) {
        let price = 0;
        this.selectionIds = selection.map(elm => {
          price += Number(elm.leftReceivable);
          return elm.statementNo;
        });
        this.selection = selection;
        this.selectCost = price;
        this.selectCount = selection.length;
        // 如果只勾了一条数据，判断是否有收款权限，根据工单的收款来判断
        if (this.selectCount === 1) {
          let row = selection[0];
          this.hasReceipt = ((row.orderType == 1 && this.workerList.settle) || 
            (row.orderType == 3 && this.workerCleanout.settle) || 
            (row.orderType == 2 && this.workerSparepart.settle) || 
            (row.orderType == 4 && this.workerSalereturn.settle));
        } else {
          this.hasReceipt = true;
        }
      },

      pageChange (v) {
        this.params.page = v.page;
        this.params.rows = v.rows;
        this.getData();
      },

      getTypeString (type) {
        let str = "";
        switch (type) {
          case '1':
            str = 'worker';
            break;
          case '2': 
            str = 'sparepart';
            break;
          case '3':
            str = 'cleanout';
            break;
          default:
            break;
        }
        return str;
      },
    },

    filters: {
      toFixed (v) {
        return Number(v).toFixed(2);
      }
    }
  }
</script>

<style lang="less">
  .receivable-detail {
    .detail-wrapper {
      position: relative;
      background: white;
      padding: 20px;
    }

    .header {
      display: flex;
      align-items: center;
      border-bottom: 1px solid #f2f2f2;
      padding-bottom: 16px;
      span {
        color: #332E29;
        font-size: 14px;
      }
      .label {
        margin-right: 2px;
      }
      .value {
        margin-right: 20px;
      }
      .value.money {
        color: #ff8000;
      }
    }

    .search-wrap {
      padding: 20px 0;
    }

    .search-input {
      position: relative;
      width: 400px;
    }

    .search-input .ivu-input {
      padding: 0 90px 0 40px;
    }

    .search-input .ivu-input-group-append, 
    .search-input .ivu-input-group-prepend {
      position: absolute;
      right: 0;
      top: 0;
      width: 80px;
      height: 100%;
      background: #ff8800;
      z-index: 3;
      border: none!important;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      border-radius: 0;
      padding: 0;
    }
    .search-input .ivu-input-group-append {
      right: 0;
      cursor: pointer;
      span {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
      }
    }
    .search-input .ivu-input-group-prepend {
      left: 0;
      background: none;
      width: 40px;
      color: #332E29;
    }

    .w-table {
      padding: 0;
      border: none;
      box-shadow: none;
    }

    .pagination {
      display: flex!important;
    }

    .bottom-submit .slot {
      padding: 20px 0;
      line-height: 20px;
      display: flex;
      align-items: center;
      .slot-left {
        flex-grow: 1;
        margin-right: 20px;
      }

      .price {
        color: #332E29;
        span {
          font-size: 20px;
          color: #f22d00;
        }
      }
    }
  }
</style>
