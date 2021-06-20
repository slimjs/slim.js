/**
 * @type {import('./directive.js').Directive}
 */
const refDirective = {
  attribute: (_, nodeName) => nodeName === '#ref',
  process: ({ attribute, targetNode, scopeNode }) => {
    const propertyName = attribute.value;
    Object.defineProperty(scopeNode, propertyName, {
      value: targetNode,
      configurable: true
    });
    return {
      // @ts-expect-error
      update: Slim.Utils.NOOP
    };
  }
};

// @ts-expect-error
Slim.directives.add(refDirective);
