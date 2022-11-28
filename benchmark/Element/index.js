const { special, VElement:V } = Rope.Element;

class Tr extends V {
  type = 'tr';
  dynamicProps = ['value'];
  constructor(...children) {
    super();
    if (children && children[0]?.type) this.children(children);
  };

  value = special.bind(this, 'value');
};

export const tr = (...arg) => {
  return new Tr(...arg);
}

class Td extends V {
  type = 'td';
  dynamicProps = ['value'];
  constructor(...children) {
    super();
    if (children && children[0]?.type) this.children(children);
  };

  value = special.bind(this, 'value');
};

export const td = (...arg) => {
  return new Td(...arg);
};