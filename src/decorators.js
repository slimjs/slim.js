import { Utils } from './utils.js';

const camelToDash = Utils.camelToDash();

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
  return function (target, key, descriptor) {
    console.log(target, key);
    const clazz = target.constructor;
    const dash = attributeName || camelToDash(String(key));
    const { observedAttributes = [] } = clazz;
    Object.defineProperty(clazz, 'observedAttributes', {
      value: [...observedAttributes, dash],
      configurable: true,
      writable: true
    });
    // @ts-ignore
    const { attributeChangedCallback : oAttrCb } = target;
    function nAttrCb(name, oldVal, newVal) {
      oAttrCb ? oAttrCb(name, oldVal, newVal) : void 0;
      // @ts-expect-error
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
      configurable: true,
      writable: true,
      initializer: function () {
        const oSet = (Object.getOwnPropertyDescriptor(this, key) || Object.getOwnPropertyDescriptor(target, key)|| {}).set;
        Object.defineProperty(this, key, {
          get: function () {
            return value;
          },
          configurable: true,
          set: function (v) {
            value = v;
            if (oSet) {
              oSet(v);
            }
            if (typeof v === 'boolean') {
              if (v) {
                this.setAttribute(dash, '');
              } else this.removeAttribute(dash);
            } else {
              this.setAttribute(dash, String(v));
            }
          }
        });
        this[key] = this[key];
      }
    };
    Object.defineProperty(target, key, nDescriptor);
    descriptor.configurable = true;
    descriptor.writable = true;
    return nDescriptor;
  };
}
