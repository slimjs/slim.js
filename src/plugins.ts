import Component from './component';

export namespace Plugins {
  export enum Phase {
    CREATE,
    RENDER,
    ADDED,
    REMOVED,
  }
  export type Plugin = (phase: Phase, target: Component) => any;
  export interface IRegistry {
    add(plugin: Plugin): void;
    getPlugins(): Plugin[];
  }

  export class PluginRegistry implements IRegistry {
    private _plugins = new Set<Plugin>();
    add(plugin) {
      this._plugins.add(plugin);
    }
    getPlugins() {
      return Array.from(this._plugins);
    }
    execute(phase: Phase, target: Component) {
      this._plugins.forEach((plugin) => plugin(phase, target));
    }
  }
  /**
   * @singleton
   */
  export const Registry = new PluginRegistry();
}
