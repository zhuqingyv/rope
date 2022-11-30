import { store, setStoreState } from './store.js';
const { div, text:span } = Rope.Element;

const A = ["pretty", "large", "big", "small", "tall", "short", "long", "handsome", "plain", "quaint", "clean", "elegant", "easy", "angry", "crazy", "helpful", "mushy", "odd", "unsightly", "adorable", "important", "inexpensive", "cheap", "expensive", "fancy"];
const C = ["red", "yellow", "blue", "green", "pink", "brown", "purple", "brown", "white", "black", "orange"];
const N = ["table", "chair", "house", "bbq", "desk", "car", "pony", "cookie", "sandwich", "burger", "pizza", "mouse", "keyboard"];

let nextId = 1;

function buildData(count) {
  const data = new Array(count);
  for (let i = 0; i < count; i++) {
    data[i] = {
      id: nextId++,
      label: `${A[random(A.length)]} ${C[random(C.length)]} ${N[random(N.length)]}`,
    }
  }
  return data;
};

function random(max) {
  return Math.round(Math.random() * 1000) % max;
};
// 点击事件
const onButtonAction = (type) => {
  switch(type) {
    case 'run': {
      setStoreState({ list: buildData(1000) });
      break;
    }
    case 'runlots': {
      setStoreState({ list: buildData(10000) });
      break;
    }
    case 'add': {
      setStoreState({ list: store.state.list.concat(buildData(1000)) });
      break;
    }
    case 'update': {
      const newData = store.state.list.slice(0);
      for (let i = 0; i < newData.length; i += 10) {
        const r = newData[i];
        newData[i] = { id: r.id, label: r.label + " !!!" };
      };
      setStoreState({ list: newData });
      break;
    }
    case 'clear': {
      setStoreState({ list: [] });
      break;
    }
    case 'swaprows': {
      const { list } = store.state;
      setStoreState({ list: [list[0], list[998], ...list.slice(2, 998), list[1], list[999]] });
      break;
    }
  };
};

const button = ({ id }) => {
  return div(
    span(id).class('btn btn-primary btn-block').setElement(document.createElement('button')).id(id).onClick(() => onButtonAction(id))
  ).class('col-sm-6 smallpad')
};

const buttomList = div(
  button({ id: 'run' }),
  button({ id: 'runlots' }),
  button({ id: 'add' }),
  button({ id: 'update' }),
  button({ id: 'clear' }),
  button({ id: 'swaprows' }),
).class('row');

buttomList.update();

document.querySelector('#button-container').appendChild(buttomList.element);