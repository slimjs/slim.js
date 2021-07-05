const S = Symbol;

export const block = S('block');
export const repeatCtx = S('repeat');
export const requestIdleCallback =
  // @ts-ignore
  window.requestIdleCallback || ((cb, ...args) => setTimeout(cb));
export const internals = S('internals');
export const CREATE = S();
export const RENDER = S();
export const ADDED = S();
export const REMOVED = S();
export const debug = S();
export const index = S();
