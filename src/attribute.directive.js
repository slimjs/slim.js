
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
    return {
      update: (value) => {
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

Slim.directives.add(attributeDirective);
