<template>
  <!-- 平台项目 -->
  <div class="market-platform relative mt-20 pt-20 white-bg">
    <div class="space-between pl-20 pr-20">
      <saas-search-input v-model="params.contact" placeholder="输入客户名称/联系方式 搜索" @on-search="onSearch"></saas-search-input>
      <saas-toggle-btn v-model="queryShow" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </div>

    <!-- 筛选表单 -->
    <saas-query 
      v-show="queryShow" 
      ref="query"
      class="intable"
      query-class="column-3"
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery">
    </saas-query>

    <!-- 表格数据 -->
    <saas-table
      ref="table"
      api="getPlatformProjectOrders"
      :auto="true"
      :columns="columns"  
      :params="params"
      :close-loading="true"
      @on-success="onTableSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
    <Spin size="large" fix v-if="loading"></Spin>
    <eval-dialog ref="evalDialog" @on-success="onSearch"></eval-dialog>
  </div>
</template>
<script>
  import { commonRender } from "@/commons/columns/common-render";
  import mixins from "./minix";

  import EvalDialog from "@/components/dialog/returneval-dialog";

  export default {
    components: { EvalDialog },
    mixins: [mixins],
    data () {
      let permiss = this.$permission.data.marketPlatformOrder;
      let columns = [
        { 
          title: "订单编号", 
          key: "orderId", 
          minWidth: 180,
          render: commonRender
        },
        {
          title: "项目名称",
          key: "activityName",
          minWidth: 240,
          render: commonRender
        },
        // {
        //   title: "客户名称",
        //   key: "contact",
        //   minWidth: 100,
        //   render: commonRender
        // },
        {
          title: "联系方式",
          key: "mobile",
          minWidth: 120,
          render: commonRender
        },
        {
          title: "价格",
          key: "totalCost",
          minWidth: 120,
          sortable: "custom",
          render: commonRender
        },
        {
          title: "下单时间",
          key: "payTime",
          minWidth: 180,
          sortable: "custom",
          render: commonRender
        }  
      ];
      
      if (permiss.check || permiss.reply) {
        columns.push({
          title: "操作",
          width: 180,
          fixed: "right",
          render: (h, { row }) => {
            let elms = [];
            let replyEvaluate = row.replyEvaluate;
            // 是否显示回复评价按钮
            if (permiss.reply) {
              if (replyEvaluate == "1" ) {
                elms.push(
                  h("i-button", {
                    props: { type: "primary" },
                    style: {
                      marginRight: "10px",
                      padding: "0",
                      width: "76px",
                      lineHeight: "32px"
                    },
                    on: {
                      click: () => {
                        this.$refs.evalDialog.open(row);
                      }
                    }
                  }, "回复评价"),
                );
              } else if (!permiss.check) {
                elms.push(
                  h("span", {
                    style: {
                      marginRight: "10px",
                    }
                  }, "--")
                );
              }
            }
            
            if (permiss.check) {
              elms.push(
                h("i-button", {
                  props: { type: "text" },
                  on: {
                    click: () => {
                      this.$router.push("/market/platform/orderdetail?id=" + row._id);
                    }
                  }
                }, "查看详情"),
              );
            }
            return elms;
          }
        });
      }
      return {
        queryShow: false,
        qrUrl: "",
        params: {},
        queryData: [
          { 
            type: "text",
            key: "orderId", 
            label: "订单编号",
            holder: "请输入订单编号"
          }, 
          { 
            type: "text",
            key: "activityName", 
            label: "项目名称",
            holder: "请输入项目名称"
          },    
          { 
            type: "multipleInput",
            label: "价格", 
            reg: "NUMBER",
            start: { key: "startPrice" },
            end: { key: "endPrice" },
            append: "元"
          },
          { 
            type: "multipleDate",
            label: "下单时间", 
            max: new Date(),
            start: { key: "startPayTime", holder: "开始时间" },
            end: { key: "endPayTime", holder: "结束时间" },
          },
        ],
        columns,
      }
    },

    methods: {
      onSearch () {
        this.$refs.query.query();
      },
      /**
       * 查询数据
       * @params {object} params 返回筛选对象
       */
      onQuery (params) {
        let contact = this.params.contact;
        if (contact) params.contact = contact;
        this.params = params;
        this.onTableSearch();
      },
    }
  }
</script>
