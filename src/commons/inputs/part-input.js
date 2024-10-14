// 配件相关的筛选表单
export default {
  // 配件名称
  partName () {
    let input = { 
      type: "text", 
      key: "partName", 
      label: "配件名称", 
      holder: "输入配件名称"
    }
    return input;
  },
  
  // 配件编号
  partNo () {
    let input = { 
      type: "text", 
      key: "partNo", 
      label: "配件编号", 
      holder: "输入配件编号"
    }
    return input;
  },

  // 原厂编码
  partFactoryNo () {
    let input = { 
      type: "text", 
      key: "partFactoryNo", 
      label: "原厂编码", 
      holder: "输入原厂编码"
    }
    return input;
  },

  // 配件品牌
  partBrand () {
    let input = { 
      type: "text", 
      key: "brand", 
      label: "配件品牌", 
      holder: "输入配件品牌"
    }
    return input;
  },

  // 配件分类
  partCate (params) {
    let input = { 
      type: "select", 
      key: "code", 
      label: "类别", 
      holder: "请选择类别",
      clearable: true,
      data: params.data
    }
    return input;
  }
}
