// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
// import "babel-polyfill";
import Vue from "vue";
import ViewUI from "view-design";
import "@/styles/iview.less";
import router from "./router";
import components from "@/components/index.js";
import filters from "@/commons/filters/common-filter";
import App from "./App";
import ECharts from "vue-echarts"
import store from "./store";
import VueQr from "vue-qr";
import moment from "moment";  // 时间格式化插件
import axios from "axios"
import ajax from "./https/modules/index";
import { storage } from "./assets/js/utils";
import { cancel } from "@/https";

Vue.prototype.$moment = moment;
Vue.prototype.$ajax = ajax;
Vue.prototype.$storage = storage;

// 设置iview tree组件默认图标
// Vue.use(ViewUI, {
//   tree: {
//     arrow: "md-arrow-dropright",
//     arrowSize: 24
//   }
// });
Vue.config.productionTip = false
Vue.use(ViewUI)
Vue.use(components)
Vue.component("chart", ECharts)
Vue.component("qrcode", VueQr)
// Vue.config.errorHandler = (a, b, c) => {
//   console.log("============================");
//   console.dir(a);
//   console.log("============================");
//   console.dir(b);
//   console.log("============================");
//   console.dir(c);
// }

router.beforeEach((to, from, next) => {
  const CancelToken = axios.CancelToken
  cancel.source.cancel && cancel.source.cancel()
  cancel.source = CancelToken.source()
  next()
})

Vue.mixin({
  filters: filters
});
/* eslint-disable no-new */
new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
