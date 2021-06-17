import { Registry } from './directive.js';
import { dashToCamel } from './utils.js';
import { debug } from './internals.js';
import { Slim } from './component.js';

/**
 * @type {import('./directive.js').Directive}
 */
const propertyDirective = {
  attribute: (attr) => attr.nodeName.startsWith('.'),
  process: ({ attribute, targetNode }) => {
    const propertyName = dashToCamel()(attribute.nodeName.slice(1));
    return {
      update: (/** @type {any} */ value) => {
        /** @type {any} **/ (targetNode)[propertyName] = value;
      },
      removeAttribute: !Slim[debug]
    };
  },
};

Registry.register(propertyDirective);
