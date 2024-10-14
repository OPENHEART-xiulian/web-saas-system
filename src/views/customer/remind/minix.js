
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
      this.$emit("on-change", data.headerData);
    },
    
    /**
     * 更新处理状态
     * @param { object } row        表格对应的行
     * @param { string } status     提醒类型      { 0: 生日提醒, 1: 保险提醒, 2: 年检提醒, 3: 保养提醒 }
     * @param { string } statusKey  状态对应的key { birthday     insurance   annualCheck  maintain }
     */
    async update (row, status, statusKey) {
      return
      let params = {
        id: row._id,
        status: String(status),
        statementNo: row.statementNo,
        distanceDays: row.distanceDays,
        remindStatus: String(row.remindStatus)
      }
      if (row.vehicleId) params.vehicleId = row.vehicleId;

      await ajax.updateRemindStatus(params);
      this.$Message.success("修改成功");
      let value = 1;
      if (row.remindStatus == 1) {
        value = -1;
      } else {
        value = 1;
      }
      // 更新Tab的徽标
      this.$emit("on-head-change", statusKey, value);
    }
  }
}
