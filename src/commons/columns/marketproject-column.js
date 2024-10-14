import { BASE_IMG_URL, GET_BRAND_LOGO } from "@/https/api";
import { commonRender, dateRender } from "./common-render";

/* ========================== 营销 平台项目 ============================ */
export default {
  // 项目名称
  name (params = {}) {
    let column = { 
      title: "项目名称", 
      key: "name", 
      minWidth: 120,
      render: commonRender
    }
    return column;
  },

  // 缩略图
  thumimg (params = {}) {
    let column = {
      title: "缩略图", 
      minWidth: 100,
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
        return [imgElm];
      }
    }
    return column;
  },

  // 项目类型
  type (params = {}) {
    let column = { 
      title: "项目类型", 
      key: "type", 
      minWidth: 120,
      render: (h, { row }) => {
        return ["途康"];
      }
    }
    return column;
  },

  // 价格
  price (params = {}) {
    let column = { 
      title: "价格", 
      key: "price", 
      minWidth: 120,
      sortable: "custom",
      render: commonRender
    }
    return column;
  },

  // 处理状态
  status (params = {}) {
    let column = {
      title: params.title || "状态",
      key: "status",
      minWidth: 120,
      render: (h, { row }) => {
        // row.remindStatus { 0: 未处理, 1: 已处理 }
        let { remindStatus } = row;
        // switch组件
        let switchElm = h("i-switch", {
          props: {
            value: String(remindStatus),
            trueValue: "1",   // 选中代表未处理
            falseValue: "0"   // 不选择代表已处理
          },
          on: {
            // 更新状态
            "on-change": v => {
              row.remindStatus = v;
              params.update(row, params.status, params.statusKey)
            }
          }
        });

        let textElm = h("span", {
          style: { marginLeft: "4px" }
        }, remindStatus == 1 ? '上架' : '下架');
        
        return h("div", {
          style: { display: "flex" }
        }, [ switchElm, textElm ]);
      }
    }
    return column;
  },
}
