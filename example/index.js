const { Rope } = window
const { text, div, hooks, input, list, element:$ } = Rope.Element;
const rope = new Rope(1);

const app = hooks((props, state, setState) => {

  const Item = (number) => {
    return $('pre').children([
      $('code', `var a${number} = ${number};`)
    ])
  };

  return div(
    text(props, 'text'),
    text(state, 'text'),
    list((number) => Item(number), [1,2,3,4,5])
  );
}, { text: 'Hello world!From state!' });

document.body.appendChild(app({
  text: 'Hello world!From props!'
}).element);