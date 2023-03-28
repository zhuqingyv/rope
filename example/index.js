const { Rope } = window
const { text, div, hooks, input, list } = Rope;

const app = hooks((props, state, setState) => {
  return (
    div(
      list((number) => {
        return text(number)
      }, state, 'list'),
      div(
        text('点我')
      )
        .className('button')
        .onClick(() => {
          setState({
            list: [1,2,3,4,5]
          })
        })
    )
      .className('container')
  );
}, {
  list: [1,2,3]
});

// TODO: 这里修改渲染速度
// const rope = new Rope(1).init({
//   root: document.body,
//   app
// });
new Rope(1)
document.body.appendChild(app().element);
