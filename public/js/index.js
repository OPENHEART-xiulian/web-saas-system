/**
 * 百度统计
 */
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  if (/(saas.xiulianzone)|(^saas.xlbzone)/.test(location.host)) {
    hm.src = "https://hm.baidu.com/hm.js?904e26d0ea5e8919dcf5a849bde5d92e"; // 正式
  } else {
    hm.src = "https://hm.baidu.com/hm.js?ac63d2c2fd200bfe3e2be86179420a71"; // 测试
  }
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
  _hmt.push(['_setAutoPageview', false]);
})();
