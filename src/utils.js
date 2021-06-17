import { requestIdleCallback } from './internals.js';

/**
 * Replaces dashed-expression (i.e. some-value) to a camel-cased expression (i.e. someValue)
 * @returns {function(string): string}
 */
export function dashToCamel() {
  return (dash) =>
    dash.indexOf('-') < 0
      ? dash
      : dash.replace(/-[a-z]/g, (m) => m[1].toUpperCase());
}

/**
 * Replaces camel-cased expression (i.e. someValue) to a dashed-expression (i.e. some-value)
 * @returns {function(string): string}
 */
export function camelToDash() {
  return (camel) => camel.replace(/([A-Z])/g, '-$1').toLowerCase();
}

export function syntaxMethod() {
  return /(.+)(\((.*)\)){1}/;
}

/**
 * @param {Function[]} queue
 * @param {number} [time]
 */
export function lazyQueue(queue, time = 20) {
  const opts = { timeout: time };
  const iterator = queue[Symbol.iterator]();
  let task = iterator.next();
  function executeOne(deadline) {
    while (deadline?.timeRemaining?.() && !task.done) {
      task.value();
      task = iterator.next();
    }
    if (!task.done) {
      requestIdleCallback(executeOne, opts);
    }
  }
  requestIdleCallback(executeOne, opts);
}

/**
 * @param {string} html HTML as string
 */
export function normalizeHTML(html) {
  return html
    .replace(/\n/g, '')
    .replace(/[\t ]+\</g, '<')
    .replace(/\>[\t ]+\</g, '><')
    .replace(/\>[\t ]+$/g, '>');
}

/**
 * @param {Function} fn 
 */
export function memoize(fn) {
  const cache = {};
  return str => cache[str] || (cache[str] = fn(str));
}
