import ElementS, { render, signal } from './src/index.js';

const { div, span, code, canvas, block, script, style } = ElementS;

// const randomSpan = Array.from({ length: 1000 }).map((_,i) => `${i}-${Math.random().toFixed(1)}`)
// 1.单例更新
// 2.列表更新

const app = () => {
  const [ count, setCount ] = signal('沙雕');
  debugger;
  // children
  // attribute
  return span(count).onclick(() => {alert(666)});
};

window.app = app();

render(document.querySelector('#root'), window.app);


const rope = {};


const app1 = hooks({
  computed(props, state) {},
  render({ title }) {
    return div(title)
  }
});
