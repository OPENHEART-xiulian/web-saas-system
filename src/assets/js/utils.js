import { regexEnum } from './regexEnum';
// import storejs from 'storejs';

export const verify = (reg, value) => {
  return regexEnum[reg].test(value);
}

export const formVerify = {
  format: function (rules, value, callback) {
    if (!rules.required && (value === '' || value === undefined)) {
      return callback();
    }
    if (rules.required && !value) {
      return callback(rules.message);
    }

    if (rules.reg && !verify(rules.reg, value)) {
      rules.message = rules.formatTip;
      return callback(rules.message);
    }
    
    if (rules.callback) {
      return rules.callback(rules, value, callback);
    }

    callback();
  }
}

// 动画
export const animation = {
  // 回到指定位置
  toTop (elm, top, time, isClose) {        // 指定元素， 顶部距离,  时间 ms,  是否是关闭动画
    let animate = null;
    if (isClose) {
      window.cancelAnimationFrame(animate);
      return;
    };
    if (!elm) return;
    let startTop = elm.scrollTop;                       // 开始顶部距离
    let endTop = top;                                   // 目标顶部距离
    let distance = endTop - startTop;                   // 总距离

    if (distance === 0) return;                         // 如果距离为0,没必要继续计算了       

    let step = Math.floor(time / 16.6);                 // 总步数    总时间除以 16.6, 16.6相当于一帧的时间
    let yetStep = 0;                                    // 已经走过的步数
    let stepDistance = distance > 0 ? Math.floor(distance / step) : Math.ceil(distance / step); // 每步走的距离, distance 为正数 向下取整， distance 为负数 向上取整
    let hasLastStep = distance % step !== 0;            // 是否有最后一步 有余数代表需要在最后一步加余数

    function start () {
      if (hasLastStep && step === yetStep) {           // 在最后一步增加余数
        elm.scrollTop = elm.scrollTop + (distance % step);
      } else {
        elm.scrollTop = elm.scrollTop + stepDistance;
      }

      if (yetStep === step) return;                    // 如果 已滚动的步数 等于 总步数 不执行后面函数

      yetStep++;
      animate = window.requestAnimationFrame(start);
    }
    start();
  }
}

/**
 * 将数据转换成base64
 * @param {any} str
 * @returns
 */
export const base64encode = (str) => {
  var keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var output = "";
  var chr1;
  var chr2;
  var chr3 = "";
  var enc1;
  var enc2;
  var enc3;
  var enc4 = "";
  var i = 0;
  var input = utf16to8(str);
  do {
    chr1 = input.charCodeAt(i++);
    chr2 = input.charCodeAt(i++);
    chr3 = input.charCodeAt(i++);
    enc1 = chr1 >> 2;
    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
    enc4 = chr3 & 63;
    if (isNaN(chr2)) {
      enc3 = enc4 = 64;
    } else if (isNaN(chr3)) {
      enc4 = 64;
    }
    output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    chr1 = chr2 = chr3 = "";
    enc1 = enc2 = enc3 = enc4 = "";
  } while (i < input.length);
  return output;
}

/**
 * 将base64转换为file
 * @param {String} dataUrl base64数据
 * @param {String} filename 文件名称
 */
export const dataURLtoFile = (dataUrl, filename) => {
  var arr = dataUrl.split(',');
  var mime = arr[0].match(/:(.*?);/)[1];
  var bstr = atob(arr[1]);
  var n = bstr.length;
  var u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

/**
 * 本地储存
 */
export const storage = {
  method: 'localStorage',
  set: (key, value, time, method) => {
    var data, valid;
    method = method || storage.method;
    data = {
      value: JSON.stringify(value)
    };
    if (typeof time == 'number') {
      valid = time * 60 * 1e3;
      data.timestamp = new Date().getTime() + valid
    } else {
      data.timestamp = null;
    }
    return window[method].setItem(key, JSON.stringify(data));
  },
  get: (key, method) => {
    var data;
    method = method || storage.method;
    data = JSON.parse(window[method].getItem(key));
    return data && data.value ? (data.timestamp === null ? JSON.parse(data.value) : ((new Date().getTime() < data.timestamp) && JSON.parse(data.value)) || !1) : !1;
  },
  remove: (key, method) => {
    method = method || storage.method;
    window[method].removeItem(key);
  },
  clear: (method) => {
    method = method || storage.method;
    // window[method].clear();
    clearStorge();
  }
};

// export const storage = {
//   set (key, value) {
//     storejs.set(key, value);
//   },
//   get (key) {
//     return storejs.get(key);
//   },
//   remove (key) {
//     storejs.remove(key);
//   },
//   clear () {
//     storejs.clear();
//   }
// }

export const Cookie = {
  /**
   * Cookie对象
   * @param {string} name
   * @param {string} value
   * @param {string} time 注意：d 代表天; h 代表小时; m 代表分钟
   * @class CookieStorage
   */
  setCookie (name, value, time) {
    let date = new Date();
    let times = 0;
    if (time.charAt(0).toLowerCase() === 'd') { // 以天为单位
      times = parseInt(time.substr(1));
      date.setTime(date.getTime() + times * 24 * 60 * 60 * 1000);
    } else if (time.charAt(0).toLowerCase() === 'h') { // 以小时为单位
      times = parseInt(time.substr(1));
      date.setTime(date.getTime() + times * 60 * 60 * 1000);
    }
    document.cookie = name + '=' + escape(value) + ' ;expires=' + date.toGMTString();
  },
  getCookie (name) {
    let reg = new RegExp('(^| )' + name + '=([^;]*)(;|$)');
    let arr = document.cookie.match(reg);
    return unescape(arr[2]);
  },
  clearCookie (name) {
    let cookie = this.getCookie(name);
    let date = new Date();
    date.setTime(date.getTime() - 1);
    document.cookie = name + '=' + cookie + ' ;expires=' + date.toGMTString();
  }
};

/**
 * 格式化时间
 * @param {*} date 
 * @param {*} fmt 
 */
export const formatTime = (date, fmt) => {
  if (!date) return; // 防止undefined
  date = date.getMonth ? date : new Date(date);
  var o = {
    "M+": date.getMonth() + 1, // 月份
    "d+": date.getDate(), // 日
    "H+": date.getHours(), // 小时
    "m+": date.getMinutes(), // 分
    "s+": date.getSeconds(), // 秒
    "q+": Math.floor((date.getMonth() + 3) / 3), // 季度
    S: date.getMilliseconds() // 毫秒
  };
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(
      RegExp.$1,
      (date.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var k in o) {
    if (new RegExp("(" + k + ")").test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)
      );
    }
  }
  return fmt;
};

