<template>
  <!-- 配件库存列表 -->
  <div>
    <div class="cateQuery mt-20">
      <!-- 仓库筛选 -->
      <div class="catetable-action">
        <i-select v-model="warehouseId" @on-change="onTableSearch">
          <i-option v-for="(item, index) in warehouseList" :key="index" :value="item.warehouseId">{{ item.warehouseName }}</i-option>
        </i-select>
      </div>
      <saas-toggle-btn v-model="queryShow" type="default" :titles="['收起筛选', '展开筛选']"></saas-toggle-btn>
    </div>
    <!-- 筛选表单 -->
    <saas-query 
      ref="query"
      v-show="queryShow" 
      :loading="loading"
      :data="queryData"
      :auto="false"
      @on-query="onQuery">
    </saas-query>
    <div class="catetable-wrap">
      <!-- 分类列表 -->
      <div class="catetable-left">
        <div class="catetable-left__title">配件类别</div>
        <Tree class="catetable-left__list" :data="cateList" @on-select-change="onCategoryChange" ></Tree>
        <Spin size="large" fix v-if="loading && !isSetCateValue"></Spin>
      </div>

      <div class="catetable-right">
        <!-- 表格数据 -->
        <saas-table
          ref="table"
          api="getInventoryStockList"
          :auto="false"
          :columns="columns"  
          :params="params"
          @on-success="onTableSuccess"
          @on-loading-change="onLoadingChange">
        </saas-table>
        <Spin size="large" fix v-if="loading"></Spin>
      </div>
    </div>
  </div>
</template>

<script>
import partInputs from "@/commons/inputs/part-input";                       // 筛选列 -> 配件

import commonColumns from "@/commons/columns/common-column";                // 表格的列 -> 公共 
import partColumns from "@/commons/columns/part-column";                    // 表格的列 -> 配件
import warehouseColumns from "@/commons/columns/warehouse-column";          // 表格的列 -> 仓库
import supplierColumns from "@/commons/columns/supplier-column";            // 表格的列 -> 供应商

import { formatCategoryData } from "@/commons";                             // 公共方法

export default {
  data () {
    return {
      loading: false,
      params: {},      
      queryShow: false,                                           // 筛选参数
      queryData: [         
        partInputs.partFactoryNo(),                               // 原厂编码
        partInputs.partName(),                                    // 配件名称
        partInputs.partBrand(),                                   // 配件品牌
        { 
          type: "text", 
          key: "supplierName", 
          label: "供应商", 
          holder: "输入关键字可快速匹配供应商"
        },                                     // 筛选表单列表
      ],
      warehouseId: "",                                            // 选中的仓库id
      warehouseList: [],                                          // 仓库列表
      isSetCateValue: false,                                      // 是否设置过分类的数量，设置过不需要重新设置
      categoryCode: "",                                           // 分类code
      cateList: [],                                               // 分类列表
      columns: [
        commonColumns.index(),                     // 序号
        partColumns.partNo(),                                     // 配件编码
        partColumns.partImg(),                                    // 配件图片
        partColumns.partFactoryNo(),                              // 原厂编码
        partColumns.partName({fixed: "left"}),                    // 配件名称
        partColumns.partBrand(),                                  // 配件品牌
        partColumns.partCate(),                                   // 配件分类
        partColumns.partUnit(),                                   // 配件单位
        supplierColumns.supplierName(),                           // 供应商名字
        warehouseColumns.warehouseName(),                         // 仓库名字
        warehouseColumns.shelfName(),                             // 货位名称
        warehouseColumns.quantity({ sortable: "custom" }),        // 配件库存
        partColumns.purchasePrice({ sortable: "custom" }),        // 采购均价
        partColumns.retailPrice({ sortable: "custom" }),          // 零售价
        partColumns.saleQuantity({ sortable: "custom" }),         // 销售量
      ],
      shareStoreParams:{}
    }
  },

  created () {
    this.getWarehouseList();
  },

  methods: {
    initByShareStoreId(params,isRefresh){
      this.shareStoreParams = params
      this.getWarehouseList(this.shareStoreParams,isRefresh)
    },
    // 获取仓库列表
    async getWarehouseList (params,isRefresh) {
      this.loading = true;
      let data = await this.$ajax.getWarehouseList.call(this, params,isRefresh );
      data = JSON.parse(JSON.stringify(data));
      data.rows.unshift({
        warehouseId: "select-all-option",
        warehouseName: "全部"
      });
      this.warehouseList = data.rows;
      this.warehouseId = "select-all-option";
      this.onTableSearch();
    },

    // 表格数据获取成功 groupData数据是固定的，所以分类数据设置一次就可以
    async onTableSuccess (data) {
      console.log('onTableSuccess')
      // 更新父组件的tab数量
      // this.$emit("on-head-change", data.total, "warningCount");
      if (this.isSetCateValue) return;
      this.isSetCateValue = true;
      let params = Object.assign({},{ includeOther: 1 },this.shareStoreParams);
      let cateList = await this.$ajax.getRepairCateList.call(this,params,true);  // 获取分类列表
      console.log(data.groupData)
      console.log(cateList)
      // this.cateList = []
      this.cateList = formatCategoryData(cateList, data.groupData, "全部配件"); // 格式化分类数据
    },
    

    // 返回table中loading的状态
    onLoadingChange (loading) {
      this.loading = loading;
    },

    // 设置参数筛选数据
    onTableSearch ( otherParams ) {
      this.params = Object.assign({},this.params,otherParams)
      let params = this.params;
      params.code = this.categoryCode;
      params.warehouseId = this.warehouseId;
      this.$refs.table.reset();
    },

    /**
     * 查询数据
     * @params {object} params 返回筛选对象
     */
    onQuery (params) {
      this.params = params;
      this.onTableSearch();
    },

    /**
     * 分类选择
     * @param { array } nodes 列表选中的时候返回的子节点数据列表
     */
    onCategoryChange (nodes) {
      if (nodes.length) {
        this.categoryCode = nodes[0].code;
      } else {
        this.cateList[0].selected = true;
        this.categoryCode = "";
      }
      this.onTableSearch();
    }
  }
}
</script>
