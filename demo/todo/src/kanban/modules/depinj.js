const registry = {};

/**
 *
 * @param {string} key
 * @param {function} value factory function
 */
export function define(key, value) {
  registry[key] = value;
}

function provide(target, key) {
  const factory = registry[key];
  if (factory) {
    target[key] = factory();
  }
}

/**
 * @template T
 * @typedef {new (...args: any[]) => T} Ctor
 */

/**
 * @typedef WithDependencies
 * @property {Record<string, any>} dependencies
 */

/**
 * @template T
 * @param {Ctor<T>} Base
 * @returns {Base & Ctor<WithDependencies>}
 */
export function depInj(Base) {
  return /** @type {Base & Ctor<WithDependencies>} */ (
    // @ts-ignore
    class extends Base {
      constructor(...args) {
        super(...args);
        const inject = /** @type {any} */ (this.constructor).inject || []; // access to static property "inject";
        this.dependencies = this.dependencies || {};
        inject.forEach((key) => {
          provide(this.dependencies, key);
        });
      }
    }
  );
}
