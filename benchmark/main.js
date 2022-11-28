// import './lib/rope.js'
import '../src/index.js';
import { tr, td } from './Element/index.js';
import { store, setStoreState } from './store.js';
import './buttonList.js';

const { text:span, link:a, list } = Rope.Element;

const onCheck = (selected) => {
  setStoreState({ selected });
};

const onRemove = (index) => {
  store.state.list.splice(index, 1);
  setStoreState(store.state);
};

const row = (item, index) => {
  return (
    tr(
      td().class('col-md-1').value(store.state, `list.${index}.id`),
      td(
        a('').value(store.state, `list.${index}.label`).onClick(() => onCheck(store.state.list[index].id))
      ).class('col-md-4'),
      td(
        a('').children([span('').class('glyphicon glyphicon-remove')]).onClick(() => onRemove(index))
      ).class('col-md-1'),
      td().class('col-md-6'),
    ).class(store.state, 'selected', (selected) => {
      const item = store.state.list[index];
      if (item && item.id === selected) return 'danger';
      return '';
    })
  )
};

const { element } = list(row, store.state, 'list').setElement(document.createElement('tbody'));
document.querySelector('#list-container').appendChild(element);