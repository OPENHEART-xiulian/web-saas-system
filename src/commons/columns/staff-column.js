import { BASE_IMG_URL } from "@/https/api";
import { commonRender, dateTimeRender } from "./common-render";

/* ========================== 员工相关 ============================ */
export default {
  // 员工姓名
  username (params = {}) {
    let column = { 
      title: params.title || "姓名", 
      key: "username", 
      minWidth: 120
    }
    return column;
  },

  // 手机号（登录账号）
  mobile (params = {}) {
    let column = { 
      title: params.title || "手机号（登录账号）", 
      key: "mobile", 
      minWidth: 120
    }
    return column;
  },

  // 添加人
  addedName (params = {}) {
    let column = { 
      title: params.title || "添加人", 
      key: "addedName", 
      minWidth: 120
    }
    return column;
  },

  // 添加时间
  addDate (params = {}) {
    let column = { 
      title: params.title || "添加人", 
      key: "createdAt", 
      minWidth: 120,
      render: dateTimeRender
    }
    return column;
  },

  // 角色名称 职位权限
  roleName (params = {}) {
    let column = { 
      title: params.title || "角色名称", 
      key: "roleName", 
      minWidth: 120
    }
    return column;
  },

  // 角色描述
  description (params = {}) {
    let column = { 
      title: params.title || "描述", 
      key: "description", 
      minWidth: 120,
      render: (h, { row, column }) => {
        return [row.roleName == "店长" ? "具备门店所有管理权限" : row[column.key]];
      }
    }
    return column;
  },

  // 员工数量
  employeeCount (params = {}) {
    let column = { 
      title: params.title || "员工数量", 
      key: "employeeCount", 
      minWidth: 120
    }
    return column;
  }
}
