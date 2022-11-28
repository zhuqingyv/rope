import RenderTask from './components/RenderTask.js';
import Detective from './components/Detective.js';
import * as DOM from './components/index.js';

// 渲染管线
const renderTask = new RenderTask();

// 状态机管理
const detective = new Detective();

/**
 * @param { Element } root 根元素HTMLElement
 * @param { Hook } app 跟组件
 * @param { number } maxRenderCount 最大渲染数量
*/
class Rope {
  static renderTask = renderTask;
  static detective = detective;
  static Element = Object.create(null);

  constructor(maxRenderCount) {
    Rope.renderTask.setMaxRenderCount(maxRenderCount);
  };

};

Object.assign(Rope.Element, DOM);
(globalThis || window || GLOBAL).Rope = Rope;

export default Rope;