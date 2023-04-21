export class Register {}

export default class Guard {
  registers = new Map();

  add = ({ computedHandle, target }) => {
    if (this._repeatRegister({ computedHandle, target })) return;

    this.registers.set(computedHandle, target);
  };

  remove = ({ computedHandle }) => {
    if (!computedHandle) {
      console.warn('Guard.remove must has computedHandle as a Function!');
      return;
    };
    
    this.registers.delete(computedHandle);
  };

  dispatch = (_value) => {
    Array.from(this.registers).forEach(([computedHandle]) => {
      computedHandle(_value);
    });
  };

  _repeatRegister = ({ computedHandle, target }) => {
    const register = this.registers.get(computedHandle);
    if (register === undefined) return false;
    if (register === target) return true;
    return false;
  };


};