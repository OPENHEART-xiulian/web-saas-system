import { BASE_IMG_URL, GET_BRAND_LOGO } from "@/https/api";
import { commonRender, dateRender } from "./common-render";

/* ========================== 车辆相关 ============================ */
export default {
  // 车牌号码
  plateNo (params = {}) {
    let column = { 
      title: params.title || "车牌号", 
      key: "plateNo", 
      minWidth: 120,
      render: (h, { row, column }) => {
        let data = row[column.key];
        let opt = {};
        if (params.border !== false) {
          opt.class = "saas-plateno" + (data ? "" : " no-plateno");
        }
        return h("div", opt, data || "暂无车牌号");
      }
    }
    return column;
  },

  // 车型
  vehicleStyle (params = {}) {
    let column = {
      title: params.title || "车型", 
      minWidth: params.hasPlate ? 300 : 220,
      render: (h, { row }) => {
        let imgElm = h('my-img', {
          props: {
            src: GET_BRAND_LOGO + row.brandId
          },
          style: {
            minWidth: "33px",
            height: '33px',
            verticalAlign: 'middle',
            marginRight: '8px'
          }
        });
        
        let brands = row.vehicleBrand;
        // 如果没有品牌，显示--
        if (!brands) brands = "--";
        // 不是其他品牌
        else if (brands !== "其他品牌") {
          // 车系
          if (row.carSeries) {
            brands += "/" + row.carSeries;
          }
          // 车型
          if (row.carStyle) {
            brands += "/" + row.carStyle;
          }
        }
        let otherElm = h("span", brands);
        let elms = [imgElm, otherElm];
        // 如果需要同时显示车牌号
        if (params.hasPlate) {
          elms.unshift(
            h("div", {
              style: { marginRight: "8px" },
              class: "saas-plateno" + (row.plateNo ? "" : " no-plateno")
            }, row.plateNo || "暂无车牌号")
          );
        }
        return h("div", {
          style: { display: "flex", alignItems: "center" }
        }, elms);
      }
    }
    return column;
  },

  // 保险到期时间
  insuranceExpire (params = {}) {
    let column = { 
      title: params.title || "保险到期时间", 
      key: "insuranceExpireDate", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 年检到期时间
  annualExpire (params = {}) {
    let column = { 
      title: params.title || "年检到期时间", 
      key: "registDate", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 保养到期日期
  maintainExpire (params = {}) {
    let column = { 
      title: params.title || "保养到期日期", 
      key: "maintainExpDate", 
      minWidth: 120,
      render: dateRender
    }
    return column;
  },

  // 上次维修日期
  prevRepariDate (params = {}) {
    let column = { 
      title: params.title || "上次维修日期", 
      key: "createdAt", 
      minWidth: 120,
      render: dateRender
    }
    return column;
  }
}
