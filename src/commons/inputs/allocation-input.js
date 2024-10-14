import { allocationStatus } from "@/store/json/default";

// 调拨单相关的筛选表单
export default {
  // 单号
  allotCode () {
    let input = { 
      type: "text", 
      key: "allotCode", 
      label: "单号", 
      holder: "输入单号搜索" 
    }
    return input;
  },
  
  // 制单人
  creatorId () {
    let input = { 
      type: "select",
      key: "creatorId", 
      label: "制单人", 
      data: []
    }
    return input;
  },

  // 调拨人
  operatorId () {
    let input = { 
      type: "select",
      key: "operatorId", 
      label: "调拨人", 
      data: []
    }
    return input;
  },

  // 状态
  status () {
    let input = { 
      type: "select",
      key: "status", 
      label: "状态", 
      data: allocationStatus
    }
    return input;
  },

  // 开单时间
  createdAtFrom () {
    let input = { 
      type: "date", 
      key: "createdAtFrom", 
      label: "开单时间", 
      holder: "开始时间" 
    }
    return input;
  },

  // 结束时间
  createdAtTo () {
    let input = { 
      type: "date", 
      key: "createdAtTo", 
      label: " ", 
      holder: "结束时间" 
    }
    return input;
  }
}
