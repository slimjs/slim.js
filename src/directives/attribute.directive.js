import { DirectiveRegistry, Internals } from '../index.js';

function attrTest(_, name, value) {
  return (
    !name.startsWith('@') &&
    !name.startsWith('.') &&
    !name.startsWith('*') &&
    (value || '').startsWith('{{') &&
    (value || '').endsWith('}}')
  );
}

const attributeDirective = {
  attribute: attrTest,
  process: ({ attributeName: name, targetNode }) => {
    targetNode;
    if (targetNode[Internals.block] === 'abort') return {};
    return {
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
