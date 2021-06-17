import { Registry } from './directive.js';

/**
 *
 * @param {Attr} attr
 * @param {string} name
 * @param {string|null} value
 * @returns
 */
function test(attr, name, value) {
  return (
    !name.startsWith('@') &&
    !name.startsWith('.') &&
    !name.startsWith('*') &&
    (value || '').startsWith('{{') &&
    (value || '').endsWith('}}')
  );
}

/**
 * @type {import('./directive.js').Directive}
 */
const attributeDirective = {
  attribute: test,
  process: ({ attributeName: name, targetNode }) => {
    targetNode;
    return {
      update: (/** @type {any} */ value) => {
        if (
          typeof value === 'boolean' ||
          value === null ||
          value === undefined
        ) {
          value
            ? targetNode.setAttribute(name, '')
            : targetNode.removeAttribute(name);
        } else {
          targetNode.setAttribute(name, '' + value);
        }
      },
      removeNode: false,
    };
  },
};

Registry.register(attributeDirective);
