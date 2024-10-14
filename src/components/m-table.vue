<template>
  <div class="m-table">
    <!-- 查询条件 start -->
    <i-form v-show="showQuery" v-if="inputData && inputData.length > 0" class="m-table-form" label-position="top" :model="formData">
      <template v-for="(item, index) in inputData">
        <i-form-item class="m-table-form-item" :label="item.label" :key="index">
          <!-- slot -->
          <slot v-if="item.slot" :name="item.slot" :form-data="formData"></slot>
          <!-- select -->
          <i-select v-else-if="item.type === 'select'" v-model="formData[item.key]" :placeholder="item.holder" clearable>
            <i-option
              v-for="citem in item.data"
              :key="citem.value"
              :label="citem.label"
              :value="citem.value">
            </i-option>
          </i-select>
          <!-- default text -->
          <i-input v-else v-model="formData[item.key]" :placeholder="item.holder"></i-input>
        </i-form-item>
      </template>
      <i-form-item class="m-table-form-item" label=" ">
        <i-button type="primary" @click="search" :loading="loading">查询</i-button>
        <i-button @click="reset" :loading="loading">重置</i-button>
      </i-form-item>
    </i-form>
    <!-- 查询条件 end -->
    
    <!-- 表格 start -->
    <i-table class="m-table-list" :columns="columns" :data="tableData" :loading="loading"></i-table>
    <!-- 表格 end -->
    
    <i-pagination 
      class="m-table-pagination"
      placement='top'
      :show-sizer="true"
      :disabled="loading"
      :page-size-opts="pageSizeOpts" 
      @on-change="currentChange" 
      @on-page-size-change="pageChange" 
      :total="total"/>
  </div>
</template>

<script>
  // import { clearEmpty } from '@/plugins/utils';
  const clearEmpty = function (object) {
    for (const key in object) {
      if (object.hasOwnProperty(key)) {
        const element = object[key];
        if (element === '' || element === null || element === undefined) {
          delete object[key];
        }
      }
    }
  }
  export default {
    name: 'MTable',
    props: {
      request: String,      // 接口对应的key
      autoInit: {           // 是否在初始化的时候获取数据
        type: Boolean,
        default: true
      },
      showQuery: {
        type: Boolean,
        default: false
      },
      params: {             // 默认请求参数
        type: Object,
        default () {
          return {}
        }
      },
      inputData: {          // 查询条件
        type: Array,
        default () {
          return []
        }
      },
      columns: {            // 表头
        type: Array,
        default () {
          return []
        }
      }
    },
    
    data () {
      return {
        loading: false, // 加载中
        formData: {},   // 查询参数
        
        pageSizeOpts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        pageData: {     // 分页参数
          page: 1,
          rows: 10
        },
        total: 0,       // 数据总数

        tableData: [],  // 列表数据
      }
    },
    mounted () {
      if (this.autoInit) this.search();
    },
    methods: {
      reset () {
        this.formData = {};
        this.$emit('reset-query', this.formData);
      },

      async search () {
        if (!this.request) throw new Error('props request is required!');
        this.loading = true;
        try {
          // 合并默认参数、查询参数、分页参数
          const formData = Object.assign({}, this.params, this.formData, this.pageData);
          // 清除空字符串，如果需要空字符串请在format-query中添加特定字段为空字符
          clearEmpty(formData);
          // 格式化请求参数，无需返回值，不能改变formData内存地址
          this.$emit('format-query', formData);
          const res = await this.$axios.get(this.request, formData);
          if (res.code === '0') {
            const data = res.data;
            // 格式化返回数据，无需返回值，不能改变data内存地址
            this.$emit('format-data', data);
            this.total = res.data.total;
            this.tableData = res.data.rows;
          } else {
            this.$message({ message: res.msg, type: 'warning' });
          }
          this.loading = false;
        } catch (error) {
          this.loading = false;
          throw new Error(error);
        }
      },

      pageChange (value) {
        this.pageData.rows = value;
        this.search();
      },

      currentChange (value) {
        this.pageData.page = value;
        this.search();
      }
    }
  }
</script>

<style lang="less">
  .m-table {
    &-form {
      display: flex;
      flex-wrap: wrap;
      background: white;
      padding: 20px;
      margin-bottom: 5px;
      // border-bottom: 1px solid #fafafa;
      .ivu-select {
        width: 100%;
      }
      &-item {
        box-sizing: border-box;
        width: 25%;
        padding-right: 20px;
      }
      &-item .ivu-form-item__label {
        min-height: 50px;
      }
    }

    &-list {
      padding: 20px;
      background: white;
      &::before {
        display: none;
      }
    }

    &-pagination {
      text-align: right;
      padding: 20px 20px;
      background: white;
    }
  }
</style>
