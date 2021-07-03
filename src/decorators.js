import { Utils } from './index.js';
const c2d = (camel) => camel.replace(/([A-Z])/g, '-$1').toLowerCase();

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

const attrMap = new WeakMap();

/** @this {any} */
function relfectFromAttr(attr, val) {
  const p = Utils.dashToCamel(attr);
  this[p] = val;
}

/**
 * @type {(name: string) => any}
 */
export function attribute(attributeName = '') {
  return function (target, key, descriptor) {
    const clazz = target.constructor;
    const dash = attributeName || c2d(String(key));
    const { observedAttributes = [] } = clazz;
    Object.defineProperty(clazz, 'observedAttributes', {
      value: [...observedAttributes, dash],
      configurable: true,
      writable: true,
    });
    const meta = attrMap.get(target);
    if (meta) {
      (meta.attrs = meta.attrs || []).push(dash);
    }

    const oAttrCb = target.attributeChangedCallback;
    Object.defineProperty(target, 'attributeChangedCallback', {
      value: function (name, oldVal, newVal) {
        oAttrCb && oAttrCb.call(this, name, oldVal, newVal);
        if (~meta.attrs.indexOf(name)) {
          relfectFromAttr.call(this, name, newVal);
        }
      },
      configurable: true,
    });
    let value;
    const nDescriptor = {
      configurable: true,
      writable: true,
      initializer: function () {
        const oSet = (
          Object.getOwnPropertyDescriptor(this, key) ||
          Object.getOwnPropertyDescriptor(target, key) ||
          {}
        ).set;
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
            } else if (v === null) {
              this.removeAttribute(dash);
            } else {
              this.setAttribute(dash, String(v));
            }
          },
        });
        this[key] = this[key];
      },
    };
    Object.defineProperty(target, key, nDescriptor);
    descriptor.configurable = true;
    descriptor.writable = true;
    return nDescriptor;
  };
}
