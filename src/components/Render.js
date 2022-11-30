const elementStore = {};
/**
 * 真正执行渲染的渲染器
*/
class Render {
  target = null;
  dynamicProps = ['show'];
  renderedAttributes = [];
  sort = Object.create(null);

  constructor(target, dynamicProps = []) {
    this.target = target;
    this.initDynamicProps(dynamicProps);
  };

  initDynamicProps = (dynamicProps) => {
    dynamicProps.forEach((key, i) => {
      if (!this.dynamicProps.includes(key)) {
        this.dynamicProps.push(key);
      };

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

    if (dispose) {
      this.clearElement();
      this.clearState();
      return false;
    };

    return true;
  };

  /**
   * 查询元素拔插
  */
  show = () => {
    const { show } = this.props;

    if (show === false) {
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

  // 恢复templateElement
  resumeTemplate = () => {
    const { element, parent } = this;
    const parentElement = parent.element;

    const templateElement = this.templateElement || document.createComment('');

    if (!parentElement) return true;

    // 初始化不展示
    if (!templateElement.parentElement && !element.parentElement && parentElement) {
      parentElement.appendChild(templateElement);
      if (!this.templateElement) this.templateElement = templateElement;
      return true;
    };

    // Template 插入 Element 位置
    if (element.parentElement && !templateElement.parentElement) {
      element.parentElement.insertBefore(templateElement, element);
      element.remove();
      return true;
    };
    return true;
  };

  // 恢复 element
  resumeElement = () => {
    const { parent } = this;

    // 没有父元素直接return
    if (!parent) return true;
    if (this.element.parentElement) return true;

    // 从注释位置插入
    if (this.templateElement?.parentElement) {
      this.templateElement.parentElement.insertBefore(this.element, this.templateElement);
      this.templateElement.remove();
      return true
    };

    parent.element.appendChild(this.element);
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

    if (_value !== undefined && _value !== null && _value !== '') {
      const currentValue = element.getAttribute(key);
      const value = String(_value);
      if (currentValue !== value) {
        element.setAttribute(key, value);
      };
    } else {
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