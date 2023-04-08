import { isEmpty } from "../utils/index.js";

export const getAttributesString = (attributes = {}, index) => {
  return Object.keys(attributes).reduce((pre, key) => {
    pre += (' ' + attributes[key]());
    return pre;
  }, isEmpty(index) ? '' : `tree-id='${index}'`);
};

export const getTagString = (tag, allAttributesValue) => {
  const { start, end } = tag;
  return `${start}${isEmpty(allAttributesValue) ? '' : ` ${allAttributesValue}`}${end}`;
};

export const getValue = (target, index) => {
  const { attributes, children } = target;
  const attributesValue = getAttributesString(attributes, index);
  const startTagString = getTagString(target.startTag, `${attributesValue}`);
  const endTagString = getTagString(target.endTag);

  return `${startTagString}${children(index, target)}${endTagString}`;
};

// 获取一个渲染对象
export const _value = (children, parentIndex, parent = null) => {
  const childrenOrValue = children instanceof Array ? children : [children];

  const getNodeValue = (_childrenOrValue, index) => {
    if (isEmpty(_childrenOrValue)) return undefined;
    // return TextNode
    if (typeof _childrenOrValue === 'string') return _childrenOrValue;
    // return closeTagNode
    if (typeof _childrenOrValue === 'object') {
      const { target } = _childrenOrValue;
      const treeId = isEmpty(parentIndex) ? `${index}` : `${parentIndex}-${index}`;
      target.treeId = treeId;
      target.parent = parent;
      return getValue(target, treeId);
    };

    return undefined;
  };

  return childrenOrValue.reduce((pre, cur, i) => {
    const value = getNodeValue(cur, i);
    pre += isEmpty(value) ? '' : value;
    return pre;
  }, '');

};

export const render = (root, element) => {
  // const hook = tap('render')
  //   .next('init', ({ data, next }) => {
  //     next(data);
  //   })
  //   .next('willMount', ({ data, next }) => {
  //     const value = _value(data);
  //     next({ value, element });
  //   })
  //   .next('mounted', ({ data, next }) => {
  //     const { value, element } = data;
  //     root.innerHTML = value;
  //     next(element);
  //   });
  
  // hook.start(element);
  // if (intercept) hook.intercept(intercept);
  // return hook;
  root.innerHTML = _value(element)
};