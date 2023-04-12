var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
class TaskRunner {
  constructor(name, flow) {
    __publicField(this, "name", null);
    __publicField(this, "flow", null);
    __publicField(this, "next", null);
    __publicField(this, "pre", null);
    __publicField(this, "taskList", /* @__PURE__ */ new Map());
    __publicField(this, "first", null);
    __publicField(this, "current", null);
    __publicField(this, "dispatch");
    __publicField(this, "run", (taskName, _task) => {
      const task = { taskName, _task, name: taskName };
      this.taskList.set(taskName, task);
      if (this.first === null)
        this.first = task;
      if (this.current === null)
        this.current = task;
      if (this.current !== task) {
        this.current.next = task;
        task.pre = this.current;
        this.current = task;
      }
      return this;
    });
    __publicField(this, "start", (data, finished) => {
      const { first } = this;
      if (first)
        return this.runTask(first, data, finished);
      if (this.next)
        return this.next.start(data, finished);
      finished();
    });
    __publicField(this, "runTask", (task, data, finished) => {
      const { taskName, _task, next } = task;
      this.dispatch("run", { runner: this, task, data });
      let over = false;
      const finishProxy = (error) => {
        over = true;
        finished(taskName, error);
      };
      const nextProxy = (currentData) => {
        if (over)
          return;
        if (!next) {
          if (!this.next)
            return finishProxy();
          return this.next.start(data, finished);
        }
        if (currentData !== void 0)
          return this.runTask(next, currentData, finished);
        return this.runTask(next, data, finished);
      };
      _task(data, nextProxy, finishProxy);
    });
    this.name = name;
    this.flow = flow;
    this.dispatch = flow.dispatch;
  }
}
class FlowCore {
  constructor() {
    __publicField(this, "name", "");
    __publicField(this, "currentRunner", null);
    __publicField(this, "update", (runner) => {
      const { currentRunner } = this;
      if (currentRunner && currentRunner !== runner) {
        currentRunner.next = runner;
        runner.pre = currentRunner;
        this.currentRunner = runner;
      }
    });
    __publicField(this, "stop", () => {
    });
  }
}
var InterceptType;
(function(InterceptType2) {
  InterceptType2["REGISTER"] = "register";
  InterceptType2["RUN"] = "run";
  InterceptType2["ERROR"] = "error";
  InterceptType2["CALL"] = "call";
})(InterceptType || (InterceptType = {}));
class Flow extends FlowCore {
  constructor(name) {
    super();
    this.firstRunner = null;
    this.currentRunner = null;
    this.runnerMap = /* @__PURE__ */ new Map();
    this.interceptOptions = null;
    this.tap = (name2) => {
      const runner = new TaskRunner(name2, this);
      this.runnerMap.set(name2, runner);
      if (!this.firstRunner)
        this.firstRunner = runner;
      if (!this.currentRunner)
        this.currentRunner = runner;
      this.update(runner);
      this.dispatch(InterceptType.REGISTER, { runner });
      return {
        run: runner.run,
        tap: this.tap
      };
    };
    this.intercept = (options) => {
      if (options)
        this.interceptOptions = options;
    };
    this.call = (data, finished) => {
      const { firstRunner } = this;
      if (firstRunner) {
        this.dispatch(InterceptType.CALL, { flow: this, data });
        firstRunner.start(data, finished);
      }
    };
    this.dispatch = (eventName, event) => {
      if (!this.interceptOptions)
        return;
      const callback = this.interceptOptions[eventName];
      if (callback && callback instanceof Function) {
        callback({ ...event });
      }
    };
    this.name = name;
  }
}
const workFlow = (name) => {
  return new Flow(name);
};
export { Flow as default, workFlow };