import { camelToDash } from './utils.js';

/**
 * @decorator
 * @param {boolean} value
 * @returns {ClassDecorator}
 */
export function useShadow(value) {
  return function (target) {
    Object.defineProperty(target, 'useShadow', { value });
  };
}

/**
 * @decorators
 * @param {string} html
 * @returns {ClassDecorator}
 */
export function template(html) {
  return function (target) {
    Object.defineProperty(target, 'template', { value: html });
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
 * @type {(name: string) => any}
 */
export function attribute(attributeName = '') {
  return function (target, key) {
    const clazz = target.constructor;
    const dash = attributeName || camelToDash()(String(key));
    const { observedAttributes = [] } = clazz;
    Object.defineProperty(clazz, 'observedAttributes', {
      value: [...observedAttributes, dash],
      configurable: true,
    });
    // @ts-ignore
    const { oAttrCb } = target;
    function nAttrCb(name, oldVal, newVal) {
      oAttrCb ? oAttrCb(name, oldVal, newVal) : void 0;
      if (newVal === null && !this.hasAttribute(dash)) {
        return;
      }
      if (oldVal === newVal) return;
      if (name === dash) {
        // @ts-ignore
        this[key] = newVal;
      }
    }
    Object.defineProperty(target, 'attributeChangedCallback', {
      value: nAttrCb,
      configurable: true,
    });
    let value;
    const nDescriptor = {
      get: function () {
        return value;
      },
      set: function (v) {
        value = v;
        if (typeof v === 'boolean') {
          if (v) {
            this.setAttribute(dash, '');
          } else this.removeAttribute(dash);
        } else {
          this.setAttribute(dash, String(v));
        }
      },
    };
    Object.defineProperty(target, key, nDescriptor);
    return nDescriptor;
  };
}
