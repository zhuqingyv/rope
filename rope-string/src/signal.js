const setValue = (data, value) => {
  if (value instanceof Function) {
    data.value = value();
    return;
  };

  data.value = value;
};

const createGetter = (data) => {
  return () => data.value;
};

const createSetter = (data) => {
  return (value, callback) => {
    setValue(data, value);
    callback(value);
  };
};

export const signal = (initValue) => {
  const data = {
    value: undefined,
  };

  setValue(data, initValue);

  return [createGetter(data), createSetter(data)]
};