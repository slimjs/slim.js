import { DirectiveRegistry, Internals } from '../index.js';

/**
 * @type {import('../typedefs.js').Directive}
 */
const attributeDirective = {
  attribute: (_, name, value) =>
    value &&
    !name.startsWith('@') &&
    !name.startsWith('.') &&
    !name.startsWith('*') &&
    value.startsWith('{{') &&
    value.endsWith('}}'),
  process: ({ attributeName: name, targetNode }) => {
    targetNode;
    if (targetNode[Internals.block] === 'abort') return {};
    return {
      /**
       * @param {any} value
       */
      update: (value) => {
        if (targetNode[Internals.block] === 'abort')
          return targetNode.removeAttribute(name);
        if (
          typeof value === 'boolean' ||
          typeof value === 'undefined' ||
          value === null
        ) {
          value
            ? targetNode.setAttribute(name, '')
            : targetNode.removeAttribute(name);
        } else {
          targetNode.setAttribute(name, '' + value);
        }
      },
      removeNode: false,
      removeAttribute: true,
    };
  },
};

DirectiveRegistry.add(attributeDirective);
