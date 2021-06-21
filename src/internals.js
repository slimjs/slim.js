export const block = Symbol('block');
export const repeatCtx = Symbol('repeat');
export const requestIdleCallback =
  window['requestIdleCallback'] || ((cb, ...args) => setTimeout(cb));
export const internals = Symbol('internals');
export const CREATE = Symbol();
export const RENDER = Symbol();
export const ADDED = Symbol();
export const REMOVED = Symbol();
export const debug = Symbol();