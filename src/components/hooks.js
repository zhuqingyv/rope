class Hooks {
  type = 'hook';
  constructor(state, vm) {
    this.state = state;
    this.vm = vm;
    vm.hook = this;
  };

  clearState = () => {
    for (let key in this.state) {
      delete this.state[key];
    }
  };

  get element() {
    return this.vm.element;
  };

  get props() {
    return this.vm.props;
  }

};

const setState = (_state) => {
  if (_state instanceof Function)  return _state() || Object.create(null);

  if (_state === undefined || _state === null) return {};
  return _state;
};

const hooks = (hook, _state) => {
  let state = setState(_state);
  // change memory
  let stateCache = {};
  let updateTrack = null;

  return (...arg) => {
    let type = 'normal';

    let props = {};
    const _armuments = [...arg];

    // static
    if (_armuments.length === 1 && !_armuments[0]?.vm) props = _armuments[0];

    // dynamic
    const [from, key] = _armuments;
    if (typeof from === 'object' && typeof key === 'string') type = 'dynamic';

    const setState = (changeState, callback) => {
      return new Promise((resolve, reject) => {
        try {
          // test params
          if (!changeState && typeof changeState === 'object') return reject('changeState is not defined!');
          // merge cache
          Object.assign(stateCache, changeState);

          if (updateTrack) return;
          updateTrack = true;
          queueMicrotask(() => {
            // merge state
            Object.assign(state, stateCache);
            // 触发更新
            Rope.detective.dispatch(state, stateCache, (...arg) => {
              if (callback && callback instanceof Function) callback(...arg);
              resolve();
            });
            // clear
            updateTrack = null;
            stateCache = {};
          });
        } catch (error) {
          reject(error);
        };
      });
    };
    let vm;

    switch (type) {
      case 'normal': {
        vm = hook(props, state, setState);
        break;
      }
      case 'dynamic': {
        vm = hook(...arg, state, setState);
        break;
      }
    };

    new Hooks(state, vm);
    return vm;
  };

};

export default hooks;