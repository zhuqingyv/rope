export default ({ target, proxy, eventName }) => {
  return (callback) => {
    target.events[eventName] = callback;
    return proxy;
  };
};