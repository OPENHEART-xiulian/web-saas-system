// import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateTimeRender } from "./common-render";
import { allocationStatus, getLabel } from "@/store/json/default";

/* ========================== 调拨单相关 ============================ */
export default {
  // 调拨单单号
  allotCode (params = {}) {
    let column = { 
      title: params.title || "单号", 
      key: "allotCode", 
      minWidth: 170
    }
    return column;
  },

  // 制单人
  createdBy (params = {}) {
    let column = {
      title: params.title || "制单人",
      key: "createdBy",
      minWidth: 100
    }
    return column;
  },

  // 调拨人
  operatedBy (params = {}) {
    let column = {
      title: params.title || "调拨人",
      key: "operatedBy",
      minWidth: 100
    }
    return column;
  },

  // 调拨数量
  totalQuantity (params = {}) {
    let column = {
      title: params.title || "调拨数量",
      key: "totalQuantity",
      minWidth: 100
    }
    return column;
  },

  // 开单时间
  createdAt (params = {}) {
    let column = { 
      title: params.title || "开单时间", 
      key: "createdAt",
      minWidth: 160,
      render: dateTimeRender
    }
    return column;
  },

  // 状态
  status (params = {}) {
    let column = { 
      title: params.title || "状态", 
      key: "status", 
      minWidth: 100,
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], allocationStatus)];
      }
    }
    return column;
  },
}
