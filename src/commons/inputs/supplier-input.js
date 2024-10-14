// 供应商相关的筛选表单
export default {
  // 配件名称
  supplierCode () {
    let input = { 
      type: "text", 
      key: "supplierCode", 
      label: "编号", 
      holder: "请输入供应商编号" 
    }
    return input;
  },
  
  // 供应商名称
  supplierName () {
    let input = { 
      type: "text", 
      key: "supplierName", 
      label: "名称", 
      holder: "请输入供应商名称"
    }
    return input;
  },

  // 联系人姓名
  contact () {
    let input = { 
      type: "text", 
      key: "contact", 
      label: "联系人姓名", 
      holder: "请输入联系人名称"
    }
    return input;
  },

  // 采购次数
  purchaseCount () {
    let input = {
      type: "multipleInput",
      label: "采购次数",
      start: {
        key: "purchaseCountFrom"
      },
      end: {
        key: "purchaseCountTo"
      },
      append: "次"
    }
    return input;
  },

  // 待结账款
  toSettle () {
    let input = {
      type: "multipleInput",
      label: "待结账款",
      start: {
        key: "toSettleFrom"
      },
      end: {
        key: "toSettleTo"
      },
      append: "￥"
    }
    return input;
  }
}
