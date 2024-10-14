import { dateRender, dateTimeRender } from "./common-render";
export default {  // 共用的列
  // 序号
  index (params = {}) {
    let column = {
      type: "index", 
      title: params.title || "序号", 
      width: params.width || 50,
      align: params.align || "center"
    }
    if (params.fixed) column.fixed = params.fixed;
    return column;
  },

  selection (params = {}) {
    let column = {
      type: 'selection', 
      width: 50,
      align: params.align || "center"
    }
    if (params.fixed) column.fixed = params.fixed;
    return column;
  },

  // 日期
  date (params = {}) {
    let column = { 
      title: params.title, 
      key: params.key,
      minWidth: 120,
      render: dateRender
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 日期 + 时间
  dateTime (params = {}) {
    let column = { 
      title: params.title, 
      key: params.key,
      minWidth: 160,
      render: dateTimeRender
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  }
}
