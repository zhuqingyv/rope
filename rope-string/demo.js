import ElementS, { render, signal } from './src/index.js';

const { div, span, code, canvas, block, script, style } = ElementS;

// const randomSpan = Array.from({ length: 1000 }).map((_,i) => `${i}-${Math.random().toFixed(1)}`)
// 1.单例更新
// 2.列表更新

const app = () => {
  const [ children, setChildren ] = signal('one');
  setTimeout(() => {
    setChildren(span('666'))
  }, 2000);
  // debugger;
  // children
  // attribute
  return div(children).onclick(() => {alert(666)});
};

window.app = app();

render(document.querySelector('#root'), window.app);


// const rope = {};


// const app1 = hooks({
//   computed(props, state) {},
//   render({ title }) {
//     return div(title)
//   }
// });
