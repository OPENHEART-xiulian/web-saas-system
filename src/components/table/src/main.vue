<template>
  <!-- 带分页的表格 -->
  <div class="saas-table">
    <!-- 表格 start -->
    <i-table 
      ref="table"
      class="saas-table__content" 
      :columns="columns" 
      :data="tableData"
      @on-select="onSelect"
      @on-select-cancel="onSelectCancel"
      @on-select-all="onSelectAll"
      @on-select-all-cancel="onSelectAllCancel"
      @on-selection-change="onSelectionChange"
      @on-sort-change="onSortChange">
      <template slot-scope="{ row, index }" slot="action">
        <slot 
          name="action"
          :row="row" 
          :index="index">
        </slot>
      </template>
    </i-table>
    <!-- 表格 end -->
    
    <!-- 分页 start -->
    <div class="saas-table__pagination">
      <div class="saas-table__checkall">
        <template v-if="canDelete">
          <Checkbox v-model="deleteSelect" :disabled="disabledDelete" @on-change="onSelectDeleteChange"></Checkbox>
          <!-- 没选中的时候禁用删除 -->
          <i-button type="default" :disabled="disabledDelete || selection.length == 0" @click="onMultipleDelete">批量删除</i-button>
        </template>
      </div>
      <saas-page
        :total="total"
        :sizer="true"
        :page="pageData.page"
        :rows="pageData.rows"
        @on-change="pageChange"/>
    </div>
    <!-- 分页 end -->
    <Spin size="large" fix v-if="loading && !closeLoading"></Spin>
  </div>
</template>

<script>
  import SaasPage from "@/components/pagination/index.js";
  export default {
    name: "SaasTable",
    components: { SaasPage },
    props: {
      api: {                // 接口对应的api
        type: String,
        required: true
      },      
      auto: {               // 是否在初始化的时候获取数据
        type: Boolean,
        default: true
      },
      defaultParams: {      // 固定不变的查询参数
        type: Object,
        default () {
          return {};
        }
      },
      params: {              // 查询参数
        type: Object,
        default () {
          return {};
        }
      },
      columns: {            // 表头
        type: Array,
        default () {
          return []
        }
      },
      closeLoading: {       // 关闭table的loading
        type: Boolean,
        default: false
      },
      canDelete: {          // 是否可以批量删除
        type: Boolean,
        default: false,
      }
    },
    
    data () {
      return {
        loading: false,         // 加载中
        deleteSelect: false,    // 是否选中删除全部
        disabledCount: 0,       // 禁用的条数
        disabledDelete: false,  // 是否禁用批量删除
        pageSizeOpts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
        pageData: {             // 分页参数
          page: 1,
          rows: 10
        },
        orderData: {},          // 排序数据
        total: 0,               // 数据总数
        tableData: [],          // 列表数据
        selection: [],          // 选中的数据
      }
    },

    mounted () {
      if (this.auto) this.search();
    },

    methods: {
      // 筛选
      search () {
        this.init();
        this.loading = true;
        this.$emit("on-loading-change", this.loading);
        this.$nextTick(async () => {
          // 合并默认参数、查询参数、分页参数
          const formData = Object.assign({}, this.defaultParams, this.params, this.pageData, this.orderData);
          
          // 格式化请求参数，无需返回值，不能改变formData内存地址
          this.$emit("on-before", formData);
          let data = {};
          try {
            data = await this.$ajax[this.api](formData);
            // 格式化返回数据，无需返回值，不能改变data内存地址
            this.$emit("on-success", data);
            this.total = data.total;
            // 禁用选择的数量 想要获取此值，需要在api回调的时候处理或者on-success回调处理出来
            this.disabledCount = data.disabledCount; 
            // 当禁用的数量等于当页总数量，禁用批量删除
            this.disabledDelete = data.disabledCount == data.rows.length;
            this.tableData = data.rows;
          } catch (error) {
            this.$emit("on-error", error);
            console.log(error)
            throw new Error(error);
          }
          this.$emit("on-after", data);
          this.loading = false;
          this.$emit("on-loading-change", this.loading);
        });
      },

      init () {
        this.selection = [];
        this.disabledCount = 0;
        this.disabledDelete = false;
        this.deleteSelect = false;
        this.$refs.table.selectAll(false);
      },
      
      // 重置
      reset () {
        this.pageData = {
          page: 1,
          rows: 10
        }
        this.search();
      },

      // 分页切换
      pageChange (params) {
        this.pageData = params;
        this.search();
      },

      /**
       * 排序
       * @param {object} column: 对应的列
       * @param {string} key: 对应的key
       * @param {string} order: 排序顺序 值为 asc 或 desc
       */
      onSortChange ({ column, key, order }) {
        switch (order) {
          case "asc":
            this.orderData.sortOrder = "1"
            this.orderData.orderBy = key
            break
          case "desc":
            this.orderData.sortOrder = "-1"
            this.orderData.orderBy = key
            break
          default:
            this.orderData.sortOrder = undefined
            this.orderData.orderBy = undefined
            break
        }
        this.search();
      },

      /**
       * 在多选模式下有效，选中某一项时触发
       * @param { arryy } selection 已选项数据
       * @param { object } row 取消选择的项数据
       */
      onSelect (selection, row) {
        this.$emit("on-select", selection, row);
      },

      /**
       * 在多选模式下有效，取消选中某一项时触发
       * @param { arryy } selection 已选项数据
       * @param { object } row 取消选择的项数据
       */
      onSelectCancel (selection, row) {
        this.$emit("on-select-cancel", selection, row);
      },

      /**
       * 在多选模式下有效，点击全选时触发
       * @param { arryy } selection 已选项数据
       */
      onSelectAll (selection) {
        this.$emit("on-select-all", selection);
      },

      /**
       * 在多选模式下有效，点击取消全选时触发
       * @param { arryy } selection 已选项数据
       */
      onSelectAllCancel (selection) {
        this.$emit("on-select-all-cancel", selection);
      },

      /**
       * 在多选模式下有效，只要选中项发生变化时就会触发
       * @param { arryy } selection 已选项数据
       */
      onSelectionChange (selection) {
        this.selection = selection;
        this.deleteSelect = selection.length == this.pageData.rows - this.disabledCount;
        this.$emit("on-selection-change", selection);
      },

      // 批量删除
      onMultipleDelete () {
        this.$emit("on-multiple-delete", this.selection);
      },

      // 批量删除选择框状态改变
      onSelectDeleteChange (status) {
        this.$refs.table.selectAll(status);
      }
    }
  }
</script>
