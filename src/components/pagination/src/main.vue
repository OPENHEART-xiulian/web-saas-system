<template>
  <!-- 分页组件 -->
  <Page
    class="saas-pagination"
    ref="page"
    :loading="loading"
    :disabled="disabled"
    :total="total"
    :show-sizer="sizer"
    :show-elevator="elevator"
    :current="params.page"
    :page-size="params.rows"
    :page-size-opts="sizeOpts"
    @on-change="currentChange"
    @on-page-size-change="pageChange"/>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      // 数据总数
      type: [String, Number],
      default: 0
    },
    page: {
      // 当前分页
      type: [String, Number],
      default: 1
    },
    rows: {
      // 每页显示多少条
      type: [String, Number],
      default: 10
    },
    disabled: {
      type: Boolean,
      default: false
    },
    sizer: {
      // 是否显示下拉组件
      type: Boolean,
      default: false
    },
    elevator: {
      // 是否显示跳转输入框
      type: Boolean,
      default: false
    }
  },
  watch: {
    page (to) {
      this.params.page = to;
    },

    rows (to) {
      this.params.rows = to;
    }
  },
  data () {
    return {
      sizeOpts: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
      params: {
        page: 1,
        rows: 10
      }
    }
  },
  methods: {
    // 分页改变
    currentChange (current) {
      this.params.page = current;
      this.onChange();
    },
    // 每页显示条数改变
    pageChange (rows) {
      this.params.page = 1;
      this.params.rows = rows;
      this.onChange();
    },

    onChange () {
      this.$emit("on-change", JSON.parse(JSON.stringify(this.params)));
    },

    reset () {
      this.params = {
        page: 1,
        rows: 10
      }
      this.onChange();
      // 当前页码还原
      // this.$refs.page.currentPage = 1;
    }
  }
}
</script>
