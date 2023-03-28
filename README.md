# Editor.md

![icon](https://picasso-static.xiaohongshu.com/fe-platform/4e206d734613042f5cd8f8cd55be47ce747ba4e2.png)

RopeJS is a purely functional programming web framework that abstracts all elements into a single function, and all data binding is also implemented through passing parameters. So even if you don't use JSX like syntax, you can write a semantical DOM structure using javascript!

## install or inject

``` shell
npm i jsrope
```

OR

``` html
<script src="https://xxxxxx.ropejs.js"></script>
```

### Why use RopeJs?

Rope was born to perform simple page building without any web clis( _npm vue-cli create-app..._ ), so once your HTML introduces **RopeJs** , your js can be as follows:

``` html
<html>
  <body>
    <style>
      span {
        display: block;
      }
    </style>
    <script src="./lib/rope.js"></script>
    <script type="text/javascript">
      const { Rope } = window
      const { text, div, hooks, input, list } = Rope;
      
      const rope = new Rope(1);
      const app = hooks((props, state, setState) => {
        return div(
          text(props, 'text'),
          text(state, 'text')
        );
      }, { text: 'Hello world!From state!' });

      document.body.appendChild(app({
        text: 'Hello world!From props!'
      }).element);

    </script>
  </body>
</html>
```

The operation result is shown in the figure!

![result](https://github.com/zhuqingyv/rope/blob/main/assets/base_demo.png)

### Element

#### VElement

_All components inherit from the **VElementClass**. Let's take the 'div component' as an example to demonstrate the basic functions of a component:_

``` javascript
const { div } = Rope;

const child1 = div()
  .className('a-div-1')
  .style({
    width: '50px',
    height: '50px',
    backgroundColor: 'red'
  })
  .onClick(() => { alert('a-div-1') })

const child2 = div()
  .className('a-div-2')
  
// Direct nesting is allowed here
div(child1, child2)
```

#### Text

_In Rope, a text component is defined as text, which is essentially a span. Let's take a look at the demonstration below:_

``` javascript
const { text } = Rope;

test('I'm a span as text!)
  .className('a-text')
  .style({
    contSize: '12px',
    color: 'gray'
  })
  .onClick(() => { alert('a-text') })
```

### Hook Component

Usually, we need to reuse a set of elements, that is, the concept of components. At this point, we need to use hooks

#### Use

``` javascript
const { hooks, div, text } = Rope;

const myComponent = hooks((props, state, setState) => {
  return div(
    text(props, 'text'),
    text(state, 'text')
  )
}, { text: "I'm state.text!" });

const props = {
    text: "I'm props.text!"
};
document.body.appendChild(myComponent(props))
```

#### Bind state && set state

Because RopeJS is filled with functions everywhere, the binding rules for data can be represented by the number of parameters to the function, using text as an example:

##### Static

_The value of text here will never change!_

``` javascript
const app = hooks((props) => {
  return text(props.text)
});

app({ text: "I'm props.text!" });

```

##### Dynamics

_Here, the value of text always points to object.text!_

``` javascript
const app = hooks((props) => {
  return text(props, 'text')
})

app({ text: "I'm props.text!" });

```

##### Dynamics with filter

_The third parameter here can be a function, and the final value is based on the return value of the function!_

``` javascript
const app = hooks((props) => {
  return text(props, 'text', (text) => {
    return `Text is: ${text}!`
  })
})

app({ text: "I'm props.text!" });

```
