// 快速创建一个空对象
export const _null = () => Object.create(null);

// 判断是否是空
export const isEmpty = (value) => {
  if (value === undefined || value === null) return true;
  return false;
};

// setObject({}, 'a.b.c') => {a: {b: {c: {}}}}
export const setObject = (object, attributes, value) => {
  if (typeof attributes !== 'string') return object;
  const list = attributes.split('.');

  const length = list?.length;
  if (!length) return object;

  list.reduce((pre, key, index) => {
    const latest = index === length - 1;

    // 最后一个直接返回
    if (latest) {
      pre[key] = value;
      return object;
    };

    const has = pre[key];

    // 当前位置为可控
    if (has === undefined || has === null) {
      // 可以是数组
      pre[key] = {};
      return pre[key];
    };


  }, object);

  return object;
};