<template>
  <!-- 库存预警列表 -->
  <div>
    <div class="catetable-action pd-20  white-bg">
      <saas-search-input v-model="filterText" placeholder="输入配件编号/名称 进行搜索" @on-search="onTableSearch"></saas-search-input>
    </div>
    <!-- 筛选表单 -->
    <saas-query 
      ref="query"
      v-show="queryShow" 
      query-class="column-3"
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery">
    </saas-query>

    <div class="relative mt-20 white-bg">

      <!-- 表格数据 -->
      <saas-table
        ref="table"
        api="getRepairWarningList"
        :auto="true"
        :columns="columns"  
        :params="params"
        :close-loading="true"
        @on-success="onTableSuccess"
        @on-loading-change="onLoadingChange">
      </saas-table>
      <Spin size="large" fix v-if="loading"></Spin>
    </div>
  </div>
</template>

<script>
import partInputs from "@/commons/inputs/part-input";                // 筛选列 -> 配件
import warehosueInputs from "@/commons/inputs/warehouse-input";      // 筛选列 -> 仓库

import commonColumns from "@/commons/columns/common-column";         // 表格的列 -> 公共 
import partColumns from "@/commons/columns/part-column";             // 表格的列 -> 配件
import warehouseColumns from "@/commons/columns/warehouse-column";   // 表格的列 -> 仓库

export default {
  props: {
    queryShow: {  // 是否显示筛选表单
      type: Boolean,
      default: false
    },
    isSelfStore: {  
      type: Boolean,
      default: false
    },

  },
  data () {
    return {
      loading: false,
      filterText: "",                                             // 筛选文字内容
      params: {},                                                 // 筛选参数
      warehouseId: "",                                            // 选中的仓库id
      warehouseList: [],                                          // 仓库列表
      partCateList: [],                                           // 分类列表
      queryData: [],                                              // 筛选表单列表
      columns: [
        commonColumns.index({fixed: "left"}),                     // 序号
        partColumns.partName(),                                   // 配件名称
        partColumns.partNo(),                                     // 配件编码
        partColumns.partCate(),                                   // 配件分类
        warehouseColumns.warehouseName(),                         // 仓库名字
        warehouseColumns.quantity({ title: "当前库存" }),          // 配件库存
        warehouseColumns.upperLimit(),                            // 库存上限
        warehouseColumns.lowerLimit(),                            // 库存下限
        warehouseColumns.warningStatus(),                         // 预警状态
        {
          title: '操作',
          width: 80,
          fixed: "right",
          render: (h, { row }) => {
            if(this.isSelfStore){
              return h("i-button", {
                props: {
                  type: "text",
                  to: "/inventory/maintain/add?partNo=" + row.partNo
                }
              }, "修改设置");
            }
          }
        }
      ]
    }
  },

  created () {
    this.init();
  },

  methods: {
    // 初始化
    async init () {
      await this.getWarehouseList();
      await this.getPartCateList();
      this.setQueryList();
    },
    
    // 设置筛选数据
    setQueryList () {
      this.queryData = [
        warehosueInputs.warehouseSelect({ data: this.warehouseList, value: this.warehouseId }),      // 仓库列表
        warehosueInputs.warehouseWarning(),                                                          // 库存预警状态
        partInputs.partCate( { data: this.partCateList, value: "" }),                                // 配件分类
        warehosueInputs.upperLimit(),                                                                // 库存上限
        warehosueInputs.lowerLimit(),                                                                // 库存下限
      ]
    },
    // 获取仓库列表
    async getWarehouseList () {
      let data = await this.$ajax.getWarehouseList.call(this);
      this.warehouseId = data.defaultWarehouse.warehouseId;
      this.warehouseList = data.rows.map(elm => {
        return {
          label: elm.warehouseName,
          value: elm.warehouseId
        }
      });
    },

    // 获取配件分类列表
    async getPartCateList () {
      let data = await this.$ajax.getRepairCateList.call(this, { includeOther: 1 }); // 配件分类
      this.partCateList = data.map(elm => {
        return {
          label: elm.name,
          value: elm.code
        }
      });
    },

    // 表格数据获取成功 groupData数据是固定的，所以分类数据设置一次就可以
    async onTableSuccess (data) {
      // 更新父组件的tab数量
      // this.$emit("on-head-change", data.total, "warningCount");
    },

    onTableSearch ( otherParams ) {
      this.params = Object.assign({},this.params,otherParams)
      let params = this.params;
      params.summaryName = this.filterText;
      this.$refs.table.reset();
    },

    // 返回table中loading的状态
    onLoadingChange (loading) {
      this.loading = loading;
    },

    /**
     * 查询数据
     * @params {object} params 返回筛选对象
     */
    onQuery (params) {
      this.params = params;
      this.onTableSearch();
    },
  }
}
</script>
