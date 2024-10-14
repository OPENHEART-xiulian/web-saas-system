import moment from "moment";  // 时间格式化插件

export default {
  emptyText (to) {
    return to || "--";
  },
  toFixed (to) {
    return Number(to).toFixed(2);
  },

  toMillesimal (to) {
    return String(to || 0).replace(/\d{1,3}(?=(\d{3})+$)/g, (s) => s + ',');
  },

  formatDate (date) {
    return date ? moment(date).format("YYYY-MM-DD") : "--";
  },
  formatDateTime (date) {
    return date ? moment(date).format("YYYY-MM-DD HH:mm:ss") : "--";
  }
}
