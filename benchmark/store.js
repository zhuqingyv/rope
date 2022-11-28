const { hooks } = Rope.Element;

export const store = {
  state: {
    list: [],
    selected: null
  },
  props: {}
};

export const setStoreState = hooks((props, state, setStore) => {
  return setStore;
}, store.state)(store.props);