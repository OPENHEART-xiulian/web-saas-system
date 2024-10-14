import { onlineProjectType, onlineProjectStatus } from "@/store/json/default";

// 调拨单相关的筛选表单
export default {

  // 项目类型
  type () {
    let input = { 
      type: "select",
      key: "type", 
      label: "项目类型", 
      data: [
          {
              label: "途康",
              value: "1"
          }
      ]
    }
    return input;
  },

  // 项目状态
  status () {
    let input = { 
      type: "select",
      key: "status", 
      label: "项目状态", 
      data: []
    }
    return input;
  },
  // 价格
  price () {
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
