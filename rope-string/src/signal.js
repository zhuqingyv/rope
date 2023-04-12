export class DynamicsData {
  static isDynamics = (target) => {
    return target instanceof DynamicsData;
  }
  constructor(data, callback) {
    this.data = data;
    this.callback = callback;
  }
}

const setValue = (data, value) => {
  if (value instanceof Function) {
    data.value = value(data.value);
    return;
  };

  data.value = value;
};

const createGetter = (data) => {
  const handle = function() {
    return data.value
  };
  handle.__proto__ = new DynamicsData(data);
  return handle;
};

const createSetter = (data) => {
  const handle = function(value, callback) {
    setValue(data, value);
    callback(value);
  }
  handle.__proto__ = new DynamicsData(data);
  return handle;
};

export const signal = (initValue) => {
  const data = {
    value: undefined,
  };

  setValue(data, initValue);

  return [createGetter(data), createSetter(data)]
};