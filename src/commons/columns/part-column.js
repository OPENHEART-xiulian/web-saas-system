import { BASE_IMG_URL } from "@/https/api";
import { commonRender } from "./common-render";
import { unit, getLabel } from "@/store/json/default";

/* ========================== 配件相关 ============================ */
export default {
  // 配件编号
  partNo (params = {}) {
    let column = {
      key: "partNo", 
      title: params.title || "配件编号",
      minWidth: 160
    }
    return column;
  },

  // 配件图片
  partImg (params = {}) {
    let column = 
    { 
      title: params.title || "图片", 
      key: "imgIds",
      minWidth: 80,
      render: (h, { row }) => {
        return h("my-img", {
          props: { src: BASE_IMG_URL + row.imgIds[0] },
          style: { width: "40px", height: "40px" }
        });
      }
    }
    return column;
  },

  // 原厂编码
  partFactoryNo (params = {}) {
    let column = {
      title: "原厂编码", 
      key: "partFactoryNo", 
      minWidth: 160,
      render: commonRender
    }
    return column;
  },

  // 配件名称
  partName (params = {}) {
    let column = {
      title: params.title || "名称", 
      key: "partName", 
      minWidth: 160,
      render: commonRender
    }
    if (params.fixed) column.fixed = params.fixed;
    return column;
  },

  // 配件品牌
  partBrand (params = {}) {
    let column = { 
      title: params.title || "品牌", 
      key: "brand",
      minWidth: 140,
      render: commonRender
    }
    return column;
  },

  // 配件类别  xx/xx  截取后面的xx
  partCate (params = {}) {
    let column = { 
      title: params.title || "类别", 
      key: "cateStr",
      minWidth: 120,
      render: (h, { row }) => {
        return h("div", row.cateStr.split("/").pop())
      } 
    }
    return column;
  },

  // 配件单位
  partUnit (params = {}) {
    let column = { 
      title: params.title || "单位", 
      key: "unit",
      minWidth: 80,
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], unit)];
      }
    }
    return column;
  },

  // 采购均价
  purchasePrice (params = {}) {
    let column = { 
      title: params.title || "采购均价", 
      key: "purchasePrice", 
      minWidth: 100 
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 零售价
  retailPrice (params = {}) {
    let column = { 
      title: params.title || "零售价", 
      key: "retailPrice", 
      minWidth: 100
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },

  // 销售量
  saleQuantity (params = {}) {
    let column = 
    { 
      title: "近30天销量", 
      key: "saleQuantity", 
      minWidth: 120
    }
    if (params.sortable) column.sortable = params.sortable;
    return column;
  },
}
