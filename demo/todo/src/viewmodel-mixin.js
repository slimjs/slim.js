import { Slim } from "slim-js";

const createViewModel = (target) => {
  const dataSource = {};
  return new Proxy({}, {
    get: (t, key) => dataSource[key],
    set: (t, key, value) => {
      dataSource[key] = value;
      Slim.Utils.forceUpdate(target, 'viewModel');
      return true;
    }
  });
}

/**
 * @template {any} T
 * @typedef {new(...args: any[]) => T} Constructor 
 */



/**
 * @template {Constructor<any>} T
 * @param {T} Base 
 * @returns {Constructor<T & {viewModel: any}> & Base}
 */

export function ViewModelMixin(Base) {
  return class ViewModelMixinClass extends Base {
    viewModel = createViewModel(this);
  }
}