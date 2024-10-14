const path = require("path");

const resolve = dir => {
  return path.join(__dirname, dir);
}

// 项目部署基础
// 默认情况下，我们假设你的应用将被部署在域的根目录下,
// 例如：https://www.app.com/
// 默认："/"
// 如果您的应用程序部署在子路径中，则需要在这指定子路径
// 例如：https://www.app.com/my-app/
// 需要将它改为"/my-app/"
// 演示打包路径： https://file.iviewui.com/admin-dist/
const BASE_URL = process.env.NODE_ENV == "production" ? "/" : "/";

module.exports = {
  runtimeCompiler: true,
  css: { // 配置css模块
    loaderOptions: { // 向预处理器 Loader 传递配置选项
      less: { // 配置less（其他样式解析用法一致）
        javascriptEnabled: true, // 设置为true
        // prependData: `@import "@/style/constant.less"`
      },
    },
    sourceMap: true
  },

  // baseUrl: BASE_URL,
  // 如果你不需要使用eslint，把lintOnSave设为false即可
  lintOnSave: false,
  chainWebpack: config => {
    config.resolve.alias.set("@", resolve("src"));

    config.module
      .rule("vue")
      .use("vue-loader")
      .loader("vue-loader")
      .tap(options => {
        // vue-cli3默认的compilerOptions为{ whitespace: "condense", preserveWhitespace: false }
        // 默认是会将template模板里面的空格去掉，为了不让去掉空格，改为true和preserve
        options.compilerOptions.preserveWhitespace = true;
        options.compilerOptions.whitespace = "preserve";
        return options;
      });

    config.module
      .rule("vue")
      .use("iview-loader")
      .loader("iview-loader")
      .tap((options) => {
        return { prefix: true }
      });
    // config.mode = "development"
  },
  // 设为false打包时不生成.map文件
  productionSourceMap: false,
  // 这里写你调用接口的基础路径，来解决跨域，如果设置了代理，那你本地开发环境的axios的baseUrl要写为 "" ，即空字符串
  devServer: {
    port: "1859",
    // proxy: "http://apivpasadmintest.xlbzone.com"
  },
}
