import { returnVisitStatus } from "@/store/json/default";

/* ================= 关怀提醒相关 =================== */
export default {

  // 回访状态
  remindStatus () {
    let input = { 
      type: "select", 
      key: "returnVisitStatus", 
      label: "回访状态", 
      holder: "请选择回访状态",
      data: returnVisitStatus
    }
    return input;
  },
  
  // 回访人
  returnVisitUserId (params = {}) {
    let input = { 
      type: "select", 
      key: "returnVisitUserId", 
      label: "回访人", 
      holder: "请选择回访状态",
      data: params.data
    }
    return input;
  },
  
  // 计划回访日期
  planReturnVisitAt () {
    let input = { 
      type: "multipleDate", 
      label: "计划回访日期", 
      start: {
        key: "planReturnVisitAtFrom",
        holder: "开始日期"
      }, 
      end: {
        key: "planReturnVisitAtTo",
        holder: "结束日期"
      }
    }
    return input;
  },

  // 实际回访日期
  returnVisitAt () {
    let input = { 
      type: "multipleDate", 
      label: "实际回访日期", 
      start: {
        key: "returnVisitAtFrom",
        holder: "开始日期"
      }, 
      end: {
        key: "returnVisitAtTo",
        holder: "结束日期"
      }
    }
    return input;
  }
}
