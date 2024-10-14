import { returnvisitStatus } from "@/store/json/default";

// 工单相关筛选表单
export default {
  // 配件名称
  statementNo () {
    let input = { 
      type: "text", 
      key: "statementNo", 
      label: "工单号", 
      holder: "请输入工单号"
    }
    return input;
  },

  filter () {
    let input = { 
      type: "text", 
      key: "filter", 
      label: "搜索工单", 
      holder: "输入工单号 / 车牌号 / 姓名 / 电话号码"
    }
    return input;
  },

  // 开单日期
  orderAtFrom () {
    let input = { 
      type: "date", 
      key: "orderAtFrom", 
      label: "开单日期", 
      holder: "开始时间" 
    }
    return input;
  },

  // 结束时间
  orderAtTo () {
    let input = { 
      type: "date", 
      key: "orderAtTo", 
      label: " ", 
      holder: "结束时间" 
    }
    return input;
  }
}
