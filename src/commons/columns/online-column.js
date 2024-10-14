// import { BASE_IMG_URL } from "@/https/api";
import { onlineProjectType, getLabel } from "@/store/json/default";

export default {
  nameColumn (params = {}) {
    let column = { 
      title: params.title || "项目名称", 
      key: "name", 
      minWidth: 170
    }
    return column;
  },

  imgColumn (params = {}) {
    let column = {
      title: params.title || "缩略图",
      key: "createdBy",
      minWidth: 100
    }
    return column;
  },

  typeColumn (params = {}) {
    let column = {
      title: params.title || "项目类型",
      key: "operatedBy",
      minWidth: 100,
      render: (h, { row, column }) => {
        return [getLabel(row[column.key], onlineProjectType)];
      }
    }
    return column;
  },

  priceColumn (params = {}) {
    let column = {
      title: params.title || "价格",
      key: "totalQuantity",
      minWidth: 100
    }
    return column;
  },

  exposureColumn (params = {}) {
    let column = { 
      title: params.title || "曝光量", 
      key: "createdAt",
      minWidth: 160,
      render: dateTimeRender
    }
    return column;
  }
}
