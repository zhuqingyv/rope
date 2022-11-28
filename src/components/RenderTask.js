/**
 * 渲染调度中心
 * 
*/

import EventHub from './Event.js';

class RenderTask {
  isRunning = false;
  event = new EventHub();

  _renderMaxCount = Infinity;

  promise = null;

  taskMap = new Map();

  child = null;

  constructor(maxCount, taskMap) {
    this.setMaxRenderCount(maxCount);
    if (taskMap instanceof Map) {
      this.taskMap = taskMap;
    } else if (taskMap instanceof Array) {
      this.taskMap = new Map(taskMap);
    };
  };

  add = (task, context, updateObject, callback) => {
    console.log(context.type);
    if (this.isRunning) {
      if (!this.child) {
        this.child = new RenderTask(this.renderMaxCount);
        this.child.parent = this;
      };
      this.child.add(task, context, updateObject, (...arg) => {
        callback(...arg);
      });
      return;
    } else {
      const contextTask = this.taskMap.get(context);
      // filter repeat task
      if (contextTask) {
        this.mergeContextTask(contextTask, updateObject);
      } else {
        this.setContextTask({ context, callback, task, updateObject });
      }
      this.start();
    };
  };

  mergeContextTask = (contextTask, updateObject) => {
    updateObject && contextTask.updateObject !== updateObject && contextTask.updateObject && Object.assign(contextTask.updateObject, updateObject);
  };

  setContextTask = ({ context, callback, task, updateObject }) => {
    if (callback) {
      // rigest task
      this.taskMap.set(context, {
        callback,
        task,
        updateObject
      });
    } else {
      this.taskMap.set(context, task);
    };
  };

  start = () => {
    // filter repeat task runner
    if (this.promise) return;

    // merge commit
    queueMicrotask(() => {
      this.isRunning = true;
      const { renderMaxCount } = this;
      if (renderMaxCount === Infinity) {
        const { taskMap } = this;
        const list = [...taskMap];
        this.runTaskList(list.reverse()).then((length) => {
          this.isRunning = false;
          this.event.emit('onTaskFinished', length);
        }).catch(() => (this.isRunning = false))
        this.promise = null;
        this.clear();
      } else {
        this.runTaskCount();
      };
    });

    this.promise = true;
  };

  runTaskCount = () => {
    const allTaskList = Array.from(this.taskMap);
    const size = allTaskList.length;

    if (!this.taskMap.size) return;

    const loop = (all) => {
      const { renderMaxCount } = this;
      const willRunTask = all.slice(0, renderMaxCount).reverse();
      this.runTaskList(willRunTask).then(() => {
        if (renderMaxCount < all.length) {
          const restList = all.slice(renderMaxCount);
          this.event.emit('onTaskUpdate', all.length, restList.length);
          queueMicrotask(() => loop(restList));
        } else {
          this.event.emit('onTaskUpdate', all.length, 0);
          this.event.emit('onTaskFinished', size);
          this.isRunning = false;
          this.promise = null;
          this.clear();
        };
      });
    };
    loop(allTaskList);
  };

  // run all task
  runTaskList = (list = []) => {
    const time = Date.now();
    return new Promise((resolve, reject) => {
      try {
        const length = list.length;
        // 倒序 先入后出
        for (let i = length - 1; i >= 0; i --) {
          const taskEntry = list[i];
          const [, _task] = taskEntry;
          if (_task instanceof Function) {
            _task();
          } else {
            const { callback, updateObject, task } = _task;
            task(updateObject);
            if (callback instanceof Function) callback();
          };
        };
        resolve([length, Date.now() - time]);
    } catch (error) {
        return reject(error);
      };
    });
  };

  setMaxRenderCount = (count) => {
    if (!count) return;
    const numberCount = Number(count);
    if (!isNaN(numberCount)) this.renderMaxCount = numberCount;
  };

  /**
   * Event
  */
  onTaskFinished = (callback) => {
    if (!callback instanceof Function) return;
    this.event.on('onTaskFinished', callback);
  };

  onTaskUpdate = (callback) => {
    if (!callback instanceof Function) return;
    this.event.on('onTaskUpdate', callback);
  };

  destroy = () => {
    if (this.parent) this.parent.child = null;
    this.parent = null;
  };

  clear = () => {
    this.taskMap.clear();
    this.destroy();
  };

  get renderMaxCount() {
    if (this.parent) return this.parent.renderMaxCount;
    return this._renderMaxCount;
  };
  set renderMaxCount(value) {
    if (this.parent) return this.parent.renderMaxCount = value;
    this._renderMaxCount = value;
  };
};

export default RenderTask;