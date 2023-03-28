# Editor.md

![](https://picasso-static.xiaohongshu.com/fe-platform/4e206d734613042f5cd8f8cd55be47ce747ba4e2.png)

## install or inject

``` shell
npm i ropejs
```

_or_

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

运行结果如图!

![](https://github.com/zhuqingyv/rope/blob/main/assets/base_demo.png)
