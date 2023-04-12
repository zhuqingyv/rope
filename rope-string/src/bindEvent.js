document.onclick = (event) => {
  const { type, target } = event;
  const ropeEventValue = target.getAttribute('rope-events');
  if (!ropeEventValue) return;

  if (ropeEventValue.split(' ').includes(type)) {
    debugger;
  };
};

export const events = {};

export default ({ target, proxy, eventName }) => {
  return (callback) => {
    target.events[eventName] = callback;
    return proxy;
  };
};