import { camelToDash } from './utils.js';

/**
 * @decorator
 * @param {boolean} value
 * @returns {ClassDecorator}
 */
export function useShadow(value) {
  return function (target) {
    Object.defineProperty(target, 'useShadow', {value});
  };
}

/**
 * @decorators
 * @param {string} html
 * @returns {ClassDecorator}
 */
export function template(html) {
  return function (target) {
    Object.defineProperty(target, 'template', {value: html});
  };
}

/**
 *
 * @param {string} selector
 * @returns {ClassDecorator}
 */
export function tag(selector) {
  return function (target) {
    customElements.define(
      selector,
      // @ts-expect-error
      /** @type {CustomElementConstructor} */ (target)
    );
  };
}

/**
 * @type {PropertyDecorator}
 */
export function attribute(target, key) {
  const clazz = target.constructor;
  // @ts-expect-error
  const { observedAttributes = [] } = clazz;
  Object.defineProperty(clazz, 'observedAttributes', {
    value: [...observedAttributes, camelToDash()(String(key))],
  });
}
