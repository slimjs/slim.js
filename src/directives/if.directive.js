import { DirectiveRegistry, Internals, processDOM } from '../index.js';
const { block } = Internals;

/**
 * @param {Element} src
 * @param {any} scope
 */
const createCopy = (src, scope) => {
  const copy = /** @type {HTMLElement} */ (src.cloneNode(true));
  const { clear, bounds } = processDOM(scope, copy);
  return {
    clear,
    bounds,
    copy,
  };
};

/**
 * @type {import('../typedefs.js').Directive}
 */
const ifDirective = {
  attribute: (_, name) => name === '*if',
  process: ({ scopeNode, targetNode, expression: ex }) => {
    const hook = document.createComment(`*if`);
    targetNode[block] = 'abort';
    targetNode.removeAttribute('*if');
    targetNode.parentNode?.insertBefore(hook, targetNode);
    let copy, bounds, clear;
    const update = (/** @type {any} */ value) => {
      if (!!value) {
        !copy && ({ copy, bounds, clear } = createCopy(targetNode, scopeNode));
        bounds.forEach((f) => f());
        hook.parentNode?.insertBefore(copy, hook);
      } else if (copy) {
        copy.remove();
        clear();
        copy = bounds = clear = undefined;
      }
    };
    return {
      update,
      removeNode: true,
      removeAttribute: true,
    };
  },
  noExecution: false,
};
DirectiveRegistry.add(ifDirective);
