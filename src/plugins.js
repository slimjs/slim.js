import { REMOVED, CREATE, ADDED, RENDER } from './internals.js';

/**
 * @enum {Symbol}
 */
export const Phase = {
  CREATE,
  RENDER,
  ADDED,
  REMOVED,
};

/**
 * @typedef {(phase: Phase, target: import('./component.js').Slim) => any} SlimPlugin
 */

class PluginRegistry {
  /**
   * @private
   * @type {Set<SlimPlugin>}
   */
  _plugins = new Set();

  /**
   * @public
   * @param {SlimPlugin} plugin
   */
  register(plugin) {
    this._plugins.add(plugin);
  }

  /**
   * @public
   * @returns {SlimPlugin[]}
   */
  getPlugins() {
    return Array.from(this._plugins);
  }

  /**
   *
   * @param {Phase} phase
   * @param {import('./component.js').Slim} target
   */
  execute(phase, target) {
    this.getPlugins().forEach((plugin) => plugin(phase, target));
  }
}

export const Registry = new PluginRegistry();
