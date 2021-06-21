import { Utils, Internals, DirectiveRegistry } from '../index.js';

const { dashToCamel } = Utils;
const { debug } = Internals;

/**
 * @type {import('./directive.js').Directive}
 */
const propertyDirective = {
  attribute: (_, nodeName) => nodeName.startsWith('.'),
  process: ({ attribute, targetNode }) => {
    const propertyName = dashToCamel(attribute.nodeName.slice(1));
    return {
      update: (/** @type {any} */ value) => {
        /** @type {any} **/ (targetNode)[propertyName] = value;
      },
      removeAttribute: !Slim[debug],
    };
  },
};
DirectiveRegistry.add(propertyDirective);
