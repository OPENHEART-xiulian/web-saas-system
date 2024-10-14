<template>
  <!-- 带筛选的表格 -->
  <div class="saas-query-table">
    <saas-query 
      ref="query" 
      v-show="queryShow" 
      :query-class="queryClass" 
      :loading="loading" 
      :auto="auto" 
      :data="queryData" 
      @on-query="query">
    </saas-query>
    <slot></slot>
    <saas-table 
      ref="table" 
      :api="api" 
      :default-params="defaultParams" 
      :params="params" 
      :auto="false" 
      :columns="columns" 
      @on-success="onSuccess"
      @on-loading-change="onLoadingChange">
    </saas-table>
  </div>
</template>

<script>
export default {
  name: "SaasQueryTable",
  props: {
    // 接口名称
    api: {
      type: String,
      required: true
    },
    // 是否显示筛选内容
    queryShow: {
      type: Boolean,
      default: false
    },
    // 筛选参数
    queryData: {
      type: Array,
      required: true
    },
    // 表格的列，根据iview文档来
    columns: {
      type: Array,
      required: true
    },

    // 是否显示筛选内容
    auto: {
      type: Boolean,
      default: true
    },

    queryClass: {         // 自定义类名 column-3
      type: String,
      default: ""
    },

    defaultParams: {
      type: Object,
      default () {
        return {}
      }
    }
  },

  data () {
    return {
      loading: false,
      params: {},
    }
  },

  methods: {
    // 初始化操作 当auto为false的时候，调用query组件的query来返回默认参数
    init () {
      this.$refs.query.query();
    },
    
    // 点击query的确定按钮
    query (params) {
      this.params = params;
      this.$refs.table.reset();
    },


    onSuccess (data) {
      this.$emit("on-success", data);
    },

    // loading
    onLoadingChange (loading) {
      this.loading = loading;
    }
  }
}
</script>
