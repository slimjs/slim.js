import { Registry } from './directive.js';
import { dashToCamel, syntaxMethod } from './utils.js';

/**
 * @type {import('./directive.js').Directive}
 */
const eventDirective = {
  attribute: (attr) => attr.nodeName === '#ref',
  process: ({ attribute, targetNode, scopeNode }) => {
    const propertyName = attribute.value;
    Object.defineProperty(scopeNode, propertyName, {
      value: targetNode,
      configurable: true
    });
    return {
      update: () => { }
    };
  }
};

Registry.register(eventDirective);
