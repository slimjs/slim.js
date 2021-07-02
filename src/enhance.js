/** @typedef {(import("./typedefs.js").Plugin)} Plugin */

/** @typedef {import("./typedefs.js").Directive} Directive */

/**
 * @template T
 * @property {T[]} addons
 */
class Registry {
  constructor() {
    /** @type {T[]} */
    this.addons = [];
  }

  /**
   * @param {T} addon
   * @param {boolean} priority
   */
  add(addon, priority = false) {
    priority ? this.addons.unshift(addon) : this.addons.push(addon);
  }

  getAll() {
    return [...this.addons];
  }
}

/**
 * @class PluginRegsitryClass
 * @extends Registry<Plugin>
 */
class PluginRegistryClass extends Registry {
  exec(phase, target) {
    this.addons.forEach((addon) => addon(phase, target));
  }
}

/**
 * @type Registry<Directive>
 */
export const DirectiveRegistry = new Registry();
export const PluginRegistry = new PluginRegistryClass();
