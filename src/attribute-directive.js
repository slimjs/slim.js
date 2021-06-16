import { Registry } from './directive.js';
import { dashToCamel } from './utils.js';

/**
 * @type {import('./directive.js').Directive}
 */
const attributeDirective = {
  attribute: (attr) => attr.nodeName.startsWith('[') && attr.nodeName.endsWith(']'),
  process: ({ attribute, targetNode }) => {
    targetNode;
    attribute.nodeName;
    const attrName = attribute.nodeName.slice(1, -1);
    return {
      update: (/** @type {any} */ value) => {
        if (typeof value === 'boolean') {
          value ? targetNode.setAttribute(attrName, '') : targetNode.removeAttribute(attrName);
        } else {
          targetNode.setAttribute(attrName, '' + value);
        }
      },
    };
  },
};

Registry.register(attributeDirective);
