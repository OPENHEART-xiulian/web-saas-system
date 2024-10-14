/**
 * 验证数组和数组之间是否存在不一样的元素，只支持基本类型
 * @param { array } byValidArray 被验证的
 * @param { array } validTemp 验证模板
 * @returns { boolean } 返回是否存在不一样的元素 true： 是 false： 否 
 */
export function validArrayInArray (byValidArray, validTemp) {
  for (let i = 0; i < byValidArray; i++) {
    let byItem = byValidArray[i];
    // 存在不一样的返回true
    if (validTemp.find(elm => byItem !== elm)) {
      return true;
    }
  }
  return false;
}

/**
 * 根据key获取列表对应的值
 * @param {*} array 要查询的列表 
 * @param {*} key   要查询的键值
 */
export function getArrayValueByKey (array, key) {
  let obj = getArrayToObject(array);
  return obj[key];
}

/**
 * 将数组变成obj
 * @param {*} array 要变换的数组 
 * @param {*} key   什么当做键值
 * @param {*} value   什么当做值
 */
export function getArrayToObject (array, key = "value", value = "label") {
  let obj = {};
  for (let i = 0; i < array.length; i++) {
    let item = array[i];
    obj[item[key]] = item[value];
  }
  return obj;
}
