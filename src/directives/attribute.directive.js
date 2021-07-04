import { DirectiveRegistry, Internals } from '../index.js';

/**
 * @type {import('../typedefs.js').Directive}
 */
const attributeDirective = {
  attribute: (_, name, value = '') => {
    const first = name[0];
    return (
      value &&
      first !== '@' &&
      first !== '.' &&
      first !== '*' &&
      value.slice(0, 2) === '{{' &&
      value.slice(-2) === '}}'
    );
  },
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
