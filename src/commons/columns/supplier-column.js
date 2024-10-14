// import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateTimeRender } from "./common-render";

/* ========================== 供应商相关 ============================ */
export default {
  // 供应商名称
  supplierName (params = {}) {
    let column = { 
      title: params.title || "供应商", 
      key: "supplierName", 
      minWidth: 140,
      render: commonRender 
    }
    return column;
  },

  // 供应商编号
  supplierCode (params = {}) {
    let column = { 
      title: params.title || "编号", 
      key: "supplierCode", 
      minWidth: 160,
      render: commonRender 
    }
    return column;
  },

  // 供应商联系人
  supplierContact (params = {}) {
    let column = { 
      title: params.title || "联系人", 
      key: "contact",
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 供应商联系电话
  supplierTel (params = {}) {
    let column = { 
      title: params.title || "联系电话", 
      key: "tel",
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 采购次数
  purchaseCount (params = {}) {
    let column = { 
      title: params.title || "采购次数", 
      key: "purchaseCount",
      minWidth: 100,
    }
    return column;
  },

  // 待结账款
  toSettle (params = {}) {
    let column = { 
      title: params.title || "待结账款", 
      key: "toSettle",
      minWidth: 100,
    }
    return column;
  },

  // 最近采购时间
  lastPurchaseAt (params = {}) {
    let column = { 
      title: params.title || "最近采购时间", 
      key: "lastPurchaseAt",
      minWidth: 160,
      render: dateTimeRender
    }
    return column;
  },
}
