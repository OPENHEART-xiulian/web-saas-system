import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateRender, dateTimeRender } from "./common-render";
import { purchaseStatus, settleStatus, getLabel } from "@/store/json/default";

/* ========================== 采购单相关 ============================ */
export default {
  // 采购单号
  purchaseCode (params = {}) {
    let column = { 
      title: params.title || "单号", 
      key: "purchaseCode", 
      minWidth: 160
    }
    return column;
  },
  
  // 采购状态
  status (params = {}) {
    let column = { 
      title: params.title || "采购状态", 
      key: "status", 
      minWidth: 80, 
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], purchaseStatus)];
      }
    }
    return column;
  },
  
  // 结算状态
  settleStatus (params = {}) {
    let column = { 
      title: params.title || "结算状态", 
      key: "settleStatus", 
      minWidth: 80, 
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], settleStatus)];
      }
    }
    return column;
  },

  // 开单日期
  orderAt (params = {}) {
    let column = { 
      title: params.title || "开单日期", 
      key: "orderAt", 
      minWidth: 160,
      render: dateTimeRender
    }
    return column;
  },

  // 采购日期
  purchaseAt (params = {}) {
    let column = { 
      title: params.title || "采购日期", 
      key: "purchaseAt", 
      minWidth: 160,
      render: dateTimeRender
    }
    return column;
  },

  // 采购数量
  totalQuantity (params = {}) {
    let column = { 
      title: params.title || "采购数量", 
      key: "totalQuantity", 
      minWidth: 80
    }
    return column;
  },

  // 采购金额
  totalCost (params = {}) {
    let column = { 
      title: params.title || "金额", 
      key: "totalCost", 
      minWidth: 80
    }
    return column;
  },

  // 采购人
  operatedBy (params = {}) {
    let column = { 
      title: params.title || "采购人", 
      key: "operatedBy", 
      minWidth: 80
    }
    return column;
  }
}
