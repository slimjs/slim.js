import { DirectiveRegistry, Utils } from '../index.js';

/** @type {import('../typedefs.js').Directive} */
const refDirective = {
  attribute: (_, nodeName) => nodeName === '#ref',
  process: ({ attribute, targetNode, scopeNode }) => {
    const propertyName = attribute.value;
    Object.defineProperty(scopeNode, propertyName, {
      value: targetNode,
      configurable: true,
    });
    return {
      removeAttribute: true,
    };
  },
  noExecution: true,
};

DirectiveRegistry.add(refDirective);
