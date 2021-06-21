const addons = Symbol();

class Registry {
  constructor() {
    this[addons] = [];
  }

  add(addon, priority = false) {
    priority ? this[addons].unshift(addon) : this[addons].push(addon);
  }

  getAll() {
    return [...this[addons]];
  }
}

class PluginRegistryClass extends Registry {
  exec(...params) {
    this[addons].forEach(addon => addon(...params));
  }
}

export const DirectiveRegistry = new Registry();
export const PluginRegistry = new PluginRegistryClass();
