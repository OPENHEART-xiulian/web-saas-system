
import { purchaseStatus, settleStatus, getLabel } from "@/store/json/default";

// 采购单相关的筛选表单
export default {
  // 采购单号
  purchaseCode () {
    let input = {
      type: "text",
      key: "purchaseCode",
      label: "单号",
      holder: "请输入采购单号"
    }
    return input;
  },

  // 供应商id
  supplierId (params = {}) {
    let input = { 
      type: "select", 
      key: "supplierId", 
      label: "供应商", 
      holder: "请选择供应商",
      clearable: true,
      value: "",
      data: params.data
    }
    return input;
  },

  // 采购人
  operatorId (params = {}) {
    let input = { 
      type: "select", 
      key: "operatorId", 
      label: "采购人", 
      holder: "请选择采购人",
      clearable: true,
      value: "",
      data: params.data
    }
    return input;
  },

  // 结算状态
  settleStatus () {
    let input = { 
      type: "select", 
      key: "settleStatus", 
      label: "结算状态", 
      holder: "请选择结算状态",
      clearable: true,
      value: "",
      data: settleStatus
    }
    return input;
  },

  // 采购状态
  purchaseStatus () {
    let data = purchaseStatus.slice(0, 2);
    let input = { 
      type: "select", 
      key: "status", 
      label: "采购状态", 
      holder: "请选择采购状态",
      clearable: true,
      value: "",
      data
    }
    return input;
  },

  // 采购日期
  purchaseAtFrom () {
    let input = { 
      type: "date", 
      key: "purchaseAtFrom", 
      label: "采购日期", 
      holder: "开始时间" 
    }
    return input;
  },

  // 结束时间
  purchaseAtTo () {
    let input = { 
      type: "date", 
      key: "purchaseAtTo", 
      label: " ", 
      holder: "结束时间" 
    }
    return input;
  }
}
