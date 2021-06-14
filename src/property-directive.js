import { Registry } from './directive.js';
import { dashToCamel } from './utils.js';

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
    };
  },
};

Registry.register(propertyDirective);
