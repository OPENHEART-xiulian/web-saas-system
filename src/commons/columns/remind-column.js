import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateRender } from "./common-render";
import { returnVisitStatus, getLabel } from "@/store/json/default";

/* ========================== 客户提醒相关 ============================ */
export default {
  // 距离提醒天数
  distanceDays (params = {}) {
    let column = { 
      title: params.title || "距离天数", 
      key: "distanceDays", 
      minWidth: 120,
      render: commonRender
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 处理状态
  remindStatus (params = {}) {
    let column = {
      title: params.title || "状态",
      key: "remindStatus",
      minWidth: 120,
      render: (h, { row }) => {
        // row.remindStatus { 0: 未处理, 1: 已处理 }
        let { remindStatus } = row;
        // switch组件
        let switchElm = h("i-switch", {
          props: {
            value: String(remindStatus),
            trueValue: "0",   // 选中代表未处理
            falseValue: "1"   // 不选择代表已处理
          },
          on: {
            // 更新状态
            "on-change": v => {
              row.remindStatus = v;
              params.update(row, params.status, params.statusKey)
            }
          }
        });

        let textElm = h("span", {
          style: { marginLeft: "4px" }
        }, remindStatus == 1 ? '已处理' : '未处理');
        
        return h("div", {
          style: { display: "flex" }
        }, [ switchElm, textElm ]);
      }
    }
    return column;
  },

  // 计划回访日期
  planReturnVisitAt (params = {}) {
    let column = { 
      title: params.title || "计划回访日期", 
      key: "planReturnVisitAt", 
      sortable: "custom",
      minWidth: 140,
      render: dateRender
    }
    return column;
  },

  // 实际回访日期
  returnVisitAt (params = {}) {
    let column = { 
      title: params.title || "实际回访日期", 
      key: "returnVisitAt", 
      sortable: "custom",
      minWidth: 140,
      render: dateRender
    }
    return column;
  },

  // 回访状态：{ 0: 未回访, 1: 已回访 }
  returnVisitStatus (params = {}) {
    let column = { 
      title: params.title || "回访状态", 
      key: "status", 
      minWidth: 100,
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], returnVisitStatus)];
      }
    }
    return column;
  },

  // 回访人
  returnVisitUserName (params = {}) {
    let column = { 
      title: params.title || "回访人", 
      key: "returnVisitUserName", 
      minWidth: 100,
      render: commonRender
    }
    return column;
  },
}
