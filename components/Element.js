const elementStore = {};

class VElement {
  static EVENT = {
    onClick: 'onclick',
    onInput: 'oninput',
    onChange: 'onchange'
  };

  static setAttribute = function (attributeName, ...arg) {
    const _arguments = [...arg];
    const argsLength = _arguments.length;
    if (argsLength === 1 && _arguments[0] !== undefined) {
      this.props[attributeName] = _arguments[0];
    };

    if (argsLength >= 2) {
      this.bind(..._arguments, this.props, attributeName, _arguments[2]);
    };
  };

  tempElement = document.createElement('template');

  updateTask = null;

  _htmlElement = null;

  type = null;

  props = {
    children: [],
    style: {}
  };

  events = {};

  constructor(type) {
    this.type = type;
    this._htmlElement = document.createElement(this.type);
  };

  children = (...arg) => {
    const children = [].concat(...[...arg]);
    if (children?.length) {
      children.forEach((child) => {
        child.parent = this;
        this.props.children.push(child);
        child.render(this.element);
      });
    };
    return this;
  };

  render = (parentElement) => {
    if (parentElement) {
      parentElement.appendChild(this.element);
      this.update();
    }
  };

  className = (...arg) => {
    this.setAttribute('className', ...arg);
    this.update();
    return this;
  };

  id = (...arg) => {
    this.setAttribute('id', ...arg);
    this.update();

    return this;
  };

  style = (...arg) => {
    this.setAttribute('style', ...arg);
    this.update();
    return this;
  };

  key = (...arg) => {
    this.setAttribute('key', ...arg);
    this.update();
    return this;
  };

  // if render the dom
  show = (...arg) => {
    this.setAttribute('show', ...arg);
    this.update();
    return this;
  };

  setAttribute = VElement.setAttribute.bind(this);

  // 绑定数值
  bind = (...arg) => {
    const _arguments = [...arg]

    const toSet = (state, key, target, getKey, callback) => {
      Object.defineProperty(target, getKey, {
        get() {
          const value = state[key];
          if (callback instanceof Function) {
            return callback(value)
          };
          return value;
        }
      });
    };

    if (_arguments.length === 5) {
      const [state, key, target, getKey, callback] = _arguments;
      toSet(state, key, target, getKey, callback);
    };

    if (_arguments.length === 6) {
      const [state, key, computed, target, getKey, callback] = _arguments;
      toSet(state, key, target, getKey, callback);
    };
  };

  onClick = (callback) => {
    this.element[VElement.EVENT.onClick] = callback;
    return this;
  };

  onInput = (callback) => {
    this.element[VElement.EVENT.onInput] = callback;
    return this;
  };

  onChange = (callback) => {
    this.element[VElement.EVENT.onChange] = callback;
    return this;
  };

  update = () => {
    if (this.updateTask) return this.updateTask;
    this.updateTask = Promise.resolve().then(() => {
      this.__update();
      this.updateTask = null;
    });
    return this.updateTask;
  };

  __update = () => {
    const { children } = this.props;
    const go = this.updateCommon();
    if (!go) return;
    switch (this.type) {
      case 'input': {
        const { value } = this.props;
        const _value = String(value);
        if (this.element.value !== _value) this.element.value = _value;
        break;
      }
      case 'span': {
        const { value } = this.props;
        const _value = String(value);
        if (this.element.innerText !== _value) this.element.innerText = _value;
        break;
      }
    };

    children.forEach((child) => child.update());
  };

  updateCommon = () => {
    const { element } = this;
    const { show, className, id, key, style = {} } = this.props;
    if (show === false) {
      return this.destroy();
    };

    this.resume();
    this.memo();

    if (element.getAttribute('class') !== className) element.setAttribute('class', className);
    if (element.getAttribute('id') !== id)element.setAttribute('id', id);
    Object.entries(style).forEach((s) => {
      const [key, value] = s;
      const currentStyle = element.style[key];
      if (currentStyle !== value) element.style[key] = value;
    });

    return true;
  };

  resume = () => {
    if (!this.element.parentElement) {
      this.tempElement.parentElement.insertBefore(this.element);
      this.tempElement.remove();
    };
  };

  memo = () => {
    const { key } = this.props;
    if (key != undefined && !elementStore[key]) {
      elementStore[key] = this.element;
    };
  };

  createElement = () => {
    return document.createElement(this.type);
  };

  destroy = () => {
    const { element } = this;
    if (element.parentElement) {
      this.element.parentElement.insertBefore(this.tempElement, this.element);
      element.remove();
    };
    return false;
  };

  dom = (callback = () => null) => {
    callback(this.element, !!this.element.parentElement)
    return this;
  };

  get element() {
    return this._htmlElement;
  };

  set element(value) {
    if (!this._htmlElement) this._htmlElement = value;
  };

};

export default VElement;