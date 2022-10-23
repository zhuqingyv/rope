import hooks from './hooks.js';
import { VElement, div, text, input } from './components/index.js';

class Tomato {
  options = {
    target: document.body,
    props: {}
  };

  constructor(o = {}, a) {
    Object.assign(this.options, o);
    this.app = a;
    this.options.target.appendChild(a.vm.element);
  };
}

globalThis.UI = {hooks, div, text, input, VElement, Tomato};
export default Tomato;