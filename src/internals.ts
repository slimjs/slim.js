export namespace Internals {
  const idleCb = (cb: Function, ...args: any[]) => setTimeout(cb);
  export const requestIdleCallback = window['requestIdleCallback'] || idleCb;
  export const internals = Symbol('internals');
  export const block = Symbol('creationBlock');
  export const repeatCtx = Symbol('repeat-ctx');
  export const CREATE = Symbol();
  export const RENDER = Symbol();
  export const ADDED = Symbol();
  export const REMOVED = Symbol();
  export const debug = Symbol();
}