export default (attribute, proxy, target, callback) => {
  return () => {
    queueMicrotask(() => {
      const { treeId } = target;
      const element = document.querySelector(`[tree-id='${treeId}']`);
      callback({ element });
    });
  }
};