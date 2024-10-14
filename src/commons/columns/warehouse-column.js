import { BASE_IMG_URL } from "@/https/api";
import { commonRender } from "./common-render";
import { warehouseWarningStatus, getLabel } from "@/store/json/default";

/* ========================== 仓库相关 ============================ */
export default {
  // 仓库名称
  warehouseName (params = {}) {
    let column = { 
      title: params.title || "仓库", 
      key: "warehouseName", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 货位名称
  shelfName (params = {}) {
    let column = { 
      title: params.title || "货位", 
      key: "shelfName", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 库存
  quantity (params = {}) {
    let column = { 
      title: params.title || "库存", 
      key: "quantity", 
      minWidth: 80, 
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 库存上限
  upperLimit (params = {}) {
    let column = { 
      title: params.title || "库存上限", 
      key: "endCountWarning", 
      minWidth: 80, 
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 库存下限
  lowerLimit (params = {}) {
    let column = { 
      title: params.title || "库存下限", 
      key: "startCountWarning", 
      minWidth: 80, 
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 库存预警状态
  warningStatus (params = {}) {
    let column = { 
      title: params.title || "预警状态", 
      key: "warningStatus", 
      minWidth: 80, 
      render: (h, { row, column }) => {
        let warningStatus = row[column.key];
        let props = { type: warningStatus == 0 ? "primary" : "error" };
        return h("i-button", { props, style: "width: 48px; padding: 0; cursor: text;" }, getLabel(warningStatus, warehouseWarningStatus));
      }
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },
}
