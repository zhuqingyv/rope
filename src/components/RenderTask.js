/**
 * 渲染调度中心
 * 
*/

import EventHub from './Event.js';

// 异步执行
export const asyncForEach = (list, task, runner, maxCount = 10) => {
  let shouldStop = false;
  const promise = new Promise((resolve, reject) => {
    let index = 0;
    const loop = (all) => {
      try {
        if (shouldStop) return resolve();
        if (!all?.length) return resolve();
        const currentLoopTask = all.slice(0, maxCount);
        currentLoopTask.forEach((item, i) => {
          task(item, i + index);
        });
        index += currentLoopTask.length;
        runner(() => loop(all.slice(maxCount)));
      } catch (error) {
        reject(error);
      };
    };
    loop(list);
  });

  promise.stop = () => {
    shouldStop = true;
    return promise;
  };

  return promise;
};

class RenderTask {
  isRunning = false;
  // event = new EventHub();

  _renderMaxCount = Infinity;
  _currentLoopCount = Infinity;

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
    if (this.isRunning) {
      if (!this.child) {
        this.child = new RenderTask(this.renderMaxCount);
        this.child.parent = this;
      };
      this.child.add(task, context, updateObject, callback);
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
    if (this.currentLoopCount > 0) {
      const { taskMap } = this;
      const list = Array.from(taskMap);
      this.currentLoopCount -= taskMap.size;
      this.runTaskList(list);
      if (this.currentLoopCount !== Infinity) {
        this.resetTimer = setTimeout(() => {
          this.currentLoopCount = this.renderMaxCount;
        });
      };
    } else {
      if (!this.promise) this.runTaskCount();
      this.promise = true;
    };
  };

  // 切片执行任务
  runTaskCount = () => {
    const allTaskList = Array.from(this.taskMap);
    // const size = allTaskList.length;

    // 清理任务额度
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    };

    this.isRunning = true;
    const loop = (all) => {
      const { renderMaxCount } = this;
      const willRunTask = all.slice(0, renderMaxCount);
      this.runTaskList(willRunTask).then(() => {
        if (renderMaxCount < all.length) {
          const restList = all.slice(renderMaxCount);
          // this.event.emit('onTaskUpdate', all.length, restList.length);
          this.runner(() => loop(restList));
        } else {
          // this.event.emit('onTaskUpdate', all.length, 0);
          // this.event.emit('onTaskFinished', size);
          this.isRunning = false;
          this.promise = null;
          // this.clear();
          this.currentLoopCount = this.renderMaxCount;
        };
      });
    };
    this.taskMap.clear();
    loop(allTaskList);
  };

  // run all task
  runTaskList = (list = []) => {
    const time = Date.now();
    return new Promise((resolve, reject) => {
      try {
        const length = list.length;
        // 倒序 先入后出
        for (let i = 0; i < length; i ++) {
          const taskEntry = list[i];
          const [key, _task] = taskEntry;
          const { callback, updateObject, task } = _task;
          task(updateObject);
          if (callback instanceof Function) callback();
          // this.taskMap.delete(key);
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
    // this.event.on('onTaskFinished', callback);
  };

  onTaskUpdate = (callback) => {
    if (!callback instanceof Function) return;
    // this.event.on('onTaskUpdate', callback);
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
    this._currentLoopCount = value;
    this._renderMaxCount = value;
  };

  get currentLoopCount() {
    return this._currentLoopCount;
  };
  set currentLoopCount(value) {
    this._currentLoopCount = value;
  };

  get runner() {
    // 空闲时间执行
    if (window.requestIdleCallback) {
      return (callback) => {
        requestIdleCallback(() => callback(), { timeout: 6 });
      };
    };

    // 双重微任务
    if (window.queueMicrotask) {
      return (callback) => {
        queueMicrotask(() => {
          queueMicrotask(() => callback());
        });
      };
    };

    // 帧执行
    if (window.requestAnimationFrame) {
      return (callback) => {
        return requestAnimationFrame(() => callback());
      };
    };

    // 异步执行
    if (window.setTimeout) {
      return (callback) => {
        return setTimeout(() => callback());
      };
    };
  };
};

export default RenderTask;