import V from "./Element.js";
import { asyncForEach } from './RenderTask.js';

export const special = function(key, ...arg) {
  this.setAttribute(key, ...arg);
  return this;
};

// 通过构造函数创建基本属性
export const setProps = ({ args, Type }) => {
  const _arguments = args;
  const length = _arguments.length;
  if (length === 3) {
    const [fromState, key, computed] = _arguments;
    return new Type(fromState, key, computed);
  };

  if (length === 2) {
    const [fromState, key] = _arguments;
    return new Type(fromState, key);
  };

  if (length === 1) {
    const [src] = _arguments;
    return new Type(src);
  };

  return new Type();
};

export class Div extends V {
  type = 'div';
  constructor(...children) {
    super();
    if (children[0]?.type) this.children(children);
  };

  value = special.bind(this, 'value');
};

export class List extends V {
  itemRender = null;
  type = 'ul';
  renderCount = Infinity;

  constructor(itemRender, ...arg) {
    super();
    this.itemRender = itemRender;
    this.list(...arg);
    this.render.list = this.updateList;
  };

  list = (...arg) => {
    return special.call(this, 'list', ...arg);
  };

  updateList = () => {
    const { children, list } = this.props;
    // 正常更新
    if (list.length) {
      // list没有在视觉中
      if (!this.element.parentNode) return;
      // 触发更新
      Rope.detective.dispatch(this, {
        props: {
          list: true
        }
      });

      if (this.templateElement?.parentNode) {
        this.templateElement.parentNode.insertBefore(this.element, this.templateElement);
        this.templateElement.remove();
      };

      // 需要新增children
      if (list.length > children.length) {
        const startIndex = children.length;
        const _list = list.slice(startIndex);
        this.addListChildren(_list, startIndex);
      };
      return;
    };

    // 快速清空列表
    if (this.parent) {
      const templateElement = this.templateElement || document.createComment('');
      this.templateElement = templateElement;

      this.parent.element.insertBefore(templateElement, this.element);
      this.element.remove();
    };
  };

  addListChildren = (list, startIndex) => {
    const { itemRender } = this;
    if (this.renderCount === Infinity) {
      const children = list.map((item, i) => {
        const index = i + startIndex;
        const child = itemRender(item, index).show(this, 'props.list', (array = []) => {
          return index < array.length;
        });
        child.parent = this;
        this.props.children.push(child);
        return child.element;
      });

      const parentNode = this.element.parentNode || this.templateElement.parentNode;
      const targetEl = this.element.parentNode ? this.element : this.templateElement;
      const cloneElement = this.element.cloneNode();
      cloneElement.append(...children);
      parentNode.insertBefore(cloneElement, targetEl);
      this.element.remove();
      this.element = cloneElement;
      return;
    };

    // TODO: 长列表优化
    // if (this.asyncForEach) this.asyncForEach.stop();
    // this.asyncForEach = asyncForEach(list, (item, i) => {
    //   const index = i + startIndex;
    //   return itemRender(item, index).show(this, 'props.list', (array) => array[index] !== undefined);
    // }, Rope.renderTask.runner, this.renderCount);
  };

  // 单次渲染数量
  setRenderCount = (number) => {
    this.renderCount = number;
    return this;
  };

};

export class Input extends V {
  type = 'input';
  constructor(...value) {
    super();
    this.value(...value);
  };
  value = special.bind(this, 'value');
};

export class Text extends V {
  type = 'span';
  constructor(...value) {
    super();
    this.value(...value);
  };
  value = special.bind(this, 'value');
};

export class Img extends V {
  type = 'img';
  constructor(...src) {
    super();
    this.src(...src);
  };
  src = special.bind(this, 'src');
};

export class Link extends V {
  type = 'a';
  constructor(...href) {
    super();
    this.href(...href);
  };
  href = special.bind(this, 'href');
  value = special.bind(this, 'value');
};

export const div = (...arg) => {
  if (arg instanceof Array && !(arg[1] instanceof Array)) {
    return new Div(...arg);
  };

  return new Div(arg[0]);
};

export const text =  (...arg) => {
  return setProps({
    args: [...arg],
    Type: Text
  });
};

export const input = (...arg) => {
  return setProps({
    args: [...arg],
    Type: Input
  });
};

export const img = (...arg) => {
  return setProps({
    args: [...arg],
    Type: Img
  });
};

export const link = (...arg) => {
  return setProps({
    args: [...arg],
    Type: Link
  });
};

export const list = (...arg) => {
  return setProps({
    args: [...arg],
    Type: List
  });
};

export const element = (type, ...arg) => {
  class AutoElement extends V {
    type = type;
    constructor(...value) {
      super();
      this.value(...value);
    };
    value = special.bind(this, 'value');
  };
  return setProps({
    args: [ ...arg ],
    Type: AutoElement
  })
};

export const VElement = V;
export { default as hooks } from './hooks.js';