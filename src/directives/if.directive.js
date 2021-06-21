import { DirectiveRegistry, Internals, processDOM } from '../index.js';
const { block } = Internals;
const ifDirective = {
  attribute: (_, name) => name === '*if',
  process: ({ scopeNode, targetNode, expression }) => {
    const template = /** @type {HTMLElement} */ (targetNode.cloneNode(true));
    template.removeAttribute('*if');
    const hook = document.createComment(`--- *if ${expression}`);
    targetNode[block] = 'abort';
    targetNode.parentNode?.insertBefore(hook, targetNode);
    requestAnimationFrame(() => targetNode.remove());
    /** @type {HTMLElement|undefined} */
    let copy;
    processDOM(scopeNode, template);
    const update = (/** @type {any} */ update) => {
      if (!!update) {
        if (copy) {
          copy.remove();
        }
        copy = template;
        hook.parentNode?.insertBefore(/** @type {HTMLElement} */ (copy), hook);
      } else if (!update && copy) {
        copy.remove();
        copy = undefined;
      }
    };
    return {
      update,
    };
  },
};
DirectiveRegistry.add(ifDirective);
