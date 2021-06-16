const idleCb = (cb, ...args) => setTimeout(cb);

export const internals = Symbol('internals');
export const componentInternals = Symbol('internals');
export const creationBlock = Symbol('creationBlock');
export const repeatContext = Symbol('repeat-ctx');
export const CREATE = Symbol();
export const RENDER = Symbol();
export const ADDED = Symbol();
export const REMOVED = Symbol();
export const debug = Symbol();
export const requestIdleCallback = window['requestIdleCallback'] || idleCb;