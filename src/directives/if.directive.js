import { DirectiveRegistry, Internals, processDOM } from '../index.js';
const { block } = Internals;

/**
 * @param {HTMLElement} src
 * @param {any} scope
 */
const createCopy = (src, scope) => {
  const copy = /** @type {HTMLElement} */ (src.cloneNode(true));
  const { clear, flush } = processDOM(scope, copy);
  return {
    clear,
    flush,
    copy,
  };
};

const ifDirective = {
  attribute: (_, name) => name === '*if',
  process: ({ scopeNode, targetNode, expression }) => {
    const hook = document.createComment(`--- *if ${expression}`);
    targetNode[block] = 'abort';
    targetNode.removeAttribute('*if');
    targetNode.parentNode?.insertBefore(hook, targetNode);
    /** @type {HTMLElement|undefined} */
    let copy, flush, clear;
    const update = (/** @type {any} */ value) => {
      if (!!value) {
        !copy && ({ copy, flush, clear } = createCopy(targetNode, scopeNode));
        flush();
        hook.parentNode?.insertBefore(copy, hook);
      } else if (copy) {
        copy.remove();
        clear();
        copy = undefined;
      }
    };
    return {
      update,
      removeNode: true,
      removeAttribute: true,
    };
  },
  noExecution: true,
};
DirectiveRegistry.add(ifDirective);