export const timeSection = ( date ) => {
  const dateNow = date ? new Date(date) : new Date()
  const hours = dateNow.getHours()
  if ( (hours > 0  || hours === 0 ) && hours < 6) {
    return '凌晨'
  } else if ((hours > 6 || hours === 6 ) && hours < 12) {
    return '上午'
  } else if ((hours > 12 || hours === 12) && hours < 18) {
    return '下午'
  } else {
    return '晚上'
  }
}

/**
 * 获取随机数字字符串
 * @param {*} len 
 */
export const randomStr = (len) => {
  // 获取0-9随机数 count： 多少位数
  let str = "";
  for (let i = 0; i < len; i++) {
    str += Math.floor(Math.random() * 10);
  }
  return str;
}

export const clearStorge = () => {
  // const iconMenu = storage.get('ICON_MENU');
  // const userName = storage.get('USERNAME');
  // const version = storage.get('version');
  // const cityVersion = storage.get('city-version');
  // const province = storage.get('province');
  // const city = storage.get('city');
  // const county = storage.get('county');
  // const street = storage.get('street');
  // storage.clear();
  // storage.set('ICON_MENU', iconMenu);
  // storage.set('USERNAME', userName);
  // storage.set('version', version);
  // storage.set('city-version', cityVersion);
  // storage.set('province', province);
  // storage.set('city', city);
  // storage.set('county', county);
  // storage.set('street', street);
  // location.reload();
  storage.remove("TOKEN");
  storage.remove("USER");
  storage.remove("STORE");
}

export const multiply = (a, b, num) => { // 两个数相乘精度转换
  let newNum = num || 100;
  let newA = Number(a) * newNum;
  let newB = Number(b) * newNum;
  return (newA * newB) / (newNum * newNum);
}

/**
 *  @param { String } interval 字符串表达式，表示要添加的时间间隔.
 *  @param { Number } number 数值，表示要添加的时间间隔数.
 *  @param { String, Date } date 时间
 *  @return { Date } 新的时间对象.
 *  var now = new Date();
 *  var newDate = DateAdd( "day", 5, now);
 */
export const DateAdd = (interval, number, date, format) => {
  if (!date) return;
  date = new Date(date) || date;
  switch (interval) {
    case "year":      // 按年
      date.setFullYear(date.getFullYear() + number);
      break;
    case "quarter":   // 按季度
      date.setMonth(date.getMonth() + number * 3);
      break;
    case "month":     // 按月
      date.setMonth(date.getMonth() + number);
      break;
    case "week":      // 按星期
      date.setDate(date.getDate() + number * 7);
      break;
    case "day":       // 按天
      date.setDate(date.getDate() + number);
      break;
    case "hour":      // 按小时
      date.setHours(date.getHours() + number);
      break;
    case "minute":    // 按分钟
      date.setMinutes(date.getMinutes() + number);
      break;
    case "second":    // 按秒
      date.setSeconds(date.getSeconds() + number);
      break;
    default:          // 默认按天
      date.setDate(date.getDate() + number);
      break;
  }
  return formatTime(date, format || 'yyyy-MM-dd');
}

export class Debounce {
  constructor ( fn ) { 
    if (typeof fn !== 'function') {
      const err = {
        msg: 'Errors: argument fn need function'
      }
      console.error( err.msg )
      throw err
    }
    this.timer = null 
    this.fn = fn 
  }
  debounce () {
    if (this.timer) clearTimeout( this.timer )
    this.timer = setTimeout(() => {
      this.fn.apply(this, arguments);
      clearTimeout( this.timer )
      this.timer = null
    }, 500)
  }
}
