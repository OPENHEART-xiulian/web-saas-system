
/**
 * 给分类设置数量（只设置一级分类数量）
 * @param { array  } cateArr  分类列表
 * @param { object } countObj 分类数量列表
 * @returns { array } 返回设置好数量的分类列表
 */
export function setPartCateCount (cateArr, countObj, allName) {
  let newCateList = [];
  newCateList.push({
    code: "",
    name: allName,
    value: countObj.all || 0,
    ancestors: [],
    children: []
  });
  for (let i = 0; i < cateArr.length; i++) {
    let item = cateArr[i];
    if (item.code == "other") {
      item.value = countObj[""] || 0;
    } else {
      item.value = countObj[item.code] || 0;
    }
    newCateList.push(item);
  }
  return newCateList;
}

/**
 * 格式分类数据 格式成iview的tree组件所需要的数据
 * @param { array  } cateArr  分类列表
 * @param { object } countObj 分类数量列表
 * @param { string } allName  是否有全部分类，直接传分类名称
 * @returns { array } 返回设置好数量的分类列表
 */
export function formatCategoryData (cateArr, countObj, allName) {
  let newCateList = [];
  if (allName) {
    newCateList.push({
      code: "",
      title: allName,
      value: countObj.all || 0,
      selected: true,
      ancestors: [],
      children: []
    });
  }
  for (let i = 0; i < cateArr.length; i++) {
    let item = cateArr[i];
    let newItem = {};
    // 是否有值
    if (countObj) {
      if (item.code == "other") {
        newItem.value = countObj[""] || 0;
      } else {
        newItem.value = countObj[item.code] || 0;
      }
    }
    newItem.cid = item.cid;
    newItem.title = item.name;
    newItem.code = item.code;
    newItem.ancestors = item.ancestors;
    newItem.children = formatCategoryData(item.children || []);
    newCateList.push(newItem);
  }
  return newCateList;
}
