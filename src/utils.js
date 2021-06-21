import { requestIdleCallback, repeatCtx } from './internals.js';

const forceUpdateMap = new WeakSet();
const flushMap = new WeakMap();

export { requestIdleCallback };
/**
 * @param {import('./component.js')} target
 * @param {...string[]} keys
 */
export function forceUpdate (target, ...keys) {
  const props = [...arguments].slice(1);
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
};

/**
 * @param {Node|Element|null} t
 */
export const findCtx = (t) => {
  while (t && !t[repeatCtx]) {
    t = t.parentElement;
  }
  return t?.[repeatCtx];
};

export const isForcedUpdate = (t) => forceUpdateMap.has(t);

export const markFlush = (t, flush) => flushMap.set(t, flush);

const d2c = /-[a-z]/g;
/**
 * @param {string} dash Dashed-case string
 * @returns camel-cased string
 */
export const dashToCamel = (dash) =>
  dash.indexOf('-') < 0 ? dash : dash.replace(d2c, (m) => m[1].toUpperCase());

export const syntaxMethod = () => /(.+)(\((.*)\)){1}/;

/**
 * @param {Set<Function>|Array<Function>} queue
 * @param {number} [timeout] max milliseconds to wait
 */
export const lazyQueue = (queue, timeout = 20) => {
  const opts = { timeout };
  const iterator = queue[Symbol.iterator]();
  let task = iterator.next();
  const run = () => requestIdleCallback(execOne, opts);

  function execOne(deadline) {
    while (deadline?.timeRemaining?.() && !task.done) {
      task.value();
      task = iterator.next();
    }
    if (deadline?.didTimeout) {
      task.value();
      task = iterator.next();
    }
    if (!task.done) {
      run();
    }
  }
  run();
};

/**
 *
 * @param {string} html HTML string
 */
export const normalize = (html) =>
  html
    .replace(/\n/g, '')
    .replace(/[\t ]+\</g, '<')
    .replace(/\>[\t ]+\</g, '><')
    .replace(/\>[\t ]+$/g, '>');

/**
 * @param {Function} fn
 * @returns
 */
export const memoize = (fn) => {
  const cache = {};
  return (str) => cache[str] || (cache[str] = fn(str));
};

export const createFunction = (...args) => {
  const cache = {};
  const key = args.join('$');
  return cache[key] || (cache[key] = new Function(...args));
};

export const NOOP = () => void 0;
