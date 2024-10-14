import "./index.less";
import ToggleBtn from "./src/toggle-btn";

/* istanbul ignore next */
ToggleBtn.install = function (Vue) {
  Vue.component(ToggleBtn.name, ToggleBtn);
};

export default {
  ToggleBtn
}
