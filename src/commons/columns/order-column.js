import { BASE_IMG_URL } from "@/https/api";
import { commonRender } from "./common-render";

/* ========================== 工单相关 ============================ */
export default {
  // 工单号
  statementNo (params = {}) {
    let column = { 
      title: params.title || "工单号", 
      key: "statementNo", 
      minWidth: 200
    }
    return column;
  },
}
