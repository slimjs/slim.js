import {Slim} from './index.js';

// @ts-expect-error
const dashToCamel = Slim.Utils.dashToCamel();
// @ts-expect-error
const { debug } = Slim.Internals;

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
      removeAttribute: !Slim[debug]
    };
  },
};
Slim.directives.add(propertyDirective, true);
