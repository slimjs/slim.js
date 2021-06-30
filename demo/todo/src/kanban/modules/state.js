import { eventBus } from './messaging.js';

const tagged = new WeakMap();

export function createState(target = {}, bus = eventBus(), prefix = '') {
  // primitives cannot have a proxy
  if (typeof target === 'object' && target !== null && !tagged.has(target)) {
    const p = new Proxy(target, {
      get: (t, k) => t[k],
      set: (t, key, value) => {
        const path = prefix ? prefix + '.' + key : key;
        if (t[key] !== value) {
          // here is the key: If we get an object, we "proxify" it again, recursively
          const newValue = createState(value, bus, path);

          // this weakmap ensures an object is proxified once.
          // the usage of weak references allow the garbage collector to dispose unused objects that are not being watched
          if (tagged.has(value)) {
            t[key] = newValue.state;
          } else {
            t[key] = newValue;
          }
          bus.emit('change', {
            key: path,
            value,
          });
          bus.emit(path, value);
        }
        return true;
      },
    });
    // tag the dataset
    Object.keys(target).forEach((key) => {
      const path = prefix ? prefix + '.' + key : key;
      let upgraded = createState(target[key], bus, path);
      if (tagged.has(target[key])) {
        upgraded = upgraded.state;
      }
      target[key] = upgraded;
      bus.emit(path, upgraded);
      bus.emit('change', { key: path, value: upgraded });
    });
    // return as state
    const stateObj = {
      state: p,
      on: bus.on.bind(bus),
    };
    tagged.set(target, stateObj);
    tagged.set(p, stateObj);
    return stateObj;
  }
  // return as-is, either already tagged state or primitive
  return tagged.get(target) || target;
}
