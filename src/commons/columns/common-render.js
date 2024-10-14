import moment from "moment";  // 时间格式化插件
import { BASE_IMG_URL } from "@/https/api";

// 公共渲染函数
export function commonRender (h, { row, column }) {
  return h("div", row[column.key] || "--");
}

// 公共日期时间渲染函数
export function dateTimeRender (h, { row, column }) {
  let date = row[column.key];
  if (date) {
    date = moment(date).format("YYYY-MM-DD HH:mm:ss");
  }
  return h("div", date || "--");
}

// 公共日期渲染函数
export function dateRender (h, { row, column }) {
  let date = row[column.key];
  if (date) {
    date = moment(date).format("YYYY-MM-DD");
  }
  return h("div", date || "--");
}

// 图片渲染函数
export function imageRender (h, id) {
  return h("my-img", {
    props: {
      src: BASE_IMG_URL + id
    },
    style: {
      minWidth: "40px",
      height: '40px',
      verticalAlign: 'middle'
    }
  });
}
