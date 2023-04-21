import { _null, isEmpty } from '../utils/index.js';
import { SPECIAL_ATTRIBUTE } from '../static.js';
import { workFlow } from './workflow/index.js';
import bindEvent from './bindEvent.js';
import { _value } from './render.js';

// <tag > | <tag 
export const buildStartTag = (type, closed) => {
  const start = `<${type}`;

  if (closed) {
    return {
      start,
      end: '>'
    }
  };

  return {
    start,
    end: ''
  };
};

// /> | </tag>
export const buildEndTag = (type, closed) => {
  if (closed) {
    return {
      start: `</${type}>`,
      end: ''
    }
  };

  return {
    start: `/>`,
    end: ''
  }
};

// 一些特殊属性
export const buildSpecialAttribute = ({attribute, proxy, target}) => {
  if (!SPECIAL_ATTRIBUTE[attribute]) return false;

  if (SPECIAL_ATTRIBUTE[attribute]) {
    // 这里返回一个函数用于执行
    return (...arg) => {
      target.specialAttributes[attribute] = SPECIAL_ATTRIBUTE[attribute](attribute, proxy, target, ...arg);

      // 创建完属性以后，一定要返回proxy用以链式调用
      return proxy;
    };
  };
  return false;
};

// 普通属性
export const buildDefaultAttribute = ({attribute, proxy, target}) => {
  return (_value) => {
    const setProps = () => `${attribute}='${_value}'`;
    target.attributes[attribute] = setProps;
    return proxy;
  };
};

export const buildBaseElement = (elementType) => {
  return (...childrenOrValue) => {
    const target = {
      type: elementType,

      startTag: null,
      endTag: null,

      attributes: undefined,
      specialAttributes: undefined,

      // 绑定事件
      events: undefined,

      parent: null,

      // 获取子元素结果
      children: (index, parent) => {
        return _value(childrenOrValue, index, parent)
      },

      // 获取子节点实例
      nodeList: () => childrenOrValue.map((child) => {
        return child?.target || child;
      }),

      element: () => document.querySelector(`[tree-id='${target.treeId}']`)
    };

    const isClose = isEmpty(target.value);
    target.startTag = buildStartTag(elementType, isClose);
    target.endTag = buildEndTag(elementType, isClose);

    const proxy = new Proxy(target, {
      get: (_, attribute) => {
        // 这里可以直接获取到target
        if (attribute === 'target') return target;

        // 事件绑定
        if (attribute.startsWith('on') && attribute?.length > 2) {
          if (isEmpty(target.events)) target.events = _null();
          return bindEvent({ target, proxy, eventName: attribute });
        };

        // 处理特殊属性
        const isSpecial = buildSpecialAttribute({ attribute, proxy, target });
        if (isSpecial) {
          if (!target.specialAttributes) target.specialAttributes = _null();
          return isSpecial;
        };
        
        // 处理常规属性
        const attributeValue = buildDefaultAttribute({ attribute, proxy, target });
        if (!target.attributes) target.attributes = _null();
        return attributeValue;
      }
    });

    return proxy;
  };
};