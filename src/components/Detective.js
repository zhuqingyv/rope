/**
 * 数据流转中心
*/
class Detective {
  memo = new Map();
  
  /**
   * 注册监听
   * 
   * @param { object } state customer 依赖的数据源
   * @param { string } targetKey customer 需要更新的属性
   * @param { VElement } customer VElement 
  */
  registe = (state, stateKey, targetKey, customer) => {
    // [state, Map]
    const memoSource = this.memo.get(state);

    // find source
    if (memoSource) {
      // [customer, UpdateObject]
      // find customer memo
      const memoCustomer = memoSource.get(customer);
      if (memoCustomer) {
        // set customer in memo
        memoCustomer[targetKey] = stateKey;
      } else {
        // build customer
        const memo = Object.create(null);
        memo[targetKey] = stateKey;
        memoSource.set(customer, memo)
      };
    } else {
      // customer
      const customers = new Map();
      // set customer
      this.memo.set(state, customers);
      // set customer register
      const registerItem = Object.create(null);
      registerItem[targetKey] = stateKey;

      customers.set(customer, registerItem)
    };

  };

  /**
   * 派发事件
   * 
   * @param { object } state 被修改的对象
   * @param { object } changeState 修改的merge
  */
  dispatch = (state, changeState, callback) => {
    const memoSource = this.memo.get(state);
    if (!memoSource) return;
    memoSource.forEach((updateObject, customer) => {
      const shouldUpdate =  Object.keys(updateObject).find((prop) => {
        return Rope.Element.VElement.getPropsSafe(changeState, updateObject[prop]) !== undefined;
      });
      shouldUpdate && customer.update(updateObject, callback);
    });
  };

};

export default Detective;