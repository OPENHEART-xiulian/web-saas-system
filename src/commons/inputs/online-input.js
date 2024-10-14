import { onlineProjectType, onlineProjectStatus } from "@/store/json/default";

// 调拨单相关的筛选表单
export default {

  // 项目类型
  projectType () {
    let input = { 
      type: "select",
      key: "type", 
      label: "项目类型", 
      data: onlineProjectType
    }
    return input;
  },

  // 项目状态
  projectStatus () {
    let input = { 
      type: "select",
      key: "status", 
      label: "项目状态", 
      data: onlineProjectStatus
    }
    return input;
  },

  // 曝光量
  projectExposure () {
    let input = { 
      type: "multipleInput",
      label: "曝光量", 
      reg: "NUMBER",
      start: {
        key: "startExposure"
      },
      end: {
        key: "endExposure"
      },
      append: "次"
    }
    return input;
  },
  // 价格
  projectPrice () {
    let input = { 
      type: "multipleInput",
      label: "价格", 
      reg: "NUMBER",
      start: {
        key: "startPrice"
      },
      end: {
        key: "endPrice"
      },
      append: "元"
    }
    return input;
  }
}
