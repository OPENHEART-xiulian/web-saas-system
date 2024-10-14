import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateRender } from "./common-render";
import { returnVisitStatus, getLabel } from "@/store/json/default";

/* ========================== 客户相关 ============================ */
export default {
  // 客户姓名
  name (params = {}) {
    let column = { 
      title: params.title || "客户姓名", 
      key: params.key || "name", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 车辆所有人
  vehicleOwner (params = {}) {
    let column = {  
      title: params.title || "车辆所有人", 
      key: "vehicleOwner", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 手机号
  mobile (params = {}) {
    let column = { 
      title: params.title || "手机号", 
      key: params.key || "mobile", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 联系方式
  ownerMobile (params = {}) {
    let column = { 
      title: params.title || "联系方式", 
      key: "ownerMobile", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 生日
  birthday (params = {}) {
    let column = { 
      title: params.title || "生日", 
      key: "birthday", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },


  //上次送修里程
  before (params = {}) {
    let column = { 
      title: params.title || "上次送修里程", 
      key: params.key || "deliveryMileage", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },



  //建议保养里程
  ad (params = {}) {
    let column = { 
      title: params.title || "建议保养里程", 
      key: params.key || "adviceMileage", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },




}
