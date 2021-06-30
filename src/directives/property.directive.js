import { Utils, Internals, DirectiveRegistry, Slim } from '../index.js';

const { dashToCamel } = Utils;
const { debug, block } = Internals;

/** @type {import('../typedefs.js').Directive} Directive */
const propertyDirective = {
  attribute: (_, nodeName) => nodeName.startsWith('.'),
  process: ({ attributeName, targetNode }) => {
    const propertyName = dashToCamel(attributeName.slice(1));
    return {
      update: (/** @type {any} */ value) => {
        if (targetNode[block] === 'abort') return;
        /** @type {any} **/ (targetNode)[propertyName] = value;
      },
      removeAttribute: !Slim[debug],
    };
  },
};
DirectiveRegistry.add(propertyDirective);
