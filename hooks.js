class Hooks {
  type = 'hook';
  constructor(props = {}, setState) {
    this.props = props;
    this.setState = setState;
  };

  proxy = (vm) => {
    if (vm) {
      const { props, updateTask, hooks, _htmlElement, ...rest } = vm;
      Object.assign(this, rest);
      this.vm = vm;
      vm.hook = this;
    };
  };

  get element() {
    return this.vm.element;
  }

};

const hooks = (hook, _state = {}) => {
  const state = _state;
  // change memory
  let stateCache = {};
  let updateTrack = null;

  return (...arg) => {
    let props = {};
    const _armuments = [...arg];
    if (_armuments.length === 1) props = arg[0];

    if (_armuments.length >= 2) {
      const [from, key, computed] = _armuments;
      props = new Proxy(from, {
        get(target) {
          const value = target[key];
          if (computed instanceof Function) {
            return computed(value)
          };
          return value;
        }
      });
    };

    const setState = (changeState, callback) => {
      return new Promise(async(resolve, reject) => {
        try {
          if (changeState && typeof changeState === 'object') {
            Object.assign(stateCache, changeState);
            if (!updateTrack) {
              updateTrack = Promise.resolve().then(async () => {
                // merge state
                Object.assign(state, stateCache);
  
                // update UI
                await newHook.update();
  
                // run callback
                if (callback && callback instanceof Function) callback(state, stateCache);
                resolve(state, stateCache);
  
                 // clear
                 stateCache = {};
                 updateTrack = null;
              });
            };
          };
        } catch (error) {
          reject(error);
        };
      });
    };
    const newHook = new Hooks(props, setState);
    newHook.proxy(hook(props, state, setState));
    return newHook;
  };
};

export default hooks;