
import ajax from "@/https/modules/customer.api";
// 关怀提醒公用函数
export default {
  data () {
    return {
      defaultParams: {
        orderBy: "_id",
        sortOrder: "1"
      },
      loading: false
    }
  },
  methods: {
    // 返回table中loading的状态
    onLoadingChange (loading) {
      this.loading = loading;
    },

    // 设置参数筛选数据
    onTableSearch () {
      this.$refs.table.reset();
    },

    // 更新Tab的徽标
    async onTableSuccess (data) {
      // this.$emit("on-change", data.headerData);
    },
  }
}
