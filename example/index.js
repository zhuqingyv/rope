const { Rope } = window
const { text, div, hooks, input, list } = Rope;

const length = 100;
const taskStep = 1;

const app = (hooks((props, state, setState) => {
  const doSomething = (event) => {
    event.stopPropagation();
    event.preventDefault();
    const { clientX, clientY } = event;
    const newState = {
      style: {
        x: clientX,
        y: clientY,
        color: [Math.random(), Math.random(), Math.random(), Math.random()]
      }
    };
    setState(newState);
  };

  // window.onmousemove = doSomething;

  const computeStyle = ({ x, y, color }) => {
    const size = 50;
    const radio = 2;
    const sizeRandom = Math.random() * size;
    const rendomX = Math.random();
    const rendomY = Math.random();
    const xDiraction = Math.random() > 0.5 ? 1 : -1;
    const yDiraction = Math.random() > 0.5 ? 1 : -1;

    const [r,g,b,a] = color;

    return {
      // width: `${sizeRandom}px`,
      // height: `${sizeRandom}px`,
      top: `${(yDiraction * radio + y) * rendomY}px`,
      left: `${(xDiraction * radio + x) * rendomX}px`,
      // top: `${y - size / 2}px`,
      // left: `${x - size / 2}px`,
      backgroundColor: `rgba(${r * 255},${g * 255},${b * 255},${a + 0.4})`
    }
  };

  const divMagic = hooks(() => {
    return div().className('magic').style(state, 'style', computeStyle);
  });

  const onChangeRenderCount = (event) => {
    const { value } = event.target;
    const number = Number(value);

    if (!isNaN(number)) {
      Rope.renderTask.setMaxRenderCount(number);
      setState({ taskStep: number });
    } else {
      alert(`${value} 不是一个数字`);
      
    }
  };
  //  const listLoop = [3, 8, 3, 6, 8, 10, 0];
  window.onclick = () => {
    const count = Number((Math.random() * length).toFixed(0));
    const list = Array.from({ length: count  }).map((item, i) => {
      return {
        index: `${i+ 1}`
      }
    })
    setState({ list });
  };

  // return div(
  //   div(
  //     div(
  //       text(`渲染DOM数量:${state.list.length}`).style({
  //         color: 'white'
  //       })
  //     ),
  //     text('输入数字改变渲染吞吐量:').style({
  //       color: 'white'
  //     }),
  //     input(state, 'taskStep').onChange(onChangeRenderCount)
  //   ).className('input'),
    
  // ).className('app-container');
  return list((item, i) => {
    // const index = getIndex();
    return div(
      text(state, `list.${i}.index`).className('list-item')
    );
  }, state, 'list');
}, {
  // TODO: 这里修改长度
  list: Array.from({ length }).map((item, i) => {
    return {
      index: i
    }
  }),
  style: {
    x: 0,
    y: 0,
    color: [Math.random(), Math.random(), Math.random(), Math.random()]
  },
  taskStep
}))();

// TODO: 这里修改渲染速度
const rope = new Rope(taskStep).init({
  root: document.body,
  app
});
rope.root.appendChild(app.element);

// list(
//   (item) => text(item),
//   [1,2,3],
//   isAsycn
// );

// hooks((props) => {

// }, [1,2,3]);

// const _list = (hookFun, list, isAsycn) => {
//   if (isAsycn) {

//   } else {
//     return hooks(() => {
//       list.forEach()
//     });
//   };
// };
