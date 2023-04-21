import Guard from './guard.js';

export class DynamicsData {
  static isDynamics = (target) => {
    return target instanceof DynamicsData;
  }
  constructor(data) {
    this.data = data;
  }
}

const createGetter = (data) => {
  const handle = function({ computedHandle, target }) {
    // Make sure has guard
    if (!data.guard) data.guard = new Guard(data);
    // Add a register for target, an must provide a computedHandle!
    data.guard.add({ computedHandle, target });
    return data.value;
  };
  handle.__proto__ = new DynamicsData(data);
  data.getter = handle;
  return handle;
};

const setValue = (data, value, callback) => {
  const getValueSetter = () => {
    if (value instanceof Function) {
      return value(data.value);
    };
    return value;
  };

  const valueSetter = getValueSetter();

  // Allow Promise with await!
  if (valueSetter instanceof Promise) {
    const setAsync = async() => {
      const _value = await valueSetter;
      data.value = _value;
      if (callback) callback(_value);
    };
    setAsync();
  } else {
    // Set value right now!
    data.value = value;
    if (callback) callback(value);
  };
};

const createSetter = (data) => {
  const handle = function(value, callback) {
    setValue(data, value, (_value) => {
      if (data?.guard) data.guard.dispatch(_value);
      if (callback && callback instanceof Function) callback(_value);
    });
  };
  handle.__proto__ = new DynamicsData(data);
  data.setter = handle;
  return handle;
};

export const signal = (initValue) => {
  const data = {
    value: undefined,
    // 惰性监听器
    guard: null,
    getter: null,
    setter: null,
  };

  const getter = createGetter(data);
  const setter = createSetter(data);

  setValue(data, initValue);

  return [getter, setter];
};