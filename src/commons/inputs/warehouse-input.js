import { warehouseWarningStatus } from "@/store/json/default";
// 仓库相关的筛选表单
export default {
  // 仓库下拉选择
  warehouseSelect (params) {
    let input = { 
      type: "select", 
      key: "warehouseId", 
      label: "仓库", 
      holder: "请选择仓库",
      clearable: true,
      value: params.value,
      data: params.data
    }
    return input;
  },

  // 库存预警状态
  warehouseWarning () {
    let input = { 
      type: "select", 
      key: "warningStatus", 
      label: "预警状态", 
      holder: "请选择预警状态",
      clearable: true,
      value: "",
      data: warehouseWarningStatus
    }
    return input;
  },

  // 库存上限
  upperLimit () {
    let input = { 
      type: "multipleInput", 
      label: "库存上限", 
      reg: "NUMBER",
      start: {
        key: "startMax",
        value: "",
        holder: ""
      },
      end: {
        key: "endMax",
        value: "",
        holder: ""
      },
      append: "个",
    }
    return input;
  },

  // 库存下限
  lowerLimit () {
    let input = { 
      type: "multipleInput", 
      label: "库存下限", 
      reg: "NUMBER",
      start: {
        key: "startMin",
        value: "",
        holder: ""
      },
      end: {
        key: "endMin",
        value: "",
        holder: ""
      },
      append: "个",
    }
    return input;
  }
}
