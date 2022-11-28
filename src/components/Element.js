import Render from './Render.js';

class VElement {
  static EVENT = {
    onClick: 'onclick',
    onInput: 'oninput',
    onChange: 'onchange'
  };

  static getPropsSafe = (props, key, defaultValue) => {
    try {
      const prop = key.split('.').reduce((current, propsKey) => {
        return current[propsKey];
      }, props);

      if (prop === undefined) {
        if (prop === defaultValue) {
          return prop;
        }
        return defaultValue;
      }

      return prop;
    } catch {
      return defaultValue;
    }
  }

  // original event
  static setAttribute = function (attributeName, ...arg) {
    const _arguments = [...arg];
    const argsLength = _arguments.length;
    if (argsLength === 1 && _arguments[0] !== undefined) {
      const prop = _arguments[0];
      this.props[attributeName] = _arguments[0]
    };

    if (argsLength >= 2) {
      this.bind(..._arguments, this.props, attributeName, _arguments[2]);
    };
  };

  // memo HTMLElement
  _el = null;
  _templateElement = null;

  _parent = null;

  // 渲染器
  _render = null;

  // memo event
  mountedCallback = null;
  updatedCallback = null;

  // <template>
  tempElement = null;

  updateTask = null;

  type = null;

  props = {
    children: [],
    style: {}
  };

  events = {};

  // dynamicProps = ['dispose', 'show', 'className', 'id', 'style', 'key'];
  dynamicProps = [];

  children = (children) => {
    if (children?.length) {
      children.forEach((child) => {
        if (child && (child instanceof VElement || child.vm)) {
          child.parent = this;
          this.props.children.push(child);
          child.update();
        };
      });
    };

    return this;
  };

  className = (...arg) => {
    this.setAttribute('className', ...arg);
    return this;
  };

  class = this.className;

  // 清理掉 Element
  dispose = (...arg) => {
    this.setAttribute('dispose', ...arg);
    return this;
  };

  id = (...arg) => {
    this.setAttribute('id', ...arg);
    return this;
  };

  style = (...arg) => {
    this.setAttribute('style', ...arg);
    return this;
  };

  key = (...arg) => {
    this.setAttribute('key', ...arg);
    return this;
  };

  // if render the dom
  show = (...arg) => {
    this.setAttribute('show', ...arg);
    return this;
  };

  setAttribute = VElement.setAttribute.bind(this);

  // 绑定数值
  bind = (...arg) => {
    const _arguments = [...arg];

    const toSet = (state, key, target, getKey, callback) => {
      /**
       * 注册状态机
       * 
       * @param { object } state 待绑定的属性
       * @param { string } getKey 待绑定的属性的key
      */
      Rope.detective.registe(state, key, getKey, this);


      Object.defineProperty(target, getKey, {
        get() {
          const value = VElement.getPropsSafe(state, key);
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

  onMounted = (callback) => {
    this.mountedCallback = callback;
    return this;
  };

  onUpdated = (callback) => {
    this.updatedCallback = callback;
    return this;
  };

  onEvent = (eventName, callback) => {
    if (!eventName || !callback) return this;
    this.element[eventName] = callback;
    return this;
  };

  /**
   * 请求更新
   * 
   * @param { object } updateObject 更新的props属性
   * @param { Function } callback 更新后回调
  */
  update = (updateObject, callback) => {
    if (this.renderTask) return this.renderTask;

    this.renderTask = new Promise((resolve) => {
      Rope.renderTask.add(this.render.render, this, updateObject, () => {
        this.renderTask = null;
        if (callback instanceof Function) callback();
        if (this.updatedCallback instanceof Function) this.updatedCallback(this);
        resolve();
      });
    })
  };

  dom = (callback = () => null) => {
    callback(this.element, !!this.element.parentElement)
    return this;
  };

  setElement = (element) => {
    if (element instanceof HTMLElement) this.element = element;
    return this;
  };

  get templateElement() {
    if (!this._templateElement) this._templateElement = document.createComment(this.type);
    return this._templateElement;
  };

  set templateElement(value) {
    this._templateElement = value;
  };

  get element() {
    if (!this._el) this._el = document.createElement(this.type);
    return this._el;
  };

  set element(value) {
    return this._el = value;
  };

  get parent() {
    return this._parent;
  };

  set parent(value) {
    this._parent = value;

  };

  get render() {
    if (!this._render) this._render = new Render(this, this.dynamicProps);
    return this._render;
  };

};

export default VElement;