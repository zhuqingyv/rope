const elementStore = {};

/**
 * 真正执行渲染的渲染器
*/
class Render {
  target = null;
  dynamicProps = ['dispose', 'show', 'key', 'className', 'id', 'style'];
  renderedAttributes = [];
  sort = Object.create(null);

  constructor(target, dynamicProps = []) {
    this.target = target;
    this.dynamicProps.push(...dynamicProps);
    this.initRenderSort();
  };

  initRenderSort = () => {
    this.dynamicProps.forEach((key, i) => {
      this.sort[key] = i;
    });
  };

  render = (renderObject) => {
    // if render all
    const renderTaskObject = renderObject ? this.objectToList(renderObject) : this.dynamicProps;
    this.__render(renderTaskObject);
    if (this.renderedAttributes?.length) {
      this.__render(this.renderedAttributes);
      this.renderedAttributes = [];
    }
  };

  objectToList = (renderObject) => {
    const list = [];

    Object.keys(renderObject).forEach((key) => {
      const index = this.sort[key];
      list[index] = key;
    });
    return list;
  };

  // run
  __render = (renderList) => {
    if (renderList?.length) {
      let index = null;
      const paused = renderList.find((propKey, i) => {
        const renderHandle = this[propKey];
        if (renderHandle) {
          const goOn = renderHandle();
          if (goOn === false) {
            index = i;
            return true;
          };
        };
        return false;
      });

      if (paused) {
        this.renderedAttributes = renderList.slice(index + 1);
      };
    };
  };

  /**
   * 查询清理
  */
  dispose = () => {
    const { dispose } = this.props;
    const run = dispose || this.parent?.props.dispose;
    if (run) {
      this.clearElement();
      this.clearState();
      return false;
    };

    return this.buildElement();
  };

  /**
   * 查询元素拔插
  */
  show = () => {
    const { show } = this.props;
    const run = show === false;
    if (run) {
      this.resumeTemplate();
      return false;
    };
    this.resumeElement();
    return true;
  };

  /**
   * 存储或者取数据
  */
  key = () => {
    const { key } = this.props;
    const { element } = this;
    if (element && key !== undefined && key != null) elementStore[key] = element;
    return true;
  };

  className = () => {
    const { className } = this.props;
    this.setStringAttribute('class', className);
    return true;
  };

  id = () => {
    const { id } = this.props;
    this.setStringAttribute('id', id);
    return true;
  };

  style = () => {
    const { element } = this;
    const { style } = this.props;
    Object.entries(style).forEach((s) => {
      const [key, value] = s;
      const currentStyle = element.style[key];
      if (currentStyle !== value) element.style[key] = value;
    });
    return true;
  };

  src = () => {
    const { src } = this.props;
    this.setStringAttribute('src', src);
    return true;
  };

  href = () => {
    const { href } = this.props;
    this.setStringAttribute('href', href);
    return true;
  };

  value = () => {
    const { value } = this.props;
    if (value === undefined || value === null) return true;
  
    const _value = String(value);
    const key = this.type === 'input' ? 'value' : 'innerHTML';
    const currentValue = this.element[key];
    currentValue !== _value && (this.element[key] = _value);

    return true;
  };

  buildElement = () => {
    if (!this.element) this.element = document.createElement(this.type);
    if (!this.tempElement) this.tempElement = document.createElement('template');
    return true;
  };

  // 恢复templateElement
  resumeTemplate = () => {
    const { templateElement, element, parent } = this;
    const parentElement = parent.element;

    if (!parentElement) return;

    // 初始化不展示
    if (!templateElement.parentElement && !element.parentElement && parentElement) {
      parent.element.appendChild(templateElement);
    };

    // Template 插入 Element 位置
    if (element.parentElement && !templateElement.parentElement) {
      element.parentElement.insertBefore(templateElement, element);
      element.remove();
    };
    return true;
  };

  // 恢复 element
  resumeElement = () => {
    const { templateElement, element, parent } = this;
    // 初始化不展示
    if (parent && !templateElement.parentElement && !element.parentElement) {
      parent.element.appendChild(element);
      if (this.mountedCallback instanceof Function) this.mountedCallback(this.target);
      return true;
    };

    // Element 插入 Template 位置
    if (templateElement.parentElement && !element.parentElement) {
      templateElement.parentElement.insertBefore(element, templateElement);
      templateElement.remove();
      if (this.mountedCallback instanceof Function) this.mountedCallback(this.target);
      return true;
    };

    if (!element.parentElement && parent?.element) {
      parent.element.appendChild(element);
      if (this.mountedCallback instanceof Function) this.mountedCallback(this.target);
    };

    return true;
  };

  // 卸载所有 dom
  removeAllElement = () => {
    const { element, templateElement } = this;
    if (element) element.remove();
    if (templateElement) templateElement.remove();
    return true;
  };

  // 卸载 & 清理
  clearAllElement = () => {
    this.removeElement();
    this.element = null;
    this.templateElement = null;
    return true;
  };

  // 清理渲染元素
  clearElement = () => {
    this.resumeTemplate();
    this.element = null;
    return true;
  };

  clearState = () => {
    this.hook.clearState();
  };

  /**
   * @param { string } key 属性名
   * @param { string } _value 属性值
  */
  setStringAttribute = (key, _value) => {
    const { element } = this;
    if (!element || key == undefined || typeof key !== 'string') return;

    const currentValue = element.getAttribute(key);

    if (_value !== undefined && _value !== null && _value !== '') {
      const value = String(_value);
      if (currentValue !== value) {
        element.setAttribute(key, value);
      };
    } else if (currentValue) {
      element.removeAttribute(key);
    };
  };

  get element() {
    return this.target.element;
  };

  set element(value) {
    this.target.element = value;
  };

  get templateElement() {
    return this.target.templateElement;
  };

  set templateElement(value) {
    this.target.templateElement = value;
  };

  get hook() {
    return this.target.hook;
  };

  get props() {
    return this.target.props;
  };

  get parent() {
    return this.target.parent;
  };

  get type() {
    return this.target.type;
  };

  get mountedCallback() {
    return this.target.mountedCallback;
  };

};

export default Render;