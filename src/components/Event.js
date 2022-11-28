class Event {
  eventHub = {};

  constructor(context) {
    this.context = context;
  }

  on = (eventName, callback) => {
    const currentEvent = this.eventHub[eventName];

    if (currentEvent && currentEvent instanceof Array) {
      currentEvent.push(callback);
    } else {
      this.eventHub[eventName] = [callback];
    }
  };

  emit = (eventName, ...arg) => {
    const currentEvent = this.eventHub[eventName];
    if (currentEvent && currentEvent instanceof Array) {
      currentEvent.forEach((callback) => {
        callback(...arg)
      });
    };
  };

  remove = (eventName, callback) => {
    if (eventName === undefined || eventName == null) return;

    if (callback) {
      const eventList = this.eventHub[eventName];
      eventList.find((_callback, i) => {
        if (_callback === callback) {
          eventList.splice(i, 1);
          return true;
        };
        return false;
      })
    } else {
      delete this.eventHub[eventName];
    };
  };

  destroy = () => {
    this.eventHub = Object.create(null);
  };
};

export default Event;