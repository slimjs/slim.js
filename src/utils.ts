import Component from './component.js';
import { Internals } from './internals.js';

const forceUpdateMap = new WeakSet<Component>();
const flushMap = new WeakMap<Component>();

export namespace Utils {
  const { requestIdleCallback } = Internals;

  export function forceUpdate(target: Component, ...keys: string[]) {
    const props: string[] = [...arguments].slice(1);
    const flush = flushMap.get(target);
    if (!flush) {
      return console.error('Flush error');
    }
    forceUpdateMap.add(target);
    if (props.length) {
      flush(...props);
    } else {
      flush();
    }
    requestAnimationFrame(() => forceUpdateMap.delete(target));
  }

  export type Bindings<T> = Record<string, Set<T>>;
  export type WithInternals<T = any, K = any> = {
    [Internals.internals]: Bindings<K>;
  } & T;

  export function contextLookup(t: Node|Element|null) {
    while (t && !t[Internals.repeatCtx]) {
      t = t.parentElement;
    }
    return t?.[Internals.repeatCtx];
  }

  export function isForcedUpdate(target: Component) {
    return forceUpdateMap.has(target);
  }

  export function markFlush(target: Component, flush: Function) {
    flushMap.set(target, flush);
  }

  export function dashToCamel() {
    /**
     * Replaces dashed-expression (i.e. some-value) to a camel-cased expression (i.e. someValue)
     */
    return (dash: string) =>
      dash.indexOf('-') < 0
        ? dash
        : dash.replace(/-[a-z]/g, (m) => m[1].toUpperCase());
  }

  export function camelToDash() {
    /**
     * Replaces camel-cased expression (i.e. someValue) to a dashed-expression (i.e. some-value)
     */
    return (camel) => camel.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  export function syntaxMethod() {
    return /(.+)(\((.*)\)){1}/;
  }

  export function lazyQueue(queue: Function[] | Set<Function>, time = 20) {
    const opts = { timeout: time };
    const iterator = queue[Symbol.iterator]();
    let task = iterator.next();
    function executeOne(deadline) {
      while (deadline?.timeRemaining?.() && !task.done) {
        task.value();
        task = iterator.next();
      }
      if (deadline?.didTimeout) {
        task.value();
        task = iterator.next();
      }
      if (!task.done) {
        requestIdleCallback(executeOne, opts);
      }
    }
    requestIdleCallback(executeOne, opts);
  }

  export function normalizeHTML(html: string) {
    return html
      .replace(/\n/g, '')
      .replace(/[\t ]+\</g, '<')
      .replace(/\>[\t ]+\</g, '><')
      .replace(/\>[\t ]+$/g, '>');
  }

  export function memoize<T>(fn: Function): (value: string) => T {
    const cache = {};
    return (str: string) => cache[str] || (cache[str] = fn(str));
  }

  const fnCache = {};
  export function createFunction(...args) {
    const key = args.join('$');
    return fnCache[key] || (fnCache[key] = new Function(...args));
  }

  export const NOOP = () => void 0;
}
