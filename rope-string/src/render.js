import { isEmpty, _null } from "../utils/index.js";
import { workFlow } from './workflow/index.js';
import { DynamicsData } from "./signal/index.js";

export const getEventsString = ({ events = _null(), index }) => {
  const eventsList = Object.keys(events);

  if (!eventsList?.length) return '';

  const allEvents = eventsList.map((name) => {
    const eventName = name.slice(2);
    return eventName
  }, '').join(' ')

  return `rope-events='${allEvents}'`;
};

export const getAttributesString = ({ eventsString, attributes = {}, index }) => {
  const idString = isEmpty(index) ? '' : `tree-id='${index}'`;
  return Object.keys(attributes).reduce((pre, key) => {
    pre += (' ' + attributes[key]());
    return pre;
  }, `${idString}${eventsString}`);
};

export const getTagString = ({ tag, attributeValue, events }) => {
  const { start, end } = tag;
  return `${start}${isEmpty(attributeValue) ? '' : ` ${attributeValue}`}${end}`;
};

export const getValue = (target, index) => {
  const { attributes, children, events } = target;
  const eventsString = getEventsString({ events, id: index });
  const attributesValue = getAttributesString({ eventsString, attributes, index });
  const startTagString = getTagString({ tag: target.startTag, attributeValue: `${attributesValue}` });
  const endTagString = getTagString({ tag: target.endTag });

  return `${startTagString}${children(index, target)}${endTagString}`;
};

// 获取一个渲染对象
export const _value = (children, parentIndex, parent = null) => {
  const childrenOrValue = children instanceof Array ? children : [children];

  const getNodeValue = (_childrenOrValue, index) => {
    if (isEmpty(_childrenOrValue)) return undefined;
    if (DynamicsData.isDynamics(_childrenOrValue)) {
      // TODO: 处理动态数据
      const setChildren = (value) => {
        const childNode = parent.element().childNodes[index];
        // 文字类型直接修改
        if (childNode instanceof Text && typeof value === 'string') {
          childNode.nodeValue = value;
        }

        debugger;
      };
      const __value = _childrenOrValue({ target: parent, computedHandle: setChildren });
      return getNodeValue(__value);
    };
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
  root.innerHTML = _value(element);
  // const renderHook = workFlow('render');

  // renderHook.tap('init', () => {

  // });

  // hook.run('init', () => {

  // });
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
};