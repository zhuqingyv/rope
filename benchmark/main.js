import Rope from '../src/index.js';
import { tr, td } from './Element/index.js';
import { store, setStoreState } from './store.js';
import './buttonList.js';

// Rope.renderTask.setMaxRenderCount(15000);

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
      return item && item.id === selected ? 'danger' : '';
    })
  );
};

// const List = list(row, store.state, 'list').setElement(document.createElement('tbody')).setRenderCount(100);
const List = list(row, store.state, 'list').setElement(document.createElement('tbody'));
List.update();
document.querySelector('#list-container').appendChild(List.element);