import V from "./Element.js";
import hooks from '../hooks.js';

class Div extends V {
  constructor() {super('div')};
};

const special = function(key, ...arg) {
  this.setAttribute(key, ...arg);
  this.update();
  return this;
};

class Input extends V {
  value = special.bind(this, 'value');
  constructor() {super('input')};
};

class Text extends V {
  value = special.bind(this, 'value');
  constructor() {super('span')};
};

class Img extends V {
  constructor(src) {super('img')};
  src = special.bind(this, 'src');
};

export const div =  hooks(() => {
  return new Div();
});

export const text =  hooks(() => {
  return new Text();
});

export const input =  hooks(() => {
  return new Input();
});

export const img =  hooks(() => {
  return new Img();
});

export const VElement = V;